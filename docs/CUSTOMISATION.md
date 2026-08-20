# Customisation

The files and internal identifiers in this project retain the `Brimstone` and `Masonic` names because Brimstone Cottage is the development and reference installation.

These internal names do not need to be changed when adapting the calendar for another organisation.

## Changing the visible terminology

The user-facing label `Masonic meeting` may be changed to another specialist event type, for example:

- Regular meeting
- Club meeting
- Church service
- Committee meeting
- Society meeting
- Special recurring event

Only the displayed labels should normally be changed. Internal JavaScript identifiers, CSS classes, filenames and installation guards may remain unchanged.

The current Phase 1 labels are literal option text in:

`assets/brimstone-calendar-masonic.js`

Changing those labels does not alter recurrence rules or stored calendar data.

## Venue names and rooms

Venue/room persistence is not implemented by the current Phase 1 event-type overlay. Any future organisation-specific venue catalogue should remain separate from the working baseline until its save/edit behaviour is implemented and tested.
