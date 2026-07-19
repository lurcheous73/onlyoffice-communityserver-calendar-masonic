/*
 * Brimstone Cottage Provincial-event preset.
 * Defaults Provincial events to All day and Whole Building.
 */
(function () {
    "use strict";

    if (!/^\/addons\/calendar(?:\/|$)/i.test(window.location.pathname)) {
        return;
    }

    if (window.BRIMSTONE_PROVINCIAL_EVENT_INSTALLED) {
        return;
    }

    window.BRIMSTONE_PROVINCIAL_EVENT_INSTALLED = true;

    function setAllDay(allDayInput, checked) {
        if (
            allDayInput.length &&
            allDayInput.is(":checked") !== checked
        ) {
            /*
             * Use ONLYOFFICE's own handler so the time fields
             * are enabled or disabled correctly.
             */
            allDayInput.trigger("click");
        }
    }

    function setLocation(locationInput, value) {
        if (
            locationInput.length &&
            locationInput.val() !== value
        ) {
            locationInput
                .val(value)
                .trigger("input")
                .trigger("change");
        }
    }

    function install() {
        var $ = window.jq || window.jQuery;

        if (typeof $ !== "function") {
            return;
        }

        $(".editor").each(function () {
            var editor = $(this);

            var eventType = editor.find(
                ".brimstone-event-type select"
            ).first();

            if (
                !eventType.length ||
                editor.attr(
                    "data-brimstone-provincial-installed"
                ) === "1"
            ) {
                return;
            }

            editor.attr(
                "data-brimstone-provincial-installed",
                "1"
            );

            if (
                !eventType.find(
                    'option[value="provincial"]'
                ).length
            ) {
                eventType.find(
                    'option[value="masonic"]'
                ).after(
                    '<option value="provincial">' +
                        'Provincial event' +
                    '</option>'
                );
            }

            var locationRow = editor.find(
                ".location"
            ).first();

            var locationInput = editor.find(
                ".location input"
            ).first();

            var allDayInput = editor.find(
                ".all-day input"
            ).first();

            var notice = $(
                '<div class="brimstone-provincial-notice" ' +
                    'style="display:none;margin:8px 0 14px;' +
                    'padding:10px;border:1px solid #777;' +
                    'background:transparent;color:inherit;">' +

                    '<strong>Provincial event</strong><br>' +

                    '<span style="font-size:12px;">' +
                        'Defaults to All day and Whole Building. ' +
                        'Untick All day above for a timed event.' +
                    '</span>' +
                '</div>'
            );

            editor.find(
                ".brimstone-event-type"
            ).after(notice);

            var previousLocation =
                locationInput.length ?
                    locationInput.val() :
                    "";

            var previousAllDay =
                allDayInput.length ?
                    allDayInput.is(":checked") :
                    false;

            var wasProvincial = false;

            function update() {
                var currentType = eventType.val();
                var isProvincial =
                    currentType === "provincial";

                if (isProvincial && !wasProvincial) {
                    previousLocation =
                        locationInput.length ?
                            locationInput.val() :
                            "";

                    previousAllDay =
                        allDayInput.length ?
                            allDayInput.is(":checked") :
                            false;

                    setLocation(
                        locationInput,
                        "Whole Building"
                    );

                    setAllDay(
                        allDayInput,
                        true
                    );
                }

                if (!isProvincial && wasProvincial) {
                    /*
                     * Masonic helpers take ownership of Location
                     * and timed state when switching directly into
                     * a Masonic meeting.
                     */
                    if (currentType !== "masonic") {
                        setLocation(
                            locationInput,
                            previousLocation
                        );

                        setAllDay(
                            allDayInput,
                            previousAllDay
                        );
                    }
                }

                notice.toggle(isProvincial);

                if (locationRow.length) {
                    if (isProvincial) {
                        locationRow.hide();
                    } else if (currentType !== "masonic") {
                        locationRow.show();
                    }
                }

                wasProvincial = isProvincial;
            }

            eventType.on(
                "change.brimstoneProvincial",
                update
            );

            update();
        });
    }

    new MutationObserver(install).observe(
        document.documentElement,
        {
            childList: true,
            subtree: true
        }
    );

    window.setTimeout(install, 500);
    window.setTimeout(install, 1500);
    window.setInterval(install, 3000);
}());
