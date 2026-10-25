---
title: Closing registration
description: Stop new accounts being created once everyone who'll use the app has one.
---

By default, anyone who can reach your instance can create an account. Once you and everyone else who'll use the app have accounts, you can close registration so nobody else can create one.

To close it, set [`REGISTRATION_ENABLED`](environment-variables.md#registration_enabled) to `false` in `.env`, then run `docker compose up -d` again to apply it:

```dotenv
REGISTRATION_ENABLED=false
```

Once registration is closed:

- The login page no longer offers sign-up, and going to the sign-up page takes you back to the login page.
- If you've set up [single sign-on](single-sign-on.md), someone without an account who signs in through the provider returns to the login page with "Registration is closed on this instance." instead of getting a new account.
- People who already have accounts sign in, reset their passwords, and manage their passkeys, two-factor authentication and linked providers as usual.

To open registration again, set it back to `true`, or remove the line, and run `docker compose up -d` again.

:::warning[Create your account first]
There's no exception for the first account. If you close registration before anyone has signed up, nobody can create an account until you open it again.
:::
