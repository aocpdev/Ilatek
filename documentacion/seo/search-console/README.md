# Search Console → canibalización

El verificador `tools/verify-cannibalization.mjs` compara las **200 preguntas long tail**
del blog con los datos de Search Console. No usa credenciales ni la API: lee exportes CSV.

## Cómo exportar

1. Search Console → **Rendimiento** → pestaña **Resultados de búsqueda**.
2. Botón **Exportar** → **CSV**. Se descarga un ZIP con varias pestañas; extrae:
   - `Consultas.csv` (o `Queries.csv`), y
   - si está disponible, la vista con **consultas + páginas** (filtra por página y exporta, o usa la API con dimensiones `query,page`).
3. Copia los CSV en `documentacion/seo/search-console/` (no en `fixtures/`).
4. Ejecuta:

```bash
node tools/verify-cannibalization.mjs            # informe, sale 0
node tools/verify-cannibalization.mjs --strict   # sale 1 si hay hallazgos
node tools/verify-cannibalization.mjs --min-impressions 10
```

El informe queda en `documentacion/seo/canibalizacion-report.md`.

## Qué detecta

- **Consulta con varias URLs**: misma consulta con impresiones en más de una página del sitio.
- **Pregunta long tail que compite con otra URL**: una pregunta del blog cuyo texto coincide
  (≥62 % de similitud o ≥80 % de cobertura de términos) con una consulta que Google ya sirve
  desde una página distinta a la del post.
- **Duplicación interna**: dos de las 200 preguntas casi idénticas (≥82 %), siempre, aunque no
  haya exportes.

## Sin datos

Sin exportes el script avisa y solo valida la duplicación interna. Así puede correr en CI sin
credenciales. Con datos reales, úsalo antes de publicar cada lote nuevo.

## Prueba del detector

```bash
node tools/verify-cannibalization.mjs --dir documentacion/seo/search-console/fixtures --strict
```

El fixture contiene dos consultas canibalizadas a propósito: debe salir con código 1 y listarlas.
