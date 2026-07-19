/*
 * Brimstone Cottage Masonic Calendar rooms helper.
 * Phase 2C2: room selectors and native Location synchronisation.
 */
(function () {
    "use strict";

    if (!/^\/addons\/calendar(?:\/|$)/i.test(window.location.pathname)) {
        return;
    }

    if (window.BRIMSTONE_MASONIC_ROOMS_INSTALLED) {
        return;
    }

    window.BRIMSTONE_MASONIC_ROOMS_INSTALLED = true;

    var rooms = [
        "Smith Temple",
        "Keystone Temple",
        "Rose Temple",
        "Boardroom",
        "Mostyn",
        "Broughton",
        "Bar",
        "Whole Building",
        "Ground Floor",
        "Kitchen"
    ];

    function roomGridHtml(cssClass) {
        var html = "";
        var i;

        for (i = 0; i < rooms.length; i += 1) {
            html +=
                '<label>' +
                    '<input type="checkbox" class="' +
                        cssClass +
                        '" value="' +
                        rooms[i] +
                    '"> ' +
                    rooms[i] +
                '</label>';
        }

        return html;
    }

    function selectedRooms($, panel, selector) {
        var values = [];

        panel.find(selector + ":checked").each(function () {
            values.push($(this).val());
        });

        return values;
    }

    function formatLocation(values) {
        if (values.length === 0) {
            return "";
        }

        if (values.length === 1) {
            return values[0];
        }

        if (values.length === 2) {
            return values[0] + " and " + values[1];
        }

        return values.slice(0, -1).join(", ") +
            " and " +
            values[values.length - 1];
    }

    function setLocation(input, value) {
        if (!input.length || input.val() === value) {
            return;
        }

        input
            .val(value)
            .trigger("input")
            .trigger("change");
    }

    function install() {
        var $ = window.jq || window.jQuery;

        if (typeof $ !== "function") {
            return;
        }

        $(".editor").each(function () {
            var editor = $(this);

            var panel = editor.find(
                ".brimstone-masonic-panel"
            ).first();

            var eventType = editor.find(
                ".brimstone-event-type select"
            ).first();

            if (
                !panel.length ||
                !eventType.length ||
                editor.find(".brimstone-masonic-rooms").length
            ) {
                return;
            }

            var locationRow = editor.find(
                ".location"
            ).first();

            var locationInput = editor.find(
                ".location input"
            ).first();

            var installation = panel.find(
                ".brimstone-masonic-installation"
            ).first();

            var regularRooms = $(
                '<div class="brimstone-masonic-rooms" ' +
                    'style="margin-top:14px;padding-top:12px;' +
                    'border-top:1px solid #666;">' +

                    '<span class="label">Rooms and areas:</span>' +

                    '<div style="display:grid;' +
                        'grid-template-columns:' +
                            'repeat(2,minmax(180px,1fr));' +
                        'gap:6px 14px;margin-top:6px;">' +

                        roomGridHtml(
                            "brimstone-masonic-room"
                        ) +
                    '</div>' +

                    '<div style="margin-top:8px;font-size:12px;' +
                        'opacity:0.8;">' +

                        'Selections are stored in the normal ' +
                        'Location field.' +
                    '</div>' +
                '</div>'
            );

            installation.before(regularRooms);

            var installationDetails = panel.find(
                ".brimstone-masonic-installation-details"
            ).first();

            var installationNote = installationDetails.find(
                ".brimstone-masonic-installation-note"
            ).closest("div");

            var installationRooms = $(
                '<div class="brimstone-masonic-installation-rooms" ' +
                    'style="margin-top:12px;">' +

                    '<span class="label">' +
                        'Installation rooms and areas:' +
                    '</span>' +

                    '<div style="display:grid;' +
                        'grid-template-columns:' +
                            'repeat(2,minmax(180px,1fr));' +
                        'gap:6px 14px;margin-top:6px;">' +

                        roomGridHtml(
                            "brimstone-masonic-installation-room"
                        ) +
                    '</div>' +
                '</div>'
            );

            if (installationNote.length) {
                installationNote.before(installationRooms);
            } else {
                installationDetails.append(installationRooms);
            }

            var previousNormalLocation =
                locationInput.length ?
                    locationInput.val() :
                    "";

            var wasMasonic = false;

            function syncRegularRooms() {
                var values = selectedRooms(
                    $,
                    panel,
                    ".brimstone-masonic-room"
                );

                setLocation(
                    locationInput,
                    formatLocation(values)
                );
            }

            function updateEventType() {
                var isMasonic =
                    eventType.val() === "masonic";

                if (isMasonic && !wasMasonic) {
                    previousNormalLocation =
                        locationInput.length ?
                            locationInput.val() :
                            "";

                    syncRegularRooms();
                }

                if (!isMasonic && wasMasonic) {
                    setLocation(
                        locationInput,
                        previousNormalLocation
                    );
                }

                if (locationRow.length) {
                    locationRow.toggle(!isMasonic);
                }

                wasMasonic = isMasonic;
            }

            regularRooms.find(
                ".brimstone-masonic-room"
            ).on(
                "change",
                syncRegularRooms
            );

            eventType.on(
                "change",
                updateEventType
            );

            updateEventType();
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
