---
title: Getting started
description: Download the Docker Compose and environment files, set your database password, and start Lumina Finance.
---

import {ComposeFile, EnvironmentDownload} from '@site/src/components/deployment-files/DeploymentFiles';

This guide walks you through how to set up your own Lumina Finance instance at home.

## Getting the necessary files

Before you begin, make sure Docker and the Docker Compose plugin are installed. Create a directory for Lumina Finance, then copy the Compose file below into the directory:

<ComposeFile />

<EnvironmentDownload />

## Setting up the environment

### Setting a database password

At the minimum, you should change the database password in the example env file to something secure. Using OpenSSL for example, you can generate a random phrase by running:

```bash
openssl rand -hex 24
```

Then, replace `DB_PASSWORD` with the generated password.

### Setting encryption keys and db role passwords

:::danger[Persisting the secrets directory]
If secrets are auto generated, you must persist the data in the `/data/secrets` directory inside the container. Failure to so can result in permanent data corruption and/or data loss.
:::

Lumina Finance uses 3 additional secrets in addition to the database password: `APP_ENCRYPTION_KEY`, `MIGRATOR_DB_PASSWORD`, and `APP_DB_PASSWORD`. They are used to encrypt sensitive data like the OIDC client secrets and for enforcing RLS for db level user data separation.

Before you start using Lumina Finance, we recommend setting your application encryption key and database role passwords explicitly. If you leave them unset, Lumina Finance will generate them and save them in `/data/secrets` inside the app container. 

#### Generating the key and passwords

For encrypting things like OIDC client secrets, Lumina Finance uses a Fernet key. You can either generate your own or use the builtin generator:

```bash
docker compose run --rm --no-deps app generate-app-encryption-key
```
For the two database role passwords, you can generate your own or run `openssl rand -hex 24` separately for each value.

#### Saving the key and passwords

Add all three values to their respective entry in the `.env` file:

```dotenv
APP_ENCRYPTION_KEY=replace-with-the-generated-fernet-key
MIGRATOR_DB_PASSWORD=replace-with-a-generated-password
APP_DB_PASSWORD=replace-with-another-generated-password
```

Without these settings, the generated values are saved as `app_encryption_key`, `migrator_db_password`, and `app_db_password` under `/data/secrets`.

## Starting Lumina Finance

Simply run: `docker compose up -d`, and open `http://localhost:8080` once it is ready.

Check out the [common configurations page](common-configurations.md) and the [advanced configurations page](advanced-configurations.md) for further available config options. A full list of env vars are also provided in the [environment variables page](environment-variables.md) as reference.

Happy tinkering and we hope you enjoy using Lumina Finance!
