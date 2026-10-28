#!/usr/bin/env bash
# Count rendered values on each fetched page
OUT=/tmp/ilatek_pages
check() {
  f="$1"; n=$(basename "$f")
  pr=$(grep -c "Puerto Rico" "$f")
  ph=$(grep -cE "7873209447|\+1 ?787-320-9447" "$f")
  em=$(grep -c "ilatek.pr@gmail.com" "$f")
  ig=$(grep -c "instagram.com/ilatek.pr" "$f")
  fb=$(grep -c "facebook.com/ilatek.pr" "$f")
  px=$(grep -c "fbq('init', '2092249571384387')" "$f")
  fav=$(grep -c "6aa1c05dd953a0128b5348c2" "$f")
  printf '%-45s PR:%-5s PH:%-5s EM:%-5s IG:%-4s FB:%-4s PX:%-4s FAV:%s\n' "$n" "$pr" "$ph" "$em" "$ig" "$fb" "$px" "$fav"
}
for f in "$OUT"/*.html; do check "$f"; done | grep -v "^\s*PR:0 PH:0 EM:0" | sort
