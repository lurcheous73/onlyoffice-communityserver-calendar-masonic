# Brimstone Calendar Specialist Recurrence

A development patch set for ONLYOFFICE Community Server Calendar,
tested against Community Server 12.8.0.1971.

The reference installation is Brimstone Cottage. Derby production is
not modified until the Brimstone workflow has been tested and approved.

## Current features

- Calendar events display their Location alongside the event title.
- New events default to timed events rather than all-day events.
- Recurrence rules support selected months using `BYMONTH`.
- Event type selector:
  - One-off event
  - Masonic meeting
  - Other recurring event
- Other recurring event retains the standard ONLYOFFICE Custom
  recurrence interface.

## Development status

The Event type selector is currently a Phase 1 interface implementation.

It is persistent on Brimstone but does not yet alter saved event data.
The temporary Masonic meeting panel will later provide:

- ordinal weekday;
- selected meeting months;
- Installation month;
- optional Installation-specific details;
- venue and room selection;
- recurring-event edit and cancellation scopes.

## Repository layout

- `assets/` — persistent JavaScript loaded from ONLYOFFICE Data storage
- `nginx/` — Brimstone nginx loader configuration
- `patches/` — source patches against Community Server 12.8
- `docs/` — implementation and customisation notes

## Customisation

The internal Brimstone and Masonic identifiers may remain unchanged.

User-facing labels and venue names can be adapted for clubs, societies,
churches, committees and other organisations. See:

`docs/CUSTOMISATION.md`

## Safety

Apply changes to a test installation first.

The installer and rollback tooling will eventually verify the exact
Community Server version and source hashes before modifying files.
