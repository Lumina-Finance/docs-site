---
title: Automatic update checks
description: Choose the version your instance runs and configure notices about new releases.
---

Lumina Finance supports automatically checking for new releases. This makes it easy to know when a new version is available if you decided to pin the docker image tag in your docker compose stack. 

Update checks are enabled by default. Lumina Finance will check GitHub for a newer stable release and make sure its matching image is available on Docker Hub. Once both checks succeed, you'll see <UiElement>New version available</UiElement> with a blinking dot in the sidebar.

To stop these checks and their notices, set [`UPDATE_CHECKS_ENABLED`](environment-variables.md#update_checks_enabled) to `false` in `.env`:

```dotenv
UPDATE_CHECKS_ENABLED=false
```

:::note[Update checks are not in real time]
Lumina Finance caches the update check results in the frontend for 6 hours. Therefore, depending on how frequently you use the app and when the last check was, you may experience a delay of up to 6 hours before you receive the notification.
:::
