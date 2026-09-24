---
title: Getting started
description: Download the Docker Compose and environment files, set your database password, and start Lumina Finance.
---

import {DeploymentFiles} from '@site/src/components/deployment-files/DeploymentFiles';

Thanks for giving Lumina Finance a try! Getting your own instance running is pretty straightforward. If you've used Docker Compose before, you'll feel right at home, and if you haven't, don't worry, we'll take it one step at a time.

## Checking your system

Lumina Finance only runs on 64-bit systems, using the `linux/amd64` or `linux/arm64` images. 32-bit systems, such as the 32-bit version of Raspberry Pi OS, aren't supported.

Once Docker is installed, you can check which platform it uses by running:

```bash
docker version --format '{{.Server.Os}}/{{.Server.Arch}}'
```

This should print `linux/amd64` or `linux/arm64`. The latter is sometimes shown as `arm64/v8` or `aarch64`. On a Linux host, also run `getconf LONG_BIT`, which should print `64`. Don't rely on `uname -m` on its own, since it only reports the kernel, which can be 64-bit even when the rest of the system is 32-bit.

## Getting the necessary files

Before you begin, make sure Docker and the Docker Compose plugin are installed. Create a directory for Lumina Finance, then copy the Compose file below into the directory:

<DeploymentFiles />

## Setting up the environment

### Setting a database password

At the minimum, you should change the database password in the example env file to something secure. Using OpenSSL for example, you can generate a random phrase by running:

```bash
openssl rand -hex 24
```

Then, replace `DB_PASSWORD` with the generated password.

### Setting encryption keys and db role passwords

:::danger[Persisting the secrets directory]
If Lumina Finance generates the encryption key for you, you must persist the `/data/secrets` directory inside the container, since that's where the key is saved. Losing the key permanently locks everyone out of your instance, as explained in [Rotating the encryption key](encryption-keys.md).
:::

Lumina Finance uses 3 additional secrets in addition to the database password: `APP_ENCRYPTION_KEY`, `MIGRATOR_DB_PASSWORD`, and `APP_DB_PASSWORD`. They are used to encrypt sensitive data like the OIDC client secrets and for enforcing RLS for db level user data separation.

Before you start using Lumina Finance, we recommend setting your application encryption key and database role passwords explicitly. If you leave them unset, Lumina Finance will generate them and save them in `/data/secrets` inside the app container. 

If you'd like to set the encryption key after Lumina Finance has generated one, copy the generated key from `/data/secrets/app_encryption_key` into `.env`. Lumina Finance won't start with a different key, so to change it, follow [Rotating the encryption key](encryption-keys.md) instead.

#### Generating the key and passwords

For encrypting things like OIDC client secrets, Lumina Finance uses a Fernet key. You can either generate your own or use the built-in generator:

```bash
docker compose run --rm --no-deps app generate-app-encryption-key
```
For the two database role passwords, you can generate your own or run `openssl rand -hex 24` separately for each value.

#### Saving the key and passwords

The example `.env` file doesn't include these entries, so add all three values to it as new lines:

```dotenv
APP_ENCRYPTION_KEY=replace-with-the-generated-fernet-key
MIGRATOR_DB_PASSWORD=replace-with-a-generated-password
APP_DB_PASSWORD=replace-with-another-generated-password
```

Without these settings, the generated values are saved as `app_encryption_key`, `migrator_db_password`, and `app_db_password` under `/data/secrets`.

### Setting the instance URL

Set [`APP_URL`](environment-variables.md#app_url) to the address you'll use to open Lumina Finance, such as `https://lumina-finance.example.com`. It's needed for passkeys, single sign-on and password reset emails, and we recommend setting it even if you don't use them. [Setting the instance URL](instance-url.md) explains the format and what it's used for.

Lumina Finance doesn't serve HTTPS on its own, so you'll want to put it behind a reverse proxy. Keep in mind that passkeys won't work without HTTPS, even with `APP_URL` set.

## Starting Lumina Finance

Simply run: `docker compose up -d`, and open `http://localhost:8080` once it is ready.

Check out the guides under Common configurations and Advanced configurations in the sidebar for further available config options. A full list of env vars are also provided in the [environment variables page](environment-variables.md) as reference.

Happy tinkering and we hope you enjoy using Lumina Finance!
