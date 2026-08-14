#!/usr/bin/env bash
# Concatena los 4 .webm de la demo en un mp4 unico.
# Uso: bash demo/make-video.sh   (desde la raiz del worktree)
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/demo-videos"
cd "$DIR"

LIST="$(mktemp)"
trap 'rm -f "$LIST"' EXIT
for f in 01-club-crea-y-publica.webm 02-correo-al-papa.webm \
         03-el-papa-firma.webm 04-firmado-digitalmente.webm; do
  [ -f "$f" ] || { echo "falta $f" >&2; exit 1; }
  echo "file '$DIR/$f'" >> "$LIST"
done

# Re-encode (no -c copy): los webm vienen de contextos distintos y el concat
# por copia deja timestamps rotos que algunos reproductores no digieren.
ffmpeg -y -loglevel error -f concat -safe 0 -i "$LIST" \
  -c:v libx264 -pix_fmt yuv420p -r 25 -crf 22 \
  flujo-firma-completo.mp4

echo "OK -> $DIR/flujo-firma-completo.mp4"
ffprobe -v error -show_entries format=duration -of csv=p=0 flujo-firma-completo.mp4
