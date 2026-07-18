/*
 * Brimstone Cottage Masonic Calendar rooms UI.
 * Phase 2C1: room selectors only.
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

            if (
                !panel.length ||
                editor.find(".brimstone-masonic-rooms").length
            ) {
                return;
            }

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
