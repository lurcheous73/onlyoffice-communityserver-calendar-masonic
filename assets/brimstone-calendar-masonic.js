/*
 * Brimstone Cottage Masonic Calendar UI
 * Phase 2A: event type, meeting pattern and meeting months.
 * Specialist recurrence saving is not wired yet.
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

    var labels = {
        eventType: "Event type",
        oneOff: "One-off event",
        masonic: "Masonic meeting",
        otherRecurring: "Other recurring event",
        masonicOptions: "Masonic meeting options",
        meetingPattern: "Meeting pattern",
        meetingMonths: "Meeting months"
    };

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
                    '<span class="label">' +
                        labels.eventType +
                    ':</span><br>' +
                    '<select aria-label="' +
                        labels.eventType +
                        '" style="margin-top:4px;min-width:220px;' +
                        'padding:5px 8px;">' +
                        '<option value="oneoff">' +
                            labels.oneOff +
                        '</option>' +
                        '<option value="masonic">' +
                            labels.masonic +
                        '</option>' +
                        '<option value="other">' +
                            labels.otherRecurring +
                        '</option>' +
                    '</select>' +
                '</div>'
            );

            var masonic = $(
                '<div class="brimstone-masonic-panel" ' +
                    'style="display:none;margin:8px 0 14px;padding:10px;' +
                    'border:1px solid #777;background:transparent;' +
                    'color:inherit;">' +

                    '<strong>' +
                        labels.masonicOptions +
                    '</strong>' +

                    '<div style="margin-top:10px;">' +
                        '<span class="label">' +
                            labels.meetingPattern +
                        ':</span><br>' +

                        '<select class="brimstone-masonic-order" ' +
                            'style="margin-top:4px;margin-right:6px;' +
                            'padding:5px 8px;">' +
                            '<option value="1">First</option>' +
                            '<option value="2">Second</option>' +
                            '<option value="3">Third</option>' +
                            '<option value="4">Fourth</option>' +
                            '<option value="-1">Last</option>' +
                        '</select>' +

                        '<select class="brimstone-masonic-weekday" ' +
                            'style="margin-top:4px;padding:5px 8px;">' +
                            '<option value="MO">Monday</option>' +
                            '<option value="TU">Tuesday</option>' +
                            '<option value="WE">Wednesday</option>' +
                            '<option value="TH">Thursday</option>' +
                            '<option value="FR">Friday</option>' +
                            '<option value="SA">Saturday</option>' +
                            '<option value="SU">Sunday</option>' +
                        '</select>' +
                    '</div>' +

                    '<div class="brimstone-masonic-months" ' +
                        'style="margin-top:12px;">' +

                        '<span class="label">' +
                            labels.meetingMonths +
                        ':</span>' +

                        '<div style="display:grid;' +
                            'grid-template-columns:' +
                                'repeat(4,minmax(70px,1fr));' +
                            'gap:6px 10px;margin-top:6px;">' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="1"> Jan</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="2"> Feb</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="3"> Mar</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="4"> Apr</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="5"> May</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="6"> Jun</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="7"> Jul</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="8"> Aug</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="9"> Sep</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="10"> Oct</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="11"> Nov</label>' +

                            '<label><input type="checkbox" ' +
                                'class="brimstone-masonic-month" ' +
                                'value="12"> Dec</label>' +
                        '</div>' +
                    '</div>' +
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
