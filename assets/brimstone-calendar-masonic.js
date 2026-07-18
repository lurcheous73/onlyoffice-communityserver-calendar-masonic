/*
 * Brimstone Cottage Masonic Calendar UI
 * Phase 1: event-type selector only; no save behaviour.
 */
(function () {
    "use strict";

    if (!/^\/addons\/calendar(?:\/|$)/i.test(window.location.pathname)) {
        return;
    }

    if (window.BRIMSTONE_MASONIC_UI_INSTALLED) {
        return;
    }

    window.BRIMSTONE_MASONIC_UI_INSTALLED = true;

    function install() {
        var $ = window.jq || window.jQuery;

        if (typeof $ !== "function") {
            return;
        }

        $(".editor").each(function () {
            var editor = $(this);
            var repeat = editor.find(".repeat-alert").first();

            if (
                !repeat.length ||
                editor.find(".brimstone-event-type").length
            ) {
                return;
            }

            var type = $(
                '<div class="brimstone-event-type" style="margin:12px 0;">' +
                    '<span class="label">Event type:</span><br>' +
                    '<select aria-label="Event type" ' +
                        'style="margin-top:4px;min-width:220px;padding:5px 8px;">' +
                        '<option value="oneoff">One-off event</option>' +
                        '<option value="masonic">Masonic meeting</option>' +
                        '<option value="other">Other recurring event</option>' +
                    '</select>' +
                '</div>'
            );

            var masonic = $(
                '<div class="brimstone-masonic-panel" ' +
                    'style="display:none;margin:8px 0 14px;padding:10px;' +
                    'border:1px solid #bbb;background:#fafafa;">' +
                    '<strong>Masonic meeting options</strong><br>' +
                    '<span style="font-size:12px;">' +
                        'Weekday, selected months, Installation meeting ' +
                        'and rooms will appear here.' +
                    '</span>' +
                '</div>'
            );

            repeat.before(type);
            type.after(masonic);

            function update() {
                var value = type.find("select").val();

                masonic.toggle(value === "masonic");

                if (value === "other") {
                    repeat[0].style.removeProperty("display");
                } else {
                    repeat[0].style.setProperty(
                        "display",
                        "none",
                        "important"
                    );
                }
            }

            type.find("select").on("change", update);
            update();
        });
    }

    new MutationObserver(install).observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    window.setTimeout(install, 500);
    window.setTimeout(install, 1500);
    window.setInterval(install, 3000);
}());
