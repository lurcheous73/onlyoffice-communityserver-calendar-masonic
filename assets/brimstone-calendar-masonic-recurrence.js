/*
 * Brimstone Cottage Masonic Calendar recurrence helper.
 * Phase 2D2: build the specialist RRULE and enforce timed meetings.
 * This asset does not yet alter ONLYOFFICE save behaviour.
 */
(function () {
    "use strict";

    if (!/^\/addons\/calendar(?:\/|$)/i.test(window.location.pathname)) {
        return;
    }

    if (window.BRIMSTONE_MASONIC_RECURRENCE_INSTALLED) {
        return;
    }

    window.BRIMSTONE_MASONIC_RECURRENCE_INSTALLED = true;

    function ensureTimed(editor) {
        var allDay = editor.find(
            ".all-day input"
        ).first();

        if (allDay.length && allDay.is(":checked")) {
            /*
             * Use ONLYOFFICE's native click handler so it also
             * populates and enables the start/end time fields.
             */
            allDay.trigger("click");
        }

        /*
         * Safety fallback: never leave the time fields disabled
         * for a Masonic meeting.
         */
        editor.find(
            ".from-time, .to-time"
        ).prop("disabled", false);
    }

    function selectedMonths($, editor) {
        var values = [];

        editor.find(
            ".brimstone-masonic-month:checked"
        ).each(function () {
            values.push(parseInt($(this).val(), 10));
        });

        values.sort(function (a, b) {
            return a - b;
        });

        return values;
    }

    function editorIsDisplayed(editor) {
        var node = editor && editor[0];

        return !!(
            node &&
            (
                node.offsetWidth ||
                node.offsetHeight ||
                node.getClientRects().length
            )
        );
    }

    function buildRule($, editor, status) {
        var eventTypeSelect = editor.find(
            ".brimstone-event-type select"
        ).first();

        var eventType = eventTypeSelect.val();
        var isActiveEditor = editorIsDisplayed(editor);

        if (isActiveEditor) {
            window.BRIMSTONE_MASONIC_STATE =
                window.BRIMSTONE_MASONIC_STATE || {};

            window.BRIMSTONE_MASONIC_STATE.eventType =
                eventType || "";
        }

        if (eventType !== "masonic") {
            editor.removeAttr(
                "data-brimstone-masonic-rrule"
            );

            eventTypeSelect.removeAttr(
                "data-brimstone-masonic-rrule"
            );

            editor.attr(
                "data-brimstone-masonic-valid",
                "1"
            );

            if (isActiveEditor) {
                window.BRIMSTONE_MASONIC_STATE.rule = "";
                window.BRIMSTONE_MASONIC_STATE.valid = true;
            }

            status.hide();
            return;
        }

        ensureTimed(editor);

        var order = editor.find(
            ".brimstone-masonic-order"
        ).first().val();

        var weekday = editor.find(
            ".brimstone-masonic-weekday"
        ).first().val();

        var months = selectedMonths($, editor);

        if (!order || !weekday || !months.length) {
            editor.removeAttr(
                "data-brimstone-masonic-rrule"
            );

            eventTypeSelect.removeAttr(
                "data-brimstone-masonic-rrule"
            );

            editor.attr(
                "data-brimstone-masonic-valid",
                "0"
            );

            if (isActiveEditor) {
                window.BRIMSTONE_MASONIC_STATE.rule = "";
                window.BRIMSTONE_MASONIC_STATE.valid = false;
            }

            status
                .text("Select at least one meeting month.")
                .css("opacity", "1")
                .show();

            return;
        }

        var rule =
            "FREQ=MONTHLY" +
            ";BYMONTH=" + months.join(",") +
            ";BYDAY=" + order + weekday;

        editor.attr(
            "data-brimstone-masonic-rrule",
            rule
        );

        eventTypeSelect.attr(
            "data-brimstone-masonic-rrule",
            rule
        );

        editor.attr(
            "data-brimstone-masonic-valid",
            "1"
        );

        if (isActiveEditor) {
            window.BRIMSTONE_MASONIC_STATE.rule = rule;
            window.BRIMSTONE_MASONIC_STATE.valid = true;
        }

        status
            .text("Recurrence rule: " + rule)
            .css("opacity", "0.75")
            .show();
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
                editor.find(
                    ".brimstone-masonic-recurrence-status"
                ).length
            ) {
                return;
            }

            var status = $(
                '<div class="' +
                    'brimstone-masonic-recurrence-status" ' +
                    'style="display:none;margin-top:10px;' +
                    'font-size:12px;overflow-wrap:anywhere;">' +
                '</div>'
            );

            var monthsPanel = panel.find(
                ".brimstone-masonic-months"
            ).first();

            if (monthsPanel.length) {
                monthsPanel.after(status);
            } else {
                panel.append(status);
            }

            editor.on(
                "change.brimstoneMasonicRecurrence",
                ".brimstone-event-type select," +
                ".brimstone-masonic-order," +
                ".brimstone-masonic-weekday," +
                ".brimstone-masonic-month",
                function () {
                    buildRule($, editor, status);
                }
            );

            buildRule($, editor, status);
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
