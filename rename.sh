#!/bin/bash
cd "src/assets/merch-photos" || exit 1

count=1
for file in *; do
  if [ -f "$file" ]; then
    ext="${file##*.}"
    ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    mv "$file" "photo${count}.${ext_lower}"
    count=$((count + 1))
  fi
done

echo "Done! Renamed $((count - 1)) files."