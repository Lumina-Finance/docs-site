---
title: Automatic update checks
description: Choose the version your instance runs and configure notices about new releases.
---

Lumina Finance supports automatically checking for new releases. This makes it easy to know when a new version is available if you decided to pin the docker image tag in your docker compose stack. 

Update checks are enabled by default. When the app requests version information, LF checks GitHub for a newer stable release and makes sure its matching image is available on Docker Hub. Once both checks succeed, you'll see <UiElement>New version available</UiElement> with a blinking dot in the sidebar.

These checks work with both pinned versions and `latest`, and they don't install updates for you. The results are cached and only checked every 6 hours, so update notifications may not be instantaneous.

## Turning off update checks

To stop these checks and their notices, set [`UPDATE_CHECKS_ENABLED`](environment-variables.md#update_checks_enabled) to `false` in `.env`:

```dotenv
UPDATE_CHECKS_ENABLED=false
```
