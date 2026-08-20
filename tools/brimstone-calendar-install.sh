#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
C="${COMMUNITY_C:-onlyoffice-community-server}"
EXPECTED_IMAGE="${EXPECTED_IMAGE:-onlyoffice/communityserver:12.8.0.1971}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/brimstone-calendar}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP="$BACKUP_ROOT/$STAMP"
ASSET_DIR="/var/www/onlyoffice/Data/brimstone"
NGINX_FRAGMENT="/etc/nginx/includes/onlyoffice-communityserver-brimstone-calendar-location.conf"
NGINX_COMMON="/etc/nginx/includes/onlyoffice-communityserver-common.conf"
NGINX_COMMON_TEMPLATE="/etc/nginx/includes/onlyoffice-communityserver-common.conf.template"
INCLUDE_LINE="include /etc/nginx/includes/onlyoffice-communityserver-brimstone-calendar-location.conf;"
LOCATION_SRC="$ROOT/assets/brimstone-calendar-location.js"
MASONIC_SRC="$ROOT/assets/brimstone-calendar-masonic.js"
NGINX_SRC="$ROOT/nginx/onlyoffice-communityserver-brimstone-calendar-location.conf"
PATCH_SRC="$ROOT/patches/fullcalendar-selected-months.patch"
MANIFEST="$BACKUP/manifest.tsv"
TMP="$(mktemp -d /tmp/brimstone-calendar-install.XXXXXX)"
MUTATED=0

cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

say() { printf '%s\n' "$*"; }
die() { say "FAIL: $*" >&2; exit 1; }
require_file() { [ -s "$1" ] || die "required repository file missing: $1"; }

backup_container_file() {
    local path="$1"
    local key="$2"
    if docker exec "$C" test -e "$path"; then
        mkdir -p "$BACKUP/files"
        docker cp "$C:$path" "$BACKUP/files/$key" >/dev/null
        printf 'file\t%s\t%s\n' "$path" "$key" >> "$MANIFEST"
    else
        printf 'absent\t%s\t-\n' "$path" >> "$MANIFEST"
    fi
}

restore_backup() {
    [ -s "$MANIFEST" ] || return 0
    while IFS=$'\t' read -r kind path key; do
        case "$kind" in
            file)
                docker cp "$BACKUP/files/$key" "$C:$path" >/dev/null 2>&1 || true
                ;;
            absent)
                docker exec "$C" rm -f "$path" >/dev/null 2>&1 || true
                ;;
        esac
    done < "$MANIFEST"
    docker exec "$C" nginx -t >/dev/null 2>&1 || true
    docker exec "$C" nginx -s reload >/dev/null 2>&1 || true
}

on_error() {
    local rc=$?
    if [ "$MUTATED" = "1" ]; then
        say
        say "INSTALL FAILED — restoring pre-install files from $BACKUP"
        restore_backup
    fi
    exit "$rc"
}
trap on_error ERR

say "============================================================"
say " BRIMSTONE CALENDAR — INSTALL WORKING BASELINE"
say "============================================================"

command -v docker >/dev/null 2>&1 || die "docker is not available"
command -v patch >/dev/null 2>&1 || die "patch is not available on the Docker host"
docker inspect "$C" >/dev/null 2>&1 || die "CommunityServer container '$C' not found"
[ "$(docker inspect -f '{{.State.Running}}' "$C")" = "true" ] || die "CommunityServer is not running"

IMAGE="$(docker inspect -f '{{.Config.Image}}' "$C")"
say "CommunityServer image: $IMAGE"
if [ "$IMAGE" != "$EXPECTED_IMAGE" ] && [ "${ALLOW_UNSUPPORTED:-0}" != "1" ]; then
    die "unsupported CommunityServer image; expected $EXPECTED_IMAGE"
fi

require_file "$LOCATION_SRC"
require_file "$MASONIC_SRC"
require_file "$NGINX_SRC"
require_file "$PATCH_SRC"

