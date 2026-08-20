#!/usr/bin/env bash
set -Eeuo pipefail

C="${COMMUNITY_C:-onlyoffice-community-server}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/brimstone-calendar}"
BACKUP="${1:-}"

if [ -z "$BACKUP" ]; then
    [ -s "$BACKUP_ROOT/LAST_SUCCESSFUL_INSTALL" ] || {
        echo "No backup specified and no LAST_SUCCESSFUL_INSTALL found" >&2
        exit 1
    }
    BACKUP="$(cat "$BACKUP_ROOT/LAST_SUCCESSFUL_INSTALL")"
fi

MANIFEST="$BACKUP/manifest.tsv"
[ -s "$MANIFEST" ] || { echo "Invalid backup: $BACKUP" >&2; exit 1; }
docker inspect "$C" >/dev/null 2>&1 || {
    echo "CommunityServer container '$C' not found" >&2
    exit 1
}

echo "Restoring Brimstone calendar backup: $BACKUP"

while IFS=$'\t' read -r kind path key; do
    case "$kind" in
        file)
            [ -s "$BACKUP/files/$key" ] || {
                echo "Missing backup payload: $key" >&2
                exit 1
            }
            docker cp "$BACKUP/files/$key" "$C:$path" >/dev/null
            echo "restored $path"
            ;;
        absent)
            docker exec "$C" rm -f "$path"
            echo "removed $path"
            ;;
        *)
            echo "Invalid manifest row: $kind" >&2
            exit 1
            ;;
    esac
done < "$MANIFEST"

docker exec "$C" nginx -t
docker exec "$C" nginx -s reload

echo "PASS — rollback complete"
