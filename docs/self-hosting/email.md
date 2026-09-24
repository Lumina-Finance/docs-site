---
title: Email
description: Configure SMTP delivery to receive password-reset emails from your instance.
---

Lumina Finance uses email to send password-reset links. This page explains how to connect your email provider through SMTP and check that those links reach your inbox.

## Setting up email delivery {#configure-smtp}

:::info[Reset links are logged to console by default]
By default, the app writes outgoing emails, which contain password reset links and tokens, in the log.
:::

By default, outgoing emails are written to the app's logs. To receive them in your inbox, you'll need to connect the app to an SMTP server using the connection details and credentials supplied by your email provider.

Before you begin, make sure [`APP_URL`](environment-variables.md#app_url) matches the domain you use to access the app, since it uses that address to create the links in those emails. Then, add your provider's settings to `.env`:

```dotenv
EMAIL_BACKEND=smtp
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=replace-with-your-smtp-username
SMTP_PASSWORD='replace-with-your-smtp-password'
SMTP_USE_TLS=true
# Optional, see "Setting the sender address"
#MAIL_FROM=lumina-finance@example.com
```

The app connects to the server and then switches the connection to TLS, which is known as STARTTLS and is usually offered on port 587. Servers that only accept TLS from the start, usually on port 465, aren't supported.

### Setting the sender address

[`MAIL_FROM`](environment-variables.md#mail_from) defaults to your SMTP username. If that username isn't an email address, or your provider requires a different sender address, set `MAIL_FROM` explicitly. Outgoing messages will always use the display name `Lumina Finance (Self-Hosted)` alongside that address.

## Applying and checking the settings {#test-delivery}

Once you've saved the `.env` file, recreate the app to load the new settings. Then, request a password reset on the login screen to see if you can receive the email. Clicking on the link sent in the email should bring you to the password reset screen.

If the email doesn't arrive, double check to make sure your credentials are correct, and that you have set a sensible value for [the relevant password reset environment variables](environment-variables.md#password-reset-and-email). Check the logs for any potential errors and feedback.

### Built-in rate limiter

The app has a built-in rate limiter for password reset emails, and it limits repeated requests to prevent abuse and won't send another email while an unused, unexpired reset link exists. By default, a reset link is valid for 15 minutes and each user account can receive up to 3 reset emails in a rolling 24-hour period. If you'd like to tweak these settings, please reference [the relevant password reset environment variables](environment-variables.md#password-reset-and-email).
