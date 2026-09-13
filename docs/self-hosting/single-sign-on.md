---
title: Single sign-on
description: Configure an OpenID Connect provider for your LF instance.
---

Single sign-on lets you use an existing identity provider to sign in to LF. This page explains how to connect an OpenID Connect (OIDC) provider to your instance.

## Registering LF with your provider {#register-lf-with-the-provider}

Before you begin, make sure your [instance's URL](instance-url.md) is set correctly and opens in your browser. LF uses this address to bring you back from the provider after you sign in.

Register LF as an OIDC client with your provider, using your instance's address followed by `/auth/oidc/callback` as the redirect URI.

:::example
For an instance at `https://lumina-finance.example.com`, the redirect URI is `https://lumina-finance.example.com/auth/oidc/callback`.
:::

## Configuring the provider in LF {#configure-lf}

Add the provider's values to your `.env` file. SSO is then enabled when you set [`OIDC_GENERIC_CLIENT_ID`](environment-variables.md#oidc_generic_client_id), the issuer, client secret, and `APP_URL`. Incomplete settings will prevent the app from starting.

:::example

```dotenv
APP_URL=https://lumina-finance.example.com
OIDC_GENERIC_ISSUER=https://identity.example.com
OIDC_GENERIC_CLIENT_ID=replace-with-your-client-id
OIDC_GENERIC_CLIENT_SECRET='replace-with-your-client-secret'
OIDC_GENERIC_DISPLAY_NAME='Single sign-on'
OIDC_GENERIC_SCOPES='openid email profile'
OIDC_REQUIRE_VERIFIED_EMAIL=true
```
:::

### Setting the provider name and scopes

`OIDC_GENERIC_DISPLAY_NAME` sets the provider's name on the sign-in button. It will also use this name to retrieve the OIDC provider's logo from selfh.st’s icon collection through jsDelivr. 

The scopes, defined in `OIDC_GENERIC_SCOPES`, tell the provider what information LF requests. The default, `openid email profile`, includes your email address and profile information alongside the required `openid` scope. If you change this list, make sure it still includes `openid`.

### Requiring a verified email address

By default, LF requires the provider to confirm that your email address is verified before it can create an LF user account through single sign-on. If your OIDC provider doesn't verify email addresses, set [`OIDC_REQUIRE_VERIFIED_EMAIL`](environment-variables.md#oidc_require_verified_email) to `false` to allow user account creation without that confirmation.

This setting only changes the requirement for creating a user account. It doesn't link a provider to an existing LF user account with the same email address, and you'll need to complete that link from within your user account.
