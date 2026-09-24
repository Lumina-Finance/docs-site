---
title: Automatic update checks
description: Choose the version your instance runs and configure notices about new releases.
---

Lumina Finance supports automatically checking for new releases. This makes it easy to know when a new version is available if you decided to pin the docker image tag in your docker compose stack. 

Update checks are enabled by default. The app will check GitHub for a newer stable release and make sure its matching image is available on Docker Hub. Once both checks succeed, you'll see <UiElement>New version available</UiElement> with a blinking dot in the sidebar.

To stop these checks and their notices, set [`UPDATE_CHECKS_ENABLED`](environment-variables.md#update_checks_enabled) to `false` in `.env`:

```dotenv
UPDATE_CHECKS_ENABLED=false
```

:::note[Update checks are not in real time]
The app checks for a new release at most once every 6 hours, and reuses the last result until then, even if that check failed. So it can take a little over 6 hours after a release before you see the notice.
:::
