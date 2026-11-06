---
title: Database role passwords
description: Change the passwords of the database roles the app uses, and see what to expect when you do.
---

The app uses two database roles of its own, besides the admin role that [`DB_PASSWORD`](environment-variables.md#db_password) belongs to. `lumina_migrator` owns the schema and runs migrations, and `lumina_app` handles requests. Their passwords are [`MIGRATOR_DB_PASSWORD`](environment-variables.md#migrator_db_password) and [`APP_DB_PASSWORD`](environment-variables.md#app_db_password).

## How the app picks the passwords

Every time it starts, the app connects as the admin role and sets both roles' passwords in the database to the values it has resolved. For each role it uses, in this order:

1. The value in your environment, such as `.env`
2. The file the app saved earlier, `/data/secrets/migrator_db_password` or `/data/secrets/app_db_password`
3. A new password, which it generates and saves in that file

Because the database follows whatever the app resolves, changing a password never requires a command in PostgreSQL. It also means a password you change by hand in the database is overwritten at the next start.

## Changing the passwords

:::warning[Before you begin]
Back up your instance, including the `/data/secrets` directory. Your `DB_PASSWORD` must be correct, since the app uses it to set the new passwords.
:::

### Setting new values in `.env`

Generate a separate password for each role:

```bash
openssl rand -hex 24
```

Put them in `.env`, then recreate the app container so it reads the file. `docker compose restart` doesn't reread `.env`:

```dotenv
MIGRATOR_DB_PASSWORD=replace-with-a-generated-password
APP_DB_PASSWORD=replace-with-another-generated-password
```

```bash
docker compose up -d app
```

The old passwords stop working as soon as the app has started. While `.env` sets a value, the file in `/data/secrets` for that role is ignored and left as it was. If you later remove the setting, the app goes back to the value in the file and sets the role to it, so update or delete the file too if you don't want the older password back.

### Letting the app generate new ones

If you never set the passwords yourself, delete the file for the role you want to change, then start the app again:

```bash
docker compose exec app rm /data/secrets/app_db_password
docker compose restart app
```

The app generates a new password, saves it in the same place and updates the role. You can also write a password of your own into the file instead of deleting it.

## What to expect

- Nobody is signed out, and the data isn't touched
- You don't lose access if the files are lost. The app generates new passwords and updates the roles. This is different from [the encryption key](encryption-keys.md), which can't be recovered
