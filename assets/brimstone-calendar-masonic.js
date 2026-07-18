/*
 * Brimstone Cottage Masonic Calendar UI
 * Phase 2B: event type, meeting pattern, months and Installation details.
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
        meetingMonths: "Meeting months",
        installationMonth: "Installation month",
        installationDifferent: "Installation uses different details",
        installationDetails: "Installation meeting details",
        installationTitle: "Installation title",
        installationStart: "Start time",
        installationEnd: "End time",
        installationNote: "Installation note"
    };

    var months = [
        { value: "1", shortName: "Jan", longName: "January" },
        { value: "2", shortName: "Feb", longName: "February" },
        { value: "3", shortName: "Mar", longName: "March" },
        { value: "4", shortName: "Apr", longName: "April" },
        { value: "5", shortName: "May", longName: "May" },
        { value: "6", shortName: "Jun", longName: "June" },
        { value: "7", shortName: "Jul", longName: "July" },
        { value: "8", shortName: "Aug", longName: "August" },
        { value: "9", shortName: "Sep", longName: "September" },
        { value: "10", shortName: "Oct", longName: "October" },
        { value: "11", shortName: "Nov", longName: "November" },
        { value: "12", shortName: "Dec", longName: "December" }
    ];

    function meetingMonthsHtml() {
        var html = "";
        var i;

        for (i = 0; i < months.length; i += 1) {
            html +=
                '<label><input type="checkbox" ' +
                    'class="brimstone-masonic-month" ' +
                    'value="' + months[i].value + '"> ' +
                    months[i].shortName +
                '</label>';
        }

        return html;
    }

    function installationMonthOptionsHtml() {
        var html = '<option value="">None</option>';
        var i;

        for (i = 0; i < months.length; i += 1) {
            html +=
                '<option value="' + months[i].value + '">' +
                    months[i].longName +
                '</option>';
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

                            meetingMonthsHtml() +
                        '</div>' +
                    '</div>' +

                    '<div class="brimstone-masonic-installation" ' +
                        'style="margin-top:14px;padding-top:12px;' +
                        'border-top:1px solid #666;">' +

                        '<span class="label">' +
                            labels.installationMonth +
                        ':</span><br>' +

                        '<select class="brimstone-masonic-installation-month" ' +
                            'style="margin-top:4px;min-width:180px;' +
                            'padding:5px 8px;">' +

                            installationMonthOptionsHtml() +
                        '</select>' +

                        '<div style="margin-top:10px;">' +
                            '<label>' +
                                '<input type="checkbox" ' +
                                    'class="brimstone-masonic-' +
                                        'installation-different"> ' +
                                labels.installationDifferent +
                            '</label>' +
                        '</div>' +

                        '<div class="brimstone-masonic-' +
                            'installation-details" ' +
                            'style="display:none;margin-top:12px;' +
                            'padding:10px;border:1px solid #666;">' +

                            '<strong>' +
                                labels.installationDetails +
                            '</strong>' +

                            '<div style="margin-top:10px;">' +
                                '<label>' +
                                    labels.installationTitle +
                                    ':<br>' +

                                    '<input type="text" ' +
                                        'class="brimstone-masonic-' +
                                            'installation-title" ' +
                                        'style="box-sizing:border-box;' +
                                        'width:100%;margin-top:4px;' +
                                        'padding:5px 8px;">' +
                                '</label>' +
                            '</div>' +

                            '<div style="display:flex;flex-wrap:wrap;' +
                                'gap:12px;margin-top:10px;">' +

                                '<label>' +
                                    labels.installationStart +
                                    ':<br>' +

                                    '<input type="time" ' +
                                        'class="brimstone-masonic-' +
                                            'installation-start" ' +
                                        'style="margin-top:4px;' +
                                        'padding:5px 8px;">' +
                                '</label>' +

                                '<label>' +
                                    labels.installationEnd +
                                    ':<br>' +

                                    '<input type="time" ' +
                                        'class="brimstone-masonic-' +
                                            'installation-end" ' +
                                        'style="margin-top:4px;' +
                                        'padding:5px 8px;">' +
                                '</label>' +
                            '</div>' +

                            '<div style="margin-top:10px;">' +
                                '<label>' +
                                    labels.installationNote +
                                    ':<br>' +

                                    '<textarea class="brimstone-masonic-' +
                                        'installation-note" rows="3" ' +
                                        'style="box-sizing:border-box;' +
                                        'width:100%;margin-top:4px;' +
                                        'padding:5px 8px;"></textarea>' +
                                '</label>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>'
            );

            repeat.before(type);
            type.after(masonic);

            var installationMonth = masonic.find(
                ".brimstone-masonic-installation-month"
            );

            var installationDifferent = masonic.find(
                ".brimstone-masonic-installation-different"
            );

            var installationDetails = masonic.find(
                ".brimstone-masonic-installation-details"
            );

            function updateInstallation() {
                var hasInstallationMonth =
                    installationMonth.val() !== "";

                installationDifferent.prop(
                    "disabled",
                    !hasInstallationMonth
                );

                if (!hasInstallationMonth) {
                    installationDifferent.prop("checked", false);
                }

                installationDetails.toggle(
                    hasInstallationMonth &&
                    installationDifferent.prop("checked")
                );
            }

            function updateEventType() {
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

            installationMonth.on(
                "change",
                updateInstallation
            );

            installationDifferent.on(
                "change",
                updateInstallation
            );

            type.find("select").on(
                "change",
                updateEventType
            );

            updateInstallation();
            updateEventType();
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
