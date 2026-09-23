---
title: Rotating the encryption key
description: Replace your application encryption key and re-encrypt stored secrets with the new key.
---

Your application encryption key protects stored secrets, including those used for two-factor authentication and single sign-on. This page explains how to rotate the key, re-encrypt those secrets, and apply the replacement to your instance.

## Required preparations

:::warning[Before you begin]
Please back up your entire instance, including the current encryption keys, before you begin.
:::

Lumina Finance uses [`APP_ENCRYPTION_KEY`](environment-variables.md#app_encryption_key) to encrypt stored secrets, including authenticator secrets and OIDC client secrets. As a result of changing your key, your secrets will be re-encrypted with the new key. To make sure that you can still roll back to your backup, you must retain your old encryption keys alongside your backup.

:::danger[Losing the key permanently locks you out]
If you lose the encryption key, you and everyone else on your instance will be permanently locked out, and there's no way to recover without the original key. Lumina Finance checks the key every time it starts, and won't start at all if the key is missing or doesn't match the one your stored secrets were encrypted with.
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

Save the generated value somewhere secure before continuing. You'll need the same value for both the rotation command and your `.env` file, and LF does not automatically save the encryption key.

### Re-encrypting the stored secrets

With the **app still stopped**, run the following command, replacing `your-new-key` with the value you just generated:

```bash
docker compose run --rm --no-deps app rotate-app-encryption-key "your-new-key"
```

The command re-encrypts the stored secrets. If it reports an error, keep the app stopped and keep both keys while you establish whether the database changes were saved.

### Saving the replacement key

Once the rotation succeeds, set `APP_ENCRYPTION_KEY` in `.env` to the exact replacement key, **while the app is still stopped**:

```dotenv
APP_ENCRYPTION_KEY=your-new-key
```

The rotation command removes the old `/data/secrets/app_encryption_key` file after saving the database changes, and from this point onward, it will use the new key you set in the `APP_ENCRYPTION_KEY` variable.

### Starting the app with the new key

Recreate the app to load the replacement key:

```bash
docker compose up -d --force-recreate app
```

Then, check that Lumina Finance starts and that you can use your existing TOTP authenticator and SSO. Keep the old key with any database backup made before the rotation, as the replacement key cannot decrypt that backup's secrets.
