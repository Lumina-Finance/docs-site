---
title: Setting instance URL
description: Set or change your instance URL and keep access to your account when using passkeys.
---

Lumina Finance uses `APP_URL` to configure CORS and is required if you want to use Passkeys, SSO, or enable password reset emails. This guide covers setting that address and updating your configuration when it changes.

:::tip
Even if you don’t use these features, we still recommend setting `APP_URL`, as leaving it unset allows all origins by default.
:::

## Setting the URL

Set [`APP_URL`](environment-variables.md#app_url) to the full address you use to access Lumina Finance, such as `https://lumina-finance.example.com`. Include the scheme (`https://`) and the port if it isn't the default, and leave off any path or trailing slash. Lumina Finance uses the value exactly as written, so a trailing slash, as in `https://lumina-finance.example.com/`, stops passkeys from working, since your browser reports the address without one.

Lumina Finance uses this address for password-reset links and sign-in redirects, and includes it in its allowed browser origins (CORS). We recommend setting `APP_URL` explicitly, since leaving it empty will default to allowing all origins. Lumina Finance also works out the passkey settings, `WEBAUTHN_RP_ID` and `WEBAUTHN_ORIGINS`, from `APP_URL`. As long as you open Lumina Finance at the address in `APP_URL`, you don't need to set either of them.

:::info[Passkeys need HTTPS and a domain name]
Passkeys only work over HTTPS or at `http://localhost`. They also don't work at a bare IP address, such as `http://192.168.1.10:8080`.
:::

## Changing an existing URL

:::danger[Ensure you have multiple MFA methods set up]
If you use passkeys, make sure you can sign in with your password and a second MFA method, such as an authenticator app, before changing the URL.

A change to the URL, and consequently the passkey domain and relying party ID, prevents your existing passkeys from working at the new address and could leave you locked out. **Another passkey registered for the old domain will not protect against this.**
:::

To switch to another address:

1. Replace `APP_URL` in `.env` with the new address
2. If you set `WEBAUTHN_ORIGINS` explicitly, update its list to include the new address
3. If you set `WEBAUTHN_RP_ID` explicitly, only replace it if the new hostname is neither that domain nor one of its subdomains. Use the new domain name, without a scheme, port, or path (e.g., `example.com`)
4. If you use single sign-on, update the [callback URL registered with your provider](single-sign-on.md#register-lf-with-the-provider) to `<APP_URL>/auth/oidc/callback`, using the new `APP_URL`.
5. Recreate the app to load the new address:

    ```bash
    docker compose up -d --force-recreate app
    ```
