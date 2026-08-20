#!/usr/bin/env bash
set -Eeuo pipefail

C="${COMMUNITY_C:-onlyoffice-community-server}"
EXPECTED_IMAGE="${EXPECTED_IMAGE:-onlyoffice/communityserver:12.8.0.1971}"
ASSET_DIR="/var/www/onlyoffice/Data/brimstone"
NGINX_FRAGMENT="/etc/nginx/includes/onlyoffice-communityserver-brimstone-calendar-location.conf"
NGINX_COMMON="/etc/nginx/includes/onlyoffice-communityserver-common.conf"
NGINX_COMMON_TEMPLATE="/etc/nginx/includes/onlyoffice-communityserver-common.conf.template"
INCLUDE_LINE="include /etc/nginx/includes/onlyoffice-communityserver-brimstone-calendar-location.conf;"
FAIL=0

check() {
    local label="$1"; shift
    if "$@"; then
        printf 'PASS  %s\n' "$label"
    else
        printf 'FAIL  %s\n' "$label"
        FAIL=1
    fi
}

echo "============================================================"
echo " BRIMSTONE CALENDAR — STATUS"
echo "============================================================"

check "container exists" docker inspect "$C"
[ "$FAIL" = 0 ] || exit 1

IMAGE="$(docker inspect -f '{{.Config.Image}}' "$C")"
printf 'INFO  image: %s\n' "$IMAGE"
[ "$IMAGE" = "$EXPECTED_IMAGE" ] || printf 'WARN  expected image: %s\n' "$EXPECTED_IMAGE"

check "container running" test "$(docker inspect -f '{{.State.Running}}' "$C")" = true
check "location asset" docker exec "$C" grep -Fq 'BRIMSTONE_CALENDAR_LOCATION_INSTALLED' "$ASSET_DIR/brimstone-calendar-location.js"
check "event-type asset" docker exec "$C" grep -Fq 'BRIMSTONE_MASONIC_UI_INSTALLED' "$ASSET_DIR/brimstone-calendar-masonic.js"
check "nginx fragment" docker exec "$C" test -s "$NGINX_FRAGMENT"
check "nginx include exactly once" test "$(docker exec "$C" grep -Fc "$INCLUDE_LINE" "$NGINX_COMMON" 2>/dev/null || true)" = 1
if docker exec "$C" test -e "$NGINX_COMMON_TEMPLATE"; then
    check "nginx template include exactly once" test "$(docker exec "$C" grep -Fc "$INCLUDE_LINE" "$NGINX_COMMON_TEMPLATE" 2>/dev/null || true)" = 1
fi
check "nginx syntax" docker exec "$C" nginx -t
check "location asset HTTP" docker exec "$C" curl -fsS --connect-timeout 3 --max-time 10 http://127.0.0.1/brimstone-calendar-location.js
check "event-type asset HTTP" docker exec "$C" curl -fsS --connect-timeout 3 --max-time 10 http://127.0.0.1/brimstone-calendar-masonic.js

mapfile -t FC < <(docker exec "$C" sh -lc "grep -RIl --include='fullcalendar.js' 'fc-selected-months-enable' /var/www/onlyoffice 2>/dev/null | sort" | tr -d '\r')
if [ "${#FC[@]}" -gt 0 ]; then
    printf 'PASS  BYMONTH runtime patch (%d file(s))\n' "${#FC[@]}"
    printf '      %s\n' "${FC[@]}"
else
    printf 'WARN  BYMONTH runtime marker not found in a file named fullcalendar.js\n'
fi

exit "$FAIL"
