---
title: Getting started
description: Download the Docker Compose and environment files, set your database password, and start Lumina Finance.
---

import {DeploymentFiles} from '@site/src/components/deployment-files/DeploymentFiles';

Thanks for giving Lumina Finance a try! Getting your own instance running is pretty straightforward. If you've used Docker Compose before, you'll feel right at home, and if you haven't, don't worry, we'll take it one step at a time.

## Checking the compatibility of your system

The app runs on 64-bit systems only, though it comes with images for both `x86` (`linux/amd64`) and `ARM` (`linux/arm64`). That covers most modern computers and servers, including a Raspberry Pi running the 64-bit version of Raspberry Pi OS.

## Getting the necessary files

Before you begin, make sure Docker and the Docker Compose plugin are installed. Then, create a new directory, and copy the compose file below into the directory:

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
If the app generates the encryption key and db role passwords for you (i.e., you choose not to specify the following env vars), you must persist the `/data/secrets` directory inside the container, since that's where the generated secrets are stored. Losing these secrets will permanently lock everyone out of your instance, and you may lose all your data. More is explained in [Rotating the encryption key](encryption-keys.md).
:::

The app uses 3 additional secrets in addition to the database password: `APP_ENCRYPTION_KEY`, `MIGRATOR_DB_PASSWORD`, and `APP_DB_PASSWORD`. They are used to encrypt sensitive data like the OIDC client secrets and for enforcing RLS for db level user data separation.

Before you start using the app, we recommend setting your application encryption key and database role passwords explicitly. If you leave them unset, the app will generate them and save them in `/data/secrets` inside its container. 

If you'd like to set the encryption key after the app has generated one, copy the generated key from `/data/secrets/app_encryption_key` into `.env`. It won't start with a different key, so to change it, follow [Rotating the encryption key](encryption-keys.md) instead.

#### Generating the key and passwords

For encrypting things like OIDC client secrets, the app uses a Fernet key. You can either generate your own or use the built-in generator:

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

Set [`APP_URL`](environment-variables.md#app_url) to the address you'll use to open the app, such as `https://lumina-finance.example.com`. It's needed for passkeys, single sign-on and password reset emails, and we recommend setting it even if you don't use them. [Setting the instance URL](instance-url.md) explains the format and what it's used for.

The app doesn't serve HTTPS on its own, so you'll want to put it behind a reverse proxy. Keep in mind that passkeys won't work without HTTPS, even with `APP_URL` set.

## Starting the app

To start the app, simply run `docker compose up -d`, and open `http://localhost:8080` once it is ready.

## Where to go from here

Check out the guides under Common configurations and Advanced configurations in the sidebar for further available config options. A full list of env vars are also provided in the [environment variables page](environment-variables.md) as reference.

If you have any questions, feedback, or feature requests, please feel free to share your thoughts and reach out to us at [r/LuminaFinance](https://reddit.com/r/LuminaFinance) and [GitHub discussions](https://github.com/Lumina-Finance/lumina-finance/discussions).

Happy tinkering and we hope you enjoy using Lumina Finance!
