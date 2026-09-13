---
title: Email
description: Configure SMTP delivery to receive password-reset emails from your instance.
---

Lumina Finance uses email to send password-reset links. This page explains how to connect your email provider through SMTP and check that those links reach your inbox.

## Setting up email delivery {#configure-smtp}

:::warning[Reset links are logged to console by default]
By default, Lumina Finance writes outgoing emails, which contain password reset links and tokens, in the log. Keep those logs private and remove reset links before sharing them.
:::

By default, Lumina Finance writes outgoing emails to the app's logs. To receive them in your inbox, you'll need to connect LF to an SMTP server using the connection details and credentials supplied by your email provider.

Before you begin, make sure [`APP_URL`](environment-variables.md#app_url) matches your [instance's URL](instance-url.md), since LF uses it to create the links in those emails. Then, add your provider's settings to `.env`:

```dotenv
EMAIL_BACKEND=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=replace-with-your-smtp-username
SMTP_PASSWORD='replace-with-your-smtp-password'
SMTP_USE_TLS=true
MAIL_FROM=optional
```

### Setting the sender address

[`MAIL_FROM`](environment-variables.md#mail_from) defaults to your SMTP username. If that username isn't an email address, or your provider requires a different sender address, set `MAIL_FROM` explicitly. Outgoing messages use the display name `Lumina Finance (Self-Hosted)` alongside that address.

## Applying and checking the settings {#test-delivery}

Once you've saved the `.env` file, recreate the app to load the new settings. Then, request a password reset on the login screen. Check that the email arrives, its link opens your instance, and the reset succeeds with the new password being saved.

## Troubleshooting

If the email doesn't arrive, check your junk folder and your provider's delivery log before changing the settings.

**If you've tried too many times, you may run into a builtin rate limiter.** By default, LF limits repeated requests to prevent abuse and won't send another email while an unused, unexpired reset link exists. A link lasts 15 minutes and each user account can receive up to three reset emails in a rolling 24-hour period. If you'd like to twaek these settings, please reference [full list of SMTP related configuration options](environment-variables.md#password-reset-and-email) which covers the settings for these limits.
