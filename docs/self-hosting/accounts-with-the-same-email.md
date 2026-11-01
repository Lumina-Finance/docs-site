---
title: Accounts with the same email in different capitals
description: Resolve accounts whose email addresses differ only in capitals, which stop an update from starting.
---

Lumina Finance treats `Alice@example.com` and `alice@example.com` as the same email address, so one address can only ever belong to one account. Earlier versions let both exist. This covers the letters A to Z. Addresses differing in the capitals of other letters, such as `Émile@example.com` and `émile@example.com`, stay separate.

If your instance holds two or more accounts whose addresses differ only in the capitals of A to Z, the app refuses to start after the update. It names the addresses in its log and changes nothing. It never merges the accounts for you, because that could give one person access to another person's finances.

To see the message, run `docker compose logs app`.

## Resolve the accounts

1. Stop the app. The database keeps running:

   ```bash
   docker compose stop app
   ```

2. List the accounts that clash:

   ```bash
   docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT u.id, u.email, u.created_at, (SELECT count(*) FROM accounts a WHERE a.owner_id = u.id) AS accounts FROM users u WHERE lower(u.email COLLATE \"C\") IN (SELECT lower(email COLLATE \"C\") FROM users GROUP BY 1 HAVING count(*) > 1) ORDER BY lower(u.email COLLATE \"C\"), u.created_at;"'
   ```

3. Decide with each owner which account stays. The `accounts` column counts the financial accounts each one holds, and `created_at` shows which was made first.

4. Change the email address of every account that doesn't stay. Use an address nobody else uses, even in other capitals, and replace `<id>` with that account's `id` from the list:

   ```bash
   docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "UPDATE users SET email = '"'"'new-address@example.com'"'"' WHERE id = '"'"'<id>'"'"';"'
   ```

5. Start the app again. The update then finishes:

   ```bash
   docker compose up -d app
   ```

The person whose address you changed signs in with the new address and their existing password. If you used an address they can read, they can also reset their password from it.

:::warning[The app keeps refusing until every pair is resolved]
The app checks again each time it starts and lists any addresses that still clash. Your data isn't touched until the check passes.
:::
