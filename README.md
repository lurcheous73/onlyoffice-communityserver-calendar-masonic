# Brimstone Calendar Specialist Recurrence

A working runtime patch set for ONLYOFFICE Community Server Calendar, tested against Community Server **12.8.0.1971**.

The reference installation is Brimstone Cottage. The repository now includes fail-closed install, status and rollback tooling so the working runtime overlay can be managed from Git rather than by repeating manual container edits.

## Working baseline

The reference installation has demonstrated:

- Calendar events displaying their **Location** alongside the event title.
- New events defaulting to timed events rather than all-day events on the reference installation.
- Recurrence rules supporting selected months using `BYMONTH`.
- Event type selector:
  - One-off event
  - Masonic meeting
  - Other recurring event
- Other recurring event retaining the standard ONLYOFFICE Custom recurrence interface.

The repository directly contains the Location display overlay, selected-month recurrence patch and Phase 1 event-type UI overlay.

### Important scope note

The Event type selector is intentionally a **Phase 1 UI implementation**. It is persistent on the reference installation but does not yet alter saved event data or introduce a new calendar persistence model.

The timed-event default is also a behaviour observed on the reference installation, but the current Git tree does not contain a separate, independently reproducible timed-event-default patch. The release installer therefore does not invent one; it packages only changes that are actually captured in the repository.

## Install / update

Normal operator flow:

```bash
git pull --ff-only
sudo bash ./tools/brimstone-calendar-install.sh
```

The installer:

- verifies the tested CommunityServer image;
- backs up every runtime file it changes;
- installs the persistent Calendar JavaScript overlays;
- installs and persists the nginx loader include;
- applies the selected-month `fullcalendar.js` patch only where it dry-runs cleanly, or recognises an already-patched target;
- validates nginx before reload;
- verifies the two served JavaScript endpoints;
- records a rollback manifest on the Docker host.

See [`docs/INSTALL.md`](docs/INSTALL.md) for the exact behaviour and recovery procedure.

## Status

```bash
sudo bash ./tools/brimstone-calendar-status.sh
```

## Rollback

Most recent successful install:

```bash
sudo bash ./tools/brimstone-calendar-rollback.sh
```

Or specify a particular backup directory:

```bash
sudo bash ./tools/brimstone-calendar-rollback.sh /var/backups/brimstone-calendar/<timestamp>
```

## Repository layout

- `assets/` — persistent JavaScript loaded from ONLYOFFICE Data storage
- `nginx/` — nginx loader configuration
- `patches/` — source/runtime-compatible patches against the tested Calendar code
- `tools/` — install, status and rollback tooling
- `docs/` — installation and customisation notes
- `VERSION` — working-baseline release marker

## Customisation

The internal Brimstone and Masonic identifiers may remain unchanged when adapting the overlay for another organisation.

User-facing terminology can be adapted for clubs, societies, churches, committees and other organisations. See [`docs/CUSTOMISATION.md`](docs/CUSTOMISATION.md).

## Safety model

The release tooling is intentionally conservative:

1. Default target is exactly `onlyoffice/communityserver:12.8.0.1971`.
2. Runtime files are backed up before mutation.
3. Existing compatible BYMONTH patches are detected rather than re-applied.
4. Unknown `fullcalendar.js` layouts are not patched by guesswork.
5. nginx configuration must pass `nginx -t` before reload.
6. Rollback restores the exact pre-install files from the recorded manifest.
7. No MySQL/calendar data is modified by the installer.

This is still an independent community project, not an official ONLYOFFICE component.
