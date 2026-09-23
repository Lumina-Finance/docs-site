---
title: Single sign-on
description: Configure an OpenID Connect provider for your Lumina Finance instance.
---

Single sign-on lets you use an existing identity provider to sign in to Lumina Finance. This page explains how to connect an OpenID Connect (OIDC) provider to your instance.

## Registering LF with your provider {#register-lf-with-the-provider}

Before you begin, make sure your [instance's URL](instance-url.md) is set correctly and opens in your browser. Lumina Finance uses this address to bring you back from the provider after you sign in.

To get started, first register Lumina Finance as an OIDC client with your provider, using your instance's address followed by `/auth/oidc/callback` as the redirect URI.

:::example
For an instance at `https://lumina-finance.example.com`, the redirect URI is `https://lumina-finance.example.com/auth/oidc/callback`.
:::

## Configuring the provider in LF {#configure-lf}

Once you have Lumina Finance registered as a client, add the provider's values to your `.env` file. Setting [`OIDC_GENERIC_CLIENT_ID`](environment-variables.md#oidc_generic_client_id) turns SSO on, so add `OIDC_GENERIC_ISSUER`, `OIDC_GENERIC_CLIENT_SECRET` and `APP_URL` at the same time.

:::warning[Incomplete SSO settings stop the app from starting]
Once `OIDC_GENERIC_CLIENT_ID` is set, Lumina Finance checks the rest of the SSO settings when it starts. If the issuer, client secret or `APP_URL` is missing, the issuer doesn't use `https://`, or the scopes don't include `openid`, the app won't start. Check the app's logs with `docker compose logs app` to see which setting needs fixing.
:::

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

`OIDC_GENERIC_DISPLAY_NAME` sets the provider's name on the sign-in button. It will also use this name to retrieve the OIDC provider's logo from selfh.st’s icon collection. 

The scopes, defined in `OIDC_GENERIC_SCOPES`, tell the provider what information Lumina Finance requests. The default, `openid email profile`, requests your email address and profile information alongside the required `openid` scope.

You can remove `profile` if you'd rather not share your name, and enter it on the sign-up form instead. Keep `openid` and `email`, though. Lumina Finance won't start without `openid`, and it needs an email address from your provider to create an account or link one. Most providers only send the email address when `email` is requested, so without it, new sign-ups and new links fail, although people who have already linked their account can still sign in.

### Requiring a verified email address

By default, Lumina Finance requires the provider to confirm that your email address is verified before it can create a user account through single sign-on. Some self-hosted providers may not verify email addresses, or may not report them as verified. If new sign-ups show <UiElement>Sign-in failed</UiElement> with "Identity provider did not verify the email address", set [`OIDC_REQUIRE_VERIFIED_EMAIL`](environment-variables.md#oidc_require_verified_email) to `false`.

## Existing accounts

Lumina Finance never links a provider sign-in to an existing account automatically, even when the email addresses match. If someone who already has a Lumina Finance account signs in through the provider for the first time, they'll see <UiElement>Account already exists</UiElement> instead.

To use the provider from then on, they sign in with their password, go to <UiPath>Settings → Security</UiPath>, choose <UiElement>Link</UiElement> next to the provider under <UiElement>Sign-in providers</UiElement>, and complete any MFA steps as required.
