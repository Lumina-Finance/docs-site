---
title: Rotating the encryption key
description: Replace your application encryption key and re-encrypt stored secrets with the new key.
---

Your application encryption key protects stored secrets, including those used for two-factor authentication and single sign-on. This page explains how to rotate the key, re-encrypt those secrets, and apply the replacement to your instance.

## Before you begin

:::warning[Back up your database and existing keys before you begin]
:::

LF uses [`APP_ENCRYPTION_KEY`](environment-variables.md#app_encryption_key) to encrypt stored secrets, including authenticator secrets and OIDC client secrets. To change it, you'll need to re-encrypt those values with the replacement key. Changing the value in `.env` alone doesn't do this.

Before beginning, we recommend backing up your database **and its current encryption key**. The saved database still needs the old key to read its encrypted secrets.

:::danger[Keep the app stopped during rotation]
Stop the app before rotating the key and keep it stopped until the rotation has completed and you've saved the replacement key in `.env`. Starting it during this process may result in data loss and/or data corruption.
:::

## Rotating the key {#rotate-the-key}

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

With the app still stopped, run the following command, replacing `your-new-key` with the value you just generated:

```bash
docker compose run --rm --no-deps app rotate-app-encryption-key "your-new-key"
```

The command re-encrypts the stored secrets and updates the database's key fingerprint together. If it reports an error, keep the app stopped and keep both keys while you establish whether the database changes were saved.

### Saving the replacement key

Once the rotation succeeds, set `APP_ENCRYPTION_KEY` in `.env` to the exact replacement key:

```dotenv
APP_ENCRYPTION_KEY=your-new-key
```

The rotation command removes the old `/data/secrets/app_encryption_key` file after saving the database changes, and from this point onward, it will use the new key you set in the `APP_ENCRYPTION_KEY`.

### Starting LF with the new key

Recreate the app to load the replacement key:

```bash
docker compose up -d --force-recreate app
```

Then, check that LF starts and that you can use your existing TOTP authenticator or SSO. Keep the old key with any database backup made before the rotation, as the replacement key cannot decrypt that backup's secrets.

## Understanding an interrupted rotation {#recover-an-interrupted-rotation}

If the command stops before saving its database changes, the stored secrets still use the old key. If it stops after saving them, they use the replacement key even if removing the old key file failed.

For this reason, don't assume an interrupted command undid the rotation. Keep the app stopped and retain both keys while you check its output. LF checks that its configured key matches the database at startup, and a newly generated key cannot recover secrets encrypted with a lost key.
