#!/usr/bin/env bash
# Fetch all internal pages of ilatekpr.com and count unresolved custom-value tokens per page.
HOME_HTML=/tmp/ilatek_home.html
OUT=/tmp/ilatek_pages
TMP=/tmp/ilatek_paths.txt
mkdir -p "$OUT" /tmp_ilatek_dummy 2>/dev/null
rm -f /tmp_ilatek_dummy -r 2>/dev/null
rmdir /tmp_ilatek_dummy 2>/dev/null

# Extract internal paths from token-domain hrefs
grep -o 'https://{{custom_values.website_url}}[a-zA-Z0-9/_-]*' "$HOME_HTML" \
  | sed 's|https://{{custom_values.website_url}}||; s|(.*)$||' | sort -u > "$TMP"

# Fetch each path in parallel
while IFS= read -r p; do
  [ -z "$p" ] && continue
  curl -s --max-time 15 "https://ilatekpr.com$p" -o "$OUT/$(echo "$p" | tr '/' '_').html" &
done < "$TMP"
wait

# Report per page: file size, unresolved token count, and which values
printf '%-55s %8s %8s\n' "PAGE" "SIZE" "TOKENS"
for f in "$OUT"/*.html; do
  base=$(basename "$f" .html | sed 's/^_//; s/_\w*/-/' 2>/dev/null)
  sz=$(wc -c < "$f")
  tok=$(grep -o '{{custom_values[a-zA-Z0-9._ -]*}}' "$f" | wc -l)
  trimmed_path=$(echo "$f" | sed "s|$OUT/||; s|\.html\$||")
  printf '%-55s %8s %8s\n' "$trimmed_path" "$sz" "$tok"
done | sort