mkdir -p "$BACKUP"
: > "$MANIFEST"
printf 'release\t%s\n' "$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || echo unknown)" > "$BACKUP/release.txt"

say
say "=== BACKUP ==="
backup_container_file "$ASSET_DIR/brimstone-calendar-location.js" "brimstone-calendar-location.js"
backup_container_file "$ASSET_DIR/brimstone-calendar-masonic.js" "brimstone-calendar-masonic.js"
backup_container_file "$NGINX_FRAGMENT" "onlyoffice-communityserver-brimstone-calendar-location.conf"
backup_container_file "$NGINX_COMMON" "onlyoffice-communityserver-common.conf"
if docker exec "$C" test -e "$NGINX_COMMON_TEMPLATE"; then
    backup_container_file "$NGINX_COMMON_TEMPLATE" "onlyoffice-communityserver-common.conf.template"
fi
say "Backup: $BACKUP"

say
say "=== DISCOVER BYMONTH RUNTIME TARGETS ==="
mapfile -t FULLCAL < <(docker exec "$C" sh -lc 'find /var/www/onlyoffice -type f -name fullcalendar.js -print | sort' | tr -d '\r')
PATCHABLE=()
ALREADY=()
for f in "${FULLCAL[@]}"; do
    [ -n "$f" ] || continue
    safe="$(printf '%s' "$f" | sed 's#[^A-Za-z0-9._-]#_#g')"
    docker cp "$C:$f" "$TMP/$safe" >/dev/null
    if grep -Fq 'fc-selected-months-enable' "$TMP/$safe"; then
        ALREADY+=("$f")
        say "already patched: $f"
    elif patch --dry-run --silent "$TMP/$safe" < "$PATCH_SRC" >/dev/null 2>&1; then
        PATCHABLE+=("$f")
        say "patchable:       $f"
    fi
done

if [ "${#PATCHABLE[@]}" -eq 0 ] && [ "${#ALREADY[@]}" -eq 0 ]; then
    say "WARN: no directly patchable fullcalendar.js was found."
    say "      The overlay will still be installed, but BYMONTH runtime patching"
    say "      cannot be reproduced automatically on this filesystem layout."
fi

for f in "${PATCHABLE[@]}"; do
    key="fullcalendar-$(printf '%s' "$f" | sha256sum | awk '{print $1}').js"
    backup_container_file "$f" "$key"
done

say
say "=== INSTALL OVERLAY ASSETS ==="
docker exec "$C" install -d -o 0 -g 0 -m 0755 "$ASSET_DIR"
docker cp "$LOCATION_SRC" "$C:/tmp/brimstone-calendar-location.js" >/dev/null
docker cp "$MASONIC_SRC" "$C:/tmp/brimstone-calendar-masonic.js" >/dev/null
docker exec "$C" install -o 0 -g 0 -m 0644 /tmp/brimstone-calendar-location.js "$ASSET_DIR/brimstone-calendar-location.js"
docker exec "$C" install -o 0 -g 0 -m 0644 /tmp/brimstone-calendar-masonic.js "$ASSET_DIR/brimstone-calendar-masonic.js"
docker exec "$C" rm -f /tmp/brimstone-calendar-location.js /tmp/brimstone-calendar-masonic.js
MUTATED=1

say
say "=== INSTALL NGINX LOADER ==="
docker cp "$NGINX_SRC" "$C:/tmp/brimstone-calendar-nginx.conf" >/dev/null
docker exec "$C" install -o 0 -g 0 -m 0644 /tmp/brimstone-calendar-nginx.conf "$NGINX_FRAGMENT"
docker exec "$C" rm -f /tmp/brimstone-calendar-nginx.conf

patch_nginx_include() {
    local target="$1"
    local tag="$2"
    docker cp "$C:$target" "$TMP/$tag" >/dev/null
    python3 - "$TMP/$tag" "$INCLUDE_LINE" <<'PY'
from pathlib import Path
import sys
p = Path(sys.argv[1])
line = sys.argv[2]
text = p.read_text()
count = text.count(line)
if count == 0:
    if text and not text.endswith("\n"):
        text += "\n"
    text += "\n# BRIMSTONE CALENDAR LOADER\n" + line + "\n"
elif count > 1:
    raise SystemExit("duplicate Brimstone calendar include lines")
p.write_text(text)
PY
    read -r U G M < <(docker exec "$C" stat -c '%u %g %a' "$target")
    docker cp "$TMP/$tag" "$C:/tmp/brimstone-calendar-nginx-target" >/dev/null
    docker exec "$C" install -o "$U" -g "$G" -m "$M" /tmp/brimstone-calendar-nginx-target "$target"
    docker exec "$C" rm -f /tmp/brimstone-calendar-nginx-target
}

patch_nginx_include "$NGINX_COMMON" "common.conf"
if docker exec "$C" test -e "$NGINX_COMMON_TEMPLATE"; then
    patch_nginx_include "$NGINX_COMMON_TEMPLATE" "common.conf.template"
fi

say
say "=== APPLY BYMONTH PATCH WHERE EXACTLY COMPATIBLE ==="
for f in "${PATCHABLE[@]}"; do
    safe="$(printf '%s' "$f" | sed 's#[^A-Za-z0-9._-]#_#g')"
    docker cp "$C:$f" "$TMP/$safe.live" >/dev/null
    patch --silent "$TMP/$safe.live" < "$PATCH_SRC"
    grep -Fq 'fc-selected-months-enable' "$TMP/$safe.live"
    read -r U G M < <(docker exec "$C" stat -c '%u %g %a' "$f")
    docker cp "$TMP/$safe.live" "$C:/tmp/brimstone-calendar-fullcalendar.js" >/dev/null
    docker exec "$C" install -o "$U" -g "$G" -m "$M" /tmp/brimstone-calendar-fullcalendar.js "$f"
    docker exec "$C" rm -f /tmp/brimstone-calendar-fullcalendar.js
    say "patched: $f"
done

say
say "=== VALIDATE NGINX ==="
docker exec "$C" nginx -t
docker exec "$C" nginx -s reload
sleep 1

say
say "=== VERIFY INSTALLED FILES ==="
docker exec "$C" grep -Fq 'BRIMSTONE_CALENDAR_LOCATION_INSTALLED' "$ASSET_DIR/brimstone-calendar-location.js"
docker exec "$C" grep -Fq 'BRIMSTONE_MASONIC_UI_INSTALLED' "$ASSET_DIR/brimstone-calendar-masonic.js"
docker exec "$C" grep -Fq "$INCLUDE_LINE" "$NGINX_COMMON"
docker exec "$C" test "$(docker exec "$C" grep -Fc "$INCLUDE_LINE" "$NGINX_COMMON")" = "1"
if docker exec "$C" test -e "$NGINX_COMMON_TEMPLATE"; then
    docker exec "$C" test "$(docker exec "$C" grep -Fc "$INCLUDE_LINE" "$NGINX_COMMON_TEMPLATE")" = "1"
fi

for f in "${PATCHABLE[@]}" "${ALREADY[@]}"; do
    [ -n "$f" ] || continue
    docker exec "$C" grep -Fq 'fc-selected-months-enable' "$f"
done

for url in /brimstone-calendar-location.js /brimstone-calendar-masonic.js; do
    docker exec "$C" curl -fsS --connect-timeout 3 --max-time 10 "http://127.0.0.1$url" >/dev/null
    say "HTTP PASS: $url"
done

printf '%s\n' "$BACKUP" > "$BACKUP_ROOT/LAST_SUCCESSFUL_INSTALL"
MUTATED=0
trap - ERR

say
say "============================================================"
say " PASS — BRIMSTONE CALENDAR WORKING BASELINE INSTALLED"
say " Backup: $BACKUP"
say "============================================================"
