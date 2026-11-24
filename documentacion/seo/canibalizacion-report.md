# Canibalización · preguntas long tail vs Search Console

Generado: 2026-11-22T13:53:25.435Z
Preguntas analizadas: 194
Exportes leídos: 0
Filas con página: 0

## Hallazgos

- preguntas casi iguales (100%): «¿Cuánto dura el sellado de un techo?» (cuanto-dura-el-sellado-de-un-techo) vs «¿Cuánto dura el sellado de techo?» (garantia-de-sellado-de-techo)

## Avisos

- sin exportes de Search Console en documentacion\seo\search-console

## Cómo actualizar los datos

1. Search Console → Rendimiento → Exportar → CSV.
2. Descarga la pestaña **Consultas** y, si está disponible, la vista con **consultas + páginas**.
3. Copia los CSV en `documentacion/seo/search-console/`.
4. Ejecuta `node tools/verify-cannibalization.mjs --strict`.
