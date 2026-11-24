# Lote de republicación — sitio Ilatek (GHL)

108 páginas reales, una carpeta por página en `por-pagina/`. Todo listo para copiar y pegar.

- **49 para REPUBLICAR**: hoy responden 200 con el HTML viejo (menú sin `/blog`, toggle en botón, clima sin luna).
- **59 para CREAR**: hoy dan 404 (las rutas `/en/*`, `/comunidades` y `/en/communities`).

Los 158 archivos del repositorio con menú y footer se reducen a estas 108 rutas: los otros 50 son variantes, copias o envoltorios de la misma ruta y **no se pegan** como páginas aparte. Están en `00-VARIANTES.csv` con su motivo, y la variante elegida para cada página es la columna `archivo_fuente` del checklist.

## Dos archivos por carpeta

| Archivo | Qué es |
|---|---|
| `1-PAGINA.txt` | Nombre, slug, URL, acción, estado de hoy, hash y origen. No se pega. |
| `2-CODIGO-CUSTOM-HTML.html` | El código completo. Se pega entero en Custom Code. |

## Orden de trabajo

1. **Empieza por la 001** (`/`, la home). Valida el flujo con una sola página antes de seguir.
2. Comprueba en ella: menú de 5 ítems sin recorte, enlace `/blog`, toggle «ES/EN» junto al login, clima con sol de día o luna con fase de noche, footer completo. En móvil, que la hamburguesa abra el panel.
3. Sigue en el orden del `00-CHECKLIST.csv` y ve marcando la columna `publicada`.

## Cómo pegar

1. Websites → la página → ⋮ → **Edit**.
2. Elemento **Custom HTML/JavaScript** → **Custom Code** → **Open Code Editor**.
3. Seleccionar todo, borrar y pegar `2-CODIGO-CUSTOM-HTML.html`. **Save** → **Publish**.
4. Abrir la URL publicada y comprobarla.

Para las de **CREAR**: Websites → **+ New page** con el nombre y el slug de `1-PAGINA.txt`, y luego los pasos 2-4.

## Después de publicar

```
node tools/verify-nav.mjs        # guardián del repo: 158 páginas, 0 fallos
node tools/verify-nav-live.mjs   # mide el sitio real ruta por ruta
```

El verificador en vivo debe quedar en `A 0 + B 0 + C 0 + D 98 = 98`. Si aparece algo en **A** es un defecto del HTML pegado; en **B**, una página que falta; en **C**, una página que quedó sin republicar.

## Avisos

- Cada archivo pesa entre 20 y 620 KB: espera a que el editor guarde antes de publicar.
- No pegues nada en el HEADER de estas páginas: el título y la descripción van dentro del embed.
- No actives el footer del tema en estas páginas: el embed ya trae el footer canónico.
- Si tras publicar ves el menú antiguo, GHL sirvió caché: vuelve a publicar.
- Las 6 páginas marcadas en `nota` como «único archivo de la ruta es un envoltorio ghl-*» no tienen sección de clima: se pegan igual, pero si quieres el clima ahí hay que añadirlo antes.
