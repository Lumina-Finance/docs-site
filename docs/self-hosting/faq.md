---
title: FAQ
description: Answers about Lumina Finance, its funding, and running a personal instance.
---

# Frequently Asked Questions

## What data does Lumina Finance collect for the self-hosted instances?

Nothing :)

## Does Lumina Finance connect to any outside services?

Yes, for a few things:

- **GitHub and Docker Hub**: to check for new releases. You can turn this off with [`UPDATE_CHECKS_ENABLED`](environment-variables.md#update_checks_enabled).
- **Frankfurter**: for exchange rates. You can point [`FRANKFURTER_URL`](environment-variables.md#frankfurter_url) at your own Frankfurter instance instead.
- **Google's favicon service**: for the logo of an institution. This happens on the client side, using your browser. Unfortunately there isn't a way to turn off this call. The only way to prevent this from happening is to not add an institution. An invalid institution website will still trigger the call to Google's favicon service. This may be changed later.
- **jsDelivr**: for the logo on the single sign-on button and the emoji list in the category icon picker. These are also loaded by your browser and cannot be turned off.

## Why are you building Lumina Finance when other personal finance tools already exist?

There are already great personal finance tools out there, including some that are self-hostable, but many feel outdated, too simplistic, overly complicated, or too focused on one specific workflow.

We are building it because we want a modern, feature-rich, and accessible alternative that helps people understand their finances more clearly without fighting the software. Our goal is to combine strong financial tracking, a clean and modern user experience, privacy conscious design, and practical insights in one product. Essentially, we want to build something that "just works."

## Is this open source, and will self-hosting be free?

We are committed to keeping Lumina Finance free to self-host for non-commercial personal use, excluding features and services that require external data, paid APIs, or external compute.

Our goal is to eventually make Lumina Finance open source, and we are evaluating the best licensing structure with legal professionals. We want to choose a licence that supports community use while keeping the project sustainable.

For now, any commercial, organizational, or business related use is not permitted unless explicitly authorized in writing. This includes, but is not limited to, self hosting Lumina Finance for employees, friends, clients, customers, contractors, teams, or any business operations.

## Is there a discord server?

Unfortunately we don't have a discord server at this time. However, we do have a subreddit at [r/LuminaFinance](https://reddit.com/r/LuminaFinance) and [GitHub discussions](https://github.com/Lumina-Finance/lumina-finance/discussions). Please feel free to post any questions, submit feature requests, ask for help, or submit feedback on these platforms.

We go through all of your comments and requests, no matter how small or long it is. We'd love to hear your thoughts!

## How can I support Lumina Finance's development?

We have a buy me a coffee page set up [here](https://buymeacoffee.com/lumina.finance), which you can donate to help support its development.

You can also support us by [giving us a star on GitHub](https://github.com/Lumina-Finance/lumina-finance), or by sharing this project with others!

## Are you funded by private equity?

No. We are 100% bootstrapped.
