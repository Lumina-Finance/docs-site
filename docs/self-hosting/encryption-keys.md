---
title: Encryption and hash keys
description: Rotate your application encryption key, and back up or reset the bank transaction hash key.
---

Your application encryption key protects stored secrets, including those used for two-factor authentication and single sign-on. The bank transaction hash key lets the app skip transactions you already have when you import a statement again. This page explains how to rotate the encryption key, re-encrypt those secrets, and apply the replacement to your instance, and how to back up or reset the hash key.

## Required preparations

:::warning[Before you begin]
Please back up your entire instance, including the current encryption keys, before you begin.
:::

Lumina Finance uses [`APP_ENCRYPTION_KEY`](environment-variables.md#app_encryption_key) to encrypt stored secrets, including authenticator secrets and OIDC client secrets. As a result of changing your key, your secrets will be re-encrypted with the new key. To make sure that you can still roll back to your backup, you must retain your old encryption keys alongside your backup.

:::danger[Losing the key permanently locks you out]
If you lose the encryption key, you and everyone else on your instance will be permanently locked out, and there's no way to recover without the original key. The app checks the key every time it starts, and won't start at all if the key is missing or doesn't match the one your stored secrets were encrypted with.
:::

If you didn't set `APP_ENCRYPTION_KEY` yourself, the key is saved in `/data/secrets/app_encryption_key`, in the app's data volume rather than the database, so a database backup on its own doesn't include it. Please double check to make sure that the encryption keys are backed up along with the database in a safe and secure place before continuing.

## Rotating the key {#rotate-the-key}

:::danger[Keep the app stopped during rotation]
Stop the app before rotating the key and keep it stopped until the rotation has completed and you've saved the replacement key in `.env`. Starting it during this process may result in data loss and/or data corruption.
:::

### Stopping the app

Stop the app container while leaving PostgreSQL running so the rotation command can access the database:

```bash
docker compose stop app
```

### Generating a replacement key

You can either generate your own replacement Fernet key, or use the built-in generator:

```bash
docker compose run --rm --no-deps app generate-app-encryption-key
```

Save the generated value somewhere secure before continuing. You'll need the same value for both the rotation command and your `.env` file, and the app does not automatically save the encryption key.

### Re-encrypting the stored secrets

With the **app still stopped**, run the following command, replacing `your-new-key` with the value you just generated:

```bash
docker compose run --rm --no-deps app rotate-app-encryption-key "your-new-key"
```

The command re-encrypts all the stored secrets in one go, so if it reports an error, nothing has been changed. Keep the app stopped, fix the problem it reports, and run the command again.

If the command refuses to rotate because the new key is already in use, check where you are in the process:

- If you've already finished the rotation, there's nothing left to do. Start the app and check that your two-factor sign-in still works.
- If you set `APP_ENCRYPTION_KEY` to the new key before running the command, put the old key back in `.env` and run the command again.

### Saving the replacement key

Once the rotation succeeds, set `APP_ENCRYPTION_KEY` in `.env` to the exact replacement key, **while the app is still stopped**:

```dotenv
APP_ENCRYPTION_KEY=your-new-key
```

If the app generated your old key, the rotation command also removes the old `/data/secrets/app_encryption_key` file. If it can't, it prints a note saying so, and the app won't start until you delete the file yourself. From this point onward, the app uses the new key you set in `APP_ENCRYPTION_KEY`.

### Starting the app with the new key

Recreate the app to load the replacement key:

```bash
docker compose up -d --force-recreate app
```

Then, check that the app starts and that you can use your existing TOTP authenticator and SSO. Keep the old key with any database backup made before the rotation, as the replacement key cannot decrypt that backup's secrets.

## The bank transaction hash key {#bank-transaction-hash-key}

When you import an OFX or QFX statement, Lumina Finance doesn't keep your bank account numbers or the bank's transaction IDs. It keeps only a keyed hash of each one, so importing the same statement again skips the transactions you already have. The app makes those hashes with [`BANK_TRANSACTION_HASH_KEY`](environment-variables.md#bank_transaction_hash_key). The key can't be rotated, since the app doesn't keep what the hashes were made from.

### Backing up the key

If you didn't set `BANK_TRANSACTION_HASH_KEY` yourself, the app generates it on first start and saves it in `/data/secrets/bank_transaction_hash_key`, next to the generated encryption key and outside the database. Back it up with your database, and keep it with every database backup you might restore.

The database records which key its hashes were made with, and the app checks the key every time it starts. It won't start if the key is missing or isn't the one your saved transactions were hashed with. If you restore a backup, restore its key as well, either into `BANK_TRANSACTION_HASH_KEY` in `.env` or into `/data/secrets/bank_transaction_hash_key`. If you set both, they must hold the same key.

### Resetting a lost key {#reset-the-bank-transaction-hash-key}

:::warning[Resetting means duplicate transactions on re-import]
Your transactions and their balances stay as they are, but the app can no longer tell which ones came from a statement. If you import a statement you've already imported, its transactions come in again, so you'll need to remove the duplicates yourself.
:::

If the key is lost, you can tell the app to start over with a new one. Stop the app container while leaving PostgreSQL running:

```bash
docker compose stop app
```

Then run the reset command. It uses the key in `BANK_TRANSACTION_HASH_KEY` if you've set one, or else a key file already at `/data/secrets/bank_transaction_hash_key`. If there's neither, it generates a new key and saves it in that file:

```bash
docker compose run --rm app reset-bank-transaction-hash-key
```

The command works even if you've lost the app's data volume or restored your database onto a new host.

If the command reports an error, fix the problem and run it again. The app may not start until the command succeeds.

Once it succeeds, start the app:

```bash
docker compose up -d app
```

If the app won't start because the key is missing and you haven't imported an OFX or QFX statement yet, you can reset the key without losing anything.
