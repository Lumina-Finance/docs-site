---
title: Email
description: Configure SMTP delivery to receive sign-up confirmation and password-reset emails from your instance.
---

Lumina Finance uses email to send sign-up confirmation and password-reset links. This page explains how to connect your email provider through SMTP and check that those links reach your inbox.

## Setting up email delivery {#configure-smtp}

:::info[Links are logged to console by default]
By default, the app writes outgoing emails, which contain sign-up confirmation and password reset links and tokens, in the log.
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

On port 465, the app uses TLS. On other ports, such as 587, it uses STARTTLS.

### Setting the sender address

[`MAIL_FROM`](environment-variables.md#mail_from) defaults to your SMTP username. If that username isn't an email address, or your provider requires a different sender address, set `MAIL_FROM` explicitly. Outgoing messages will always use the display name `Lumina Finance (Self-Hosted)` alongside that address.

## Sign-up confirmation emails {#signup-confirmation}

Signing up doesn't create an account straight away. The app emails a link to the address entered on the sign-up form, and the account is created once its owner opens the link and chooses a password. Each link works once, for 24 hours.

If you haven't connected an email provider, the link is written to the app's logs instead. Run `docker compose logs app` to find it, then open it in your browser. Set [`APP_URL`](environment-variables.md#app_url) first, since the app builds the link from it.

Each address can receive up to 3 sign-up emails in a rolling 24-hour period, which [`SIGNUP_DAILY_EMAIL_LIMIT`](environment-variables.md#signup_daily_email_limit) changes. An email that fails to send doesn't count toward that limit.

## Applying and checking the settings {#test-delivery}

Once you've saved the `.env` file, recreate the app to load the new settings. Then, request a password reset on the login screen to see if you can receive the email. Clicking on the link sent in the email should bring you to the password reset screen. A sign-up confirmation email works the same way.

If the email doesn't arrive, double check to make sure your credentials are correct, and that you have set a sensible value for [the relevant password reset environment variables](environment-variables.md#password-reset-and-email). Check the logs for any potential errors and feedback.

### Mail server timeouts

If your mail server stops answering, the password reset request still completes, and a warning in the logs shows that the email failed to send. You can request another reset straight away.

### Built-in rate limiter

The app has a built-in rate limiter for password reset emails, and it limits repeated requests to prevent abuse and won't send another email while an unused, unexpired reset link exists. By default, a reset link is valid for 15 minutes and each user account can receive up to 3 reset emails in a rolling 24-hour period. If you'd like to tweak these settings, please reference [the relevant password reset environment variables](environment-variables.md#password-reset-and-email). An email that fails to send doesn't count toward that limit. Instead, the account waits a minute before another is tried, and twice as long after each further failure, up to an hour, and it starts again from a minute once an email goes through.
