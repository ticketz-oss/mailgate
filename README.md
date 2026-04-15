# MailGate Email API

MailGate is a self-hosted headless email client that exposes IMAP and SMTP resources over a REST API.

## Use Cases

- Sync users' mailboxes to your service and send mail on behalf of your users
- Integrate your app with specific mailbox workflows (for example support inboxes)
- Build lightweight webmail or mobile clients without direct IMAP/MIME handling

## Quickstart

1. Install dependencies and Redis
2. Configure MailGate settings
3. Start the server with:

```bash
npm start
```

## Version And License

The application shows version details in the admin interface and startup logs.

## Requirements

- Redis (any recent version)
- Node.js 16+

## Deployment

### Ubuntu Or Debian

Use the included install script:

```bash
chmod +x install.sh
./install.sh example.com
```

### Systemd

Use the example unit file in the `systemd` directory.

### Docker

Use `Dockerfile` and `docker-compose.yml` from this repository.

## Monitoring

Prometheus metrics are available at `/metrics`.

## Licensing

This project is licensed under the **Server Side Public License v1 (SSPL)**. See [`LICENSE.txt`](LICENSE.txt).

### Disclaimer

This repository is a fork of [EmailEngine](https://github.com/postalsys/emailengine) by [Postal Systems OÜ](https://postalsys.com), version **v2.24.4**.

At the time this fork was created, EmailEngine v2.24.4 was distributed under a dual-license model: **SSPL v1 OR a commercial license**. The SSPL is a copyleft license that explicitly permits forking and redistribution under its terms. This fork exercises that right by adopting SSPL as the sole license, as permitted by the original dual-license offer.

All credit for the original codebase goes to the EmailEngine authors and contributors. This fork introduces rebranding and licensing changes only, and does not claim original authorship of the underlying software.

- **Original project**: [github.com/postalsys/emailengine](https://github.com/postalsys/emailengine)
- **Original author**: Postal Systems OÜ
- **Original license**: SSPL v1 or Commercial License (as of v2.24.4)
