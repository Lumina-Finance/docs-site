---
title: Signing keys and JWKS
description: Use your own signing keys and find the public keys Lumina Finance publishes for token verification.
---

Lumina Finance uses signing keys to verify that your session tokens came from your instance and haven't been altered. These keys are separate from [`APP_ENCRYPTION_KEY`](environment-variables.md#app_encryption_key), which encrypts secrets stored in the database.

The first time it starts, Lumina Finance generates these keys and saves them as `access_private.pem` and `refresh_private.pem` under `/data/keys`. It checks both keys every time it starts, and if either one is missing or invalid, it generates a replacement.

## Using your own keys

To use your own keys, replace `access_private.pem` and `refresh_private.pem` in the app's `/data/keys` directory with two separate RSA private keys in PEM format, without a passphrase. We recommend 4096-bit keys, which is what Lumina Finance generates:

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out access_private.pem
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:4096 -out refresh_private.pem
```

Keep the existing filenames and make sure Lumina Finance can read both files. You don't need to change any mounts or environment variables when using these default paths.

:::warning[Invalid key files are deleted]
When the app starts, it deletes a key file that's empty, protected by a passphrase or can't be read as a private key, and generates a new key in its place. This applies to files at a custom path too, so keep a copy of your keys outside the container. Other key types, such as EC keys, pass this check but stop the app from starting, since Lumina Finance only supports RSA keys.
:::

Once you've replaced the files, restart the app to load the keys.

## Using another directory or filename

If you'd like to use another directory or different filenames, set [`JWT_ACCESS_PRIVATE_KEY_PATH`](environment-variables.md#jwt_access_private_key_path) and [`JWT_REFRESH_PRIVATE_KEY_PATH`](environment-variables.md#jwt_refresh_private_key_path) in `.env` to the full paths inside the app container. Double-check both paths, since a path that points to a missing file gets a newly generated key rather than an error.

:::example
To use `access.pem` and `refresh.pem` in `/data/signing-keys`, set:

```dotenv
JWT_ACCESS_PRIVATE_KEY_PATH=/data/signing-keys/access.pem
JWT_REFRESH_PRIVATE_KEY_PATH=/data/signing-keys/refresh.pem
```
:::

## Verifying JWT signatures

Lumina Finance exposes its public keys as a JSON Web Key Set (JWKS) at `/api/auth/.well-known/jwks.json`. Gateways and reverse proxies that support JWT verification can use these keys to verify JWT signatures before forwarding requests to the application. For details on how to configure this, please refer to the documentation of the gateway or reverse proxy that you are using.

If your gateway caches the key set, it may keep checking tokens against the old key after you replace one. Changing [`JWT_ACCESS_KID`](environment-variables.md#jwt_access_kid) when you replace the access key gives the new key a different identifier, which prompts gateways that look keys up by identifier to fetch the key set again.