# Escala tipográfica fluida de titulares

Cómo se comportan los `<h1>` de las páginas de entrega en cada ancho de pantalla,
por qué existe una capa aparte y cómo se comprueba.

## El problema

Cada página declara su titular con un `clamp()` de piso fijo, por ejemplo
`clamp(44px,5vw,72px)`. Por debajo del ancho donde `5vw` alcanza esos 44px gana el
piso, así que el término `vw` nunca se activa: en un teléfono el titular se
renderiza siempre a 44px y se parte en dos, tres o cuatro líneas.

## La solución: una sola capa compartida

`src/compartido/fluid-type.css` define la escala y viaja dentro del bloque
compartido que `tools/apply-internal-links.mjs` inyecta en cada página (el mismo
bloque que lleva `internal-links.js`, `location-values.js` y
`responsive-layout.js`). No hay copias por página: si la escala cambia, cambia
para todo el sitio con `npm run sync:layout`.

Reglas:

1. **Titular de marca (Home).** `.mshero h1` usa
   `min(clamp(40px,6.2vw,82px), calc((100vw - 40px)/11.2))`, es decir el tamaño
   del diseño limitado por el ancho disponible dividido entre la medida real del
   texto. Resultado: **una sola línea de 280px a 1920px**.
2. **Titulares de oración (categorías, servicios y reseñas).** Se conserva la
   curva `vw` y el tope que cada página ya usa (su valor exacto a 1100px) y solo
   se baja el piso a 24px. Al no superar nunca el tamaño aprobado, el titular
   **jamás gana líneas**: en pantallas pequeñas pierde una o dos.
3. **Desde 1101px no cambia nada.** Cada curva termina exactamente en el valor
   que la página ya usa a 1100px, así que no hay salto al cruzar el punto de
   quiebre y el diseño de escritorio queda intacto.

El divisor `11.2` se midió sobre el texto real con la fuente real (Outfit 800,
letter-spacing −0.045em: 10.86em a 280px) más 3% de margen. Si la fuente web no
llega a tiempo, el respaldo Arial mide 12.7em y el titular corto puede partirse
en dos líneas durante esos milisegundos; nunca desborda el ancho de pantalla.

## Qué se comprueba automáticamente

- `npm test` → `verify-responsive.mjs`: la capa está dentro del bloque compartido
  de **cada** página que recibe el runtime, solo escala (ningún `font-size` fijo)
  y todas sus reglas ganan la cascada. La idempotencia de
  `verify-internal-links.mjs` cubre el contenido inyectado.
- `npm run test:responsive` → `test-responsive-browser.mjs`: en cada ancho
  compara el titular **con y sin** la capa (deshabilitando el `<style>` inyectado)
  y exige que no gane líneas, que nunca baje de 24px por debajo de 1101px y que
  el tamaño sea idéntico a partir de 1101px. La garantía de una línea en el Home
  solo se evalúa si Outfit está cargada; si no, se informa como omitida en
  `oneLineSkipped`.

Para medir con la fuente real (la suite es offline por diseño), apunta
`ILATEK_TEST_FONTS` a una caché del CSS de Google Fonts y sus `.woff2`. La caché
vive fuera del repositorio, porque es material de medición, no del sitio:

```bash
FONTS="$LOCALAPPDATA/Temp/pwfonts" && mkdir -p "$FONTS" && cd "$FONTS"
curl -A "Mozilla/5.0 ... Chrome/124.0" -o gf.css \
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400..800&family=Outfit:wght@500..800&display=swap"
# El orden de urls.txt debe ser el del CSS: map.txt lo usa para servir cada woff2.
grep -o "https://fonts.gstatic.com/[^)]*" gf.css | awk '!seen[$0]++' > urls.txt
i=0; while read -r u; do i=$((i+1)); curl -sS "$u" -o "f$i.woff2"; printf "%s\tf%s.woff2\n" "$u" "$i" >> map.txt; done < urls.txt
cd - && ILATEK_TEST_FONTS="$FONTS" ILATEK_PLAYWRIGHT=<playwright-core> \
  ILATEK_CHROMIUM=<chromium> npm run test:responsive
```

En Git Bash, `"$LOCALAPPDATA/Temp/..."` es la ruta que el script recibe como
variable: una ruta POSIX como `/tmp/...` la resolvería Node contra `C:\tmp` y no
encontraría la caché.

## Notas de mantenimiento

- `.gitattributes` marca `*.css` como `eol=lf`: el CSS se inyecta literalmente
  dentro del bloque de cada página, así que un `core.autocrlf=true` reescribiendo
  el archivo haría que la copia inyectada dejara de coincidir en un clon limpio.
- Añadir una familia de titulares nueva significa añadir su selector aquí y su
  caso en `test-responsive-browser.mjs`; el verificador estático exige la regla.
