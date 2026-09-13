---
title: Signing keys and JWKS
description: Use your own signing keys and find the public keys LF publishes for token verification.
---

Lumina Finance uses signing keys to verify that your session tokens came from your instance and haven't been altered.

On a new installation, LF generates these keys and saves them as `access_private.pem` and `refresh_private.pem` under `/data/keys`. The example Compose file persists this directory as part of the `lumina_data` volume, so you don't need to supply your own keys to use LF.

These keys are separate from [`APP_ENCRYPTION_KEY`](environment-variables.md#app_encryption_key), which encrypts secrets stored in the database. Replacing a signing key affects tokens signed with it, but doesn't change how those stored secrets are encrypted.

## Using your own keys

To use your own keys, replace `access_private.pem` and `refresh_private.pem` in the app's `/data/keys` directory with two separate, valid, unencrypted RSA private keys in PEM format. Keep the existing filenames and make sure LF can read both files; you don't need to change any mounts or environment variables when using these default paths.

Once you've replaced the files, restart the app to load the keys.

## Using another directory or filename

If you'd like to use another directory or different filenames, set [`JWT_ACCESS_PRIVATE_KEY_PATH`](environment-variables.md#jwt_access_private_key_path) and [`JWT_REFRESH_PRIVATE_KEY_PATH`](environment-variables.md#jwt_refresh_private_key_path) in `.env` to the full paths inside the app container.

:::example
To use `access.pem` and `refresh.pem` in `/data/signing-keys`, set:

```dotenv
JWT_ACCESS_PRIVATE_KEY_PATH=/data/signing-keys/access.pem
JWT_REFRESH_PRIVATE_KEY_PATH=/data/signing-keys/refresh.pem
```
:::

## Verifying JWT signatures

LF exposes its public keys as a JSON Web Key Set (JWKS) at `/api/auth/.well-known/jwks.json`. Gateways and reverse proxies that support JWT verification can use these keys to verify JWT signatures before forwarding requests to the application. For details on how to configure this, please refer to the documentation of the gateway or reverse proxy that you are using.