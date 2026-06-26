#!/bin/sh
set -e

# Kopieer seed-afbeeldingen naar het volume als ze er nog niet zijn
if [ -d "/app/server/seed-uploads" ]; then
  for f in /app/server/seed-uploads/*; do
    fname=$(basename "$f")
    if [ ! -f "/data/uploads/$fname" ]; then
      cp "$f" "/data/uploads/$fname"
      echo "Geseeded: $fname"
    fi
  done
fi

exec node server/dist/index.js
