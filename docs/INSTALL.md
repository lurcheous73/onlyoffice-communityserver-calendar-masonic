# Installation and recovery

This repository packages the working Brimstone Calendar runtime overlay for ONLYOFFICE Community Server 12.8.0.1971.

## Normal operator flow

```bash
git pull --ff-only
sudo bash ./tools/brimstone-calendar-install.sh
```

The installer is fail-closed for the tested CommunityServer image unless `ALLOW_UNSUPPORTED=1` is explicitly supplied.

It performs the following work:

1. Verifies the CommunityServer container and image.
2. Backs up every runtime file it will replace to `/var/backups/brimstone-calendar/<UTC timestamp>/` on the Docker host.
3. Installs the two persistent JavaScript assets into `/var/www/onlyoffice/Data/brimstone/`.
4. Installs the nginx loader fragment.
5. Adds the loader include to the active nginx common configuration and its template, exactly once, so the loader survives CommunityServer restarts.
6. Searches for compatible `fullcalendar.js` files. If the selected-month `BYMONTH` patch applies cleanly, it backs up and patches those files. If they are already patched, it leaves them alone. If no compatible runtime source is found, the overlay still installs and the installer reports the limitation rather than guessing at another file.
7. Runs `nginx -t`, reloads nginx, verifies both JavaScript URLs over HTTP, and records the last successful backup.

The installer does not alter MySQL, calendar rows, users, mail, Document Server, or any unrelated ONLYOFFICE provider.

## Status

```bash
sudo bash ./tools/brimstone-calendar-status.sh
```

The status tool checks the runtime assets, nginx include, nginx syntax, HTTP delivery and the selected-month runtime marker where it can be identified directly.

## Rollback

Rollback the most recent successful install:

```bash
sudo bash ./tools/brimstone-calendar-rollback.sh
```

Or select a specific backup:

```bash
sudo bash ./tools/brimstone-calendar-rollback.sh /var/backups/brimstone-calendar/<timestamp>
```

Rollback restores the exact pre-install files recorded in that backup manifest and reloads nginx only after `nginx -t` succeeds.

## Tested baseline and scope

The reference target is:

```text
onlyoffice/communityserver:12.8.0.1971
```

The repository currently contains the working Location display overlay, the selected-month recurrence patch and the Phase 1 event-type UI overlay. The event-type selector remains intentionally UI-only: it does not yet create a new persistence model or rewrite saved event data. That limitation is preserved rather than hidden by the release tooling.

The repository README also records a timed-event default observed on the reference installation. The files currently in this repository do not contain a separate, independently reproducible timed-event-default patch, so the installer does not invent one. That behaviour should only be promoted to a clean-install guarantee once its exact source/runtime change is captured in Git.
