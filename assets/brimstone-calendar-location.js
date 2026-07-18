/*
 * Brimstone Cottage Calendar Location Loader
 */
(function () {
    "use strict";

    if (!/^\/addons\/calendar(?:\/|$)/i.test(window.location.pathname)) {
        return;
    }

    if (window.BRIMSTONE_CALENDAR_LOCATION_INSTALLED) {
        return;
    }

    window.BRIMSTONE_CALENDAR_LOCATION_INSTALLED = true;
    window.BRIMSTONE_CALENDAR_LOCATION_CACHE = {};
    window.BRIMSTONE_CALENDAR_LOCATION_PENDING = {};

    var rerenderTimer = null;

    function getCalendar() {
        if (
            typeof window.jq !== "function" ||
            typeof window.Teamlab === "undefined"
        ) {
            return null;
        }

        var calendar = window.jq("#asc_calendar");

        if (
            !calendar.length ||
            typeof calendar.fullCalendar !== "function"
        ) {
            return null;
        }

        return calendar;
    }

    function parseLocation(mergedIcs) {
        if (!mergedIcs || !window.ICAL) {
            return "";
        }

        var jCalData = window.ICAL.parse(mergedIcs);
        var component = new window.ICAL.Component(jCalData);
        var vevent = component.getFirstSubcomponent("vevent");

        if (!vevent) {
            return "";
        }

        return new window.ICAL.Event(vevent).location || "";
    }

    function scheduleRerender(calendar) {
        if (rerenderTimer !== null) {
            window.clearTimeout(rerenderTimer);
        }

        rerenderTimer = window.setTimeout(function () {
            rerenderTimer = null;

            try {
                calendar.fullCalendar("rerenderEvents");
            } catch (error) {
                console.error(
                    "BRIMSTONE_CALENDAR_LOCATION_RERENDER_ERROR",
                    error
                );
            }
        }, 150);
    }

    function applyLocation(calendar, objectId, uniqueId, location) {
        if (!location) {
            return false;
        }

        var events;

        try {
            events = calendar.fullCalendar("clientEvents");
        } catch (error) {
            return false;
        }

        var changed = false;

        for (var i = 0; i < events.length; i++) {
            var event = events[i];

            if (!event || event.isTodo) {
                continue;
            }

            var sameObject =
                String(event.objectId) === String(objectId);

            var sameUid =
                !event.uniqueId ||
                event.uniqueId === uniqueId;

            if (
                sameObject &&
                sameUid &&
                event.location !== location
            ) {
                event.location = location;
                changed = true;
            }
        }

        return changed;
    }

    function fetchLocation(calendar, objectId, uniqueId, key) {
        window.BRIMSTONE_CALENDAR_LOCATION_PENDING[key] = true;

        window.Teamlab.getCalendarEventById(
            {},
            objectId,
            {
                success: function (params, eventInfo) {
                    var location = "";

                    try {
                        if (
                            eventInfo &&
                            eventInfo.eventUid === uniqueId &&
                            eventInfo.mergedIcs
                        ) {
                            location = parseLocation(
                                eventInfo.mergedIcs
                            );
                        }
                    } catch (error) {
                        console.error(
                            "BRIMSTONE_CALENDAR_LOCATION_PARSE_ERROR",
                            objectId,
                            error
                        );
                    }

                    window.BRIMSTONE_CALENDAR_LOCATION_CACHE[key] =
                        location;

                    delete window
                        .BRIMSTONE_CALENDAR_LOCATION_PENDING[key];

                    if (
                        applyLocation(
                            calendar,
                            objectId,
                            uniqueId,
                            location
                        )
                    ) {
                        scheduleRerender(calendar);
                    }
                },

                error: function () {
                    window.BRIMSTONE_CALENDAR_LOCATION_CACHE[key] = "";

                    delete window
                        .BRIMSTONE_CALENDAR_LOCATION_PENDING[key];
                },

                max_request_attempts: 1
            }
        );
    }

    function scan() {
        var calendar = getCalendar();

        if (!calendar) {
            return;
        }

        var events;

        try {
            events = calendar.fullCalendar("clientEvents");
        } catch (error) {
            return;
        }

        if (!events || !events.length) {
            return;
        }

        var rerenderRequired = false;
        var queued = {};

        for (var i = 0; i < events.length; i++) {
            var event = events[i];

            if (
                !event ||
                event.isTodo ||
                event.objectId === undefined ||
                event.objectId === null ||
                isNaN(event.objectId) ||
                !event.uniqueId
            ) {
                continue;
            }

            var key =
                event.objectId + "|" + event.uniqueId;

            if (
                Object.prototype.hasOwnProperty.call(
                    window.BRIMSTONE_CALENDAR_LOCATION_CACHE,
                    key
                )
            ) {
                var cachedLocation =
                    window.BRIMSTONE_CALENDAR_LOCATION_CACHE[key];

                if (
                    cachedLocation &&
                    event.location !== cachedLocation
                ) {
                    event.location = cachedLocation;
                    rerenderRequired = true;
                }

                continue;
            }

            if (
                window.BRIMSTONE_CALENDAR_LOCATION_PENDING[key] ||
                queued[key]
            ) {
                continue;
            }

            queued[key] = true;

            fetchLocation(
                calendar,
                event.objectId,
                event.uniqueId,
                key
            );
        }

        if (rerenderRequired) {
            scheduleRerender(calendar);
        }
    }

    window.BRIMSTONE_CALENDAR_LOCATION_SCAN = scan;

    window.setTimeout(scan, 500);
    window.setTimeout(scan, 1500);
    window.setInterval(scan, 3000);
}());
