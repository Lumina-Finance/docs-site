---
title: Fail2ban integration
description: Use fail2ban to ban addresses that repeatedly fail to sign in or flood sign-up and password reset requests.
---

Lumina Finance writes a line to its log for each failed sign-in, each failed password reset, and every sign-up and password reset request. The line includes the address the request came from. [fail2ban](https://github.com/fail2ban/fail2ban) can read those lines and block an address that sends too many of them.

These lines never hold an email, name, request body or query string, and a sign-in that succeeds writes none.

## The built-in sign-in lock {#sign-in-lock}

The app also locks an email address for 30 minutes after 5 failed sign-in attempts. Wrong passwords and wrong second-factor codes count together, and the lock signs the account out of all its sessions. While an address is locked, sign-in answers "Account temporarily locked". A completed sign-in clears the count, and waiting out the lock gives all 5 attempts back.

The count follows the address typed on the sign-in form, so an address with no account locks the same way and nobody can use the lock to find out which addresses have accounts. There's nothing to configure.

## Set it up

Run fail2ban on the machine that runs Docker. Leave [`LOG_LEVEL`](environment-variables.md#log_level) at `INFO` or `DEBUG`, since `WARNING` and `ERROR` stop these lines and fail2ban would then ban no one. These steps read the log files of Docker's standard `json-file` logging driver, so if your Docker is set to another driver, set `driver: json-file` under `logging` for the app service in your Compose file.

:::warning[Behind a reverse proxy on a public address?]
Set `TRUSTED_PROXIES` first, as [described below](#behind-a-reverse-proxy). Without it the log shows your proxy's address, and fail2ban would ban the proxy.
:::

1. Install fail2ban with your system's package manager.
2. Create `/etc/fail2ban/filter.d/lumina-finance.conf`:

   ```ini
   # Failed sign-ins and resets, and sign-up requests, in the app's abuse log lines
   [Definition]
   failregex = \\?"route\\?":\\?"/auth/[^"\\]*\\?".*\\?"ip\\?":\\?"<ADDR>\\?"
   ignoreregex =
   ```

3. Create `/etc/fail2ban/jail.d/lumina-finance.local`:

   ```ini
   # Ban an address for an hour after 10 matching requests in 10 minutes
   # Behind a reverse proxy on a public address, set TRUSTED_PROXIES first
   # After an update replaces the container, run: fail2ban-client reload
   [lumina-finance]
   enabled = true
   filter = lumina-finance
   # Docker container log files, read directly since some systems default to the journal
   backend = auto
   logpath = /var/lib/docker/containers/*/*-json.log
   maxretry = 10
   findtime = 10m
   bantime = 1h
   # Addresses never banned
   ignoreip = 127.0.0.1/8 ::1
   # Docker's published ports pass through this chain
   chain = DOCKER-USER
   banaction = iptables-allports
   ```

4. Start fail2ban with the new files, then check that the jail is running:

   ```bash
   sudo systemctl enable fail2ban
   sudo systemctl restart fail2ban
   sleep 3
   sudo fail2ban-client status lumina-finance
   ```

   On Debian 12, fail2ban stops with `Have not found any log file for sshd jail`, since its default SSH jail looks for a log file that system doesn't keep. Point that jail at the system journal, then run the commands again:

   ```bash
   sudo apt install python3-systemd
   printf '[sshd]\nbackend = systemd\n' | sudo tee /etc/fail2ban/jail.d/sshd-journal.local
   ```

The jail bans an address for an hour once it sends 10 matching requests within 10 minutes. Change `maxretry`, `findtime` and `bantime` to suit your instance.

:::warning[After every update]
Run `sudo fail2ban-client reload` each time `docker compose up -d` replaces the container, such as after an update or a settings change. The new container writes to a new log file, and fail2ban doesn't read it until you reload.
:::

## Behind a reverse proxy

The app believes the client address forwarded by a proxy on a private address, so a reverse proxy on the same Docker network or private network needs no setting. If your proxy is on a public address, the log shows the proxy's address, and fail2ban would ban the proxy. Name it with [`TRUSTED_PROXIES`](environment-variables.md#trusted_proxies) in `.env`, then run `docker compose up -d` again and reload fail2ban:

```dotenv
TRUSTED_PROXIES=203.0.113.7/32
```

Setting it replaces the default, so list every proxy requests pass through, private ones included, since the first address not listed is the one that gets banned. Only list proxies you control, since the app believes the address they forward.

:::warning[Machines on your private network]
With the default, anything on a private network that can connect to the container directly can name any address, and could get that address banned. If you don't trust everything on that network, name your proxies with `TRUSTED_PROXIES`.
:::

The ban only stops visitors whose connections reach this machine through a port Docker publishes, such as when your proxy is another container here. If your proxy runs on this machine outside Docker, set `chain = INPUT` in the jail. If it runs on another machine, this jail's ban can't stop anyone, since their connections arrive from the proxy, so the ban has to happen on that machine.

## IPv6

Lumina Finance and the jail both work with IPv6, but whether your instance takes IPv6 visitors is part of your own host's setup. The Compose file leaves IPv6 off for its network. If this machine has a public IPv6 address, Docker then passes IPv6 visitors to the app from its own private address. All of them share one logged address, none can be banned, and since private addresses are trusted by default, any of them can name another address and get it banned.

So on a machine with a public IPv6 address, configure one of these in `compose.override.yml`, then run `docker compose up -d` again and reload fail2ban. To take IPv6 visitors and ban them by their own address, turn on IPv6 for the network:

```yaml
networks:
  default:
    enable_ipv6: true
    ipam:
      config:
        - subnet: fd00:beef::/64
```

Or, to take IPv4 visitors only, publish the port on IPv4:

```yaml
services:
  app:
    ports: !override
      - "0.0.0.0:8080:80"
```

:::tip[Limit the log size]
Docker keeps container logs without a size limit unless you set one. Add `max-size` and `max-file` under `logging` for the app service in your Compose file to rotate them.
:::
