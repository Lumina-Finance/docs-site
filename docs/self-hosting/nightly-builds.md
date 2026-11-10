---
title: Nightly builds
description: Try new features before they're released, and know the risks first.
---

Nightly builds let you try new features and fixes before they reach a stable release. A new build is published each night when something has changed, from the code that becomes the next release. They're for people who want the newest changes early and are happy to report problems they find along the way.

To switch, set [`APP_IMAGE_TAG`](environment-variables.md#app_image_tag) to `nightly` in `.env`, then pull and restart:

```bash
docker compose pull app
docker compose up -d
```

:::warning[Back up before you switch]
Nightly builds haven't been through release testing, so expect rough edges and bugs. 

Although it is relatively uncommon, a nightly build can also include database migrations that can't be undone. Once one has run, going back to an earlier build or the stable release may need manual work on your database, and moving between nightly builds can need the same. 

**Due to limited resources, we won't be able to help you in reverting your instance.**
:::

To go back to a stable release, set `APP_IMAGE_TAG` back to `latest` once a stable release includes the changes your nightly build made, then pull and restart as above.
