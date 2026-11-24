# Prompts para Muse — Lote 1 (GHL · Ilatek)

Pega los prompts **en orden**, uno a la vez. Espera la respuesta de Muse antes de pegar el siguiente.
Ningún prompt pide inventar código: solo navegar, leer, pegar lo que tú le des y verificar.

---

## PROMPT 1 · Abrir el sitio y confirmar contexto (solo lectura)

```
Actúa como yo dentro de mi Chrome. Estás en GoHighLevel (app.gohighlevel.com) con mi sesión.

Tarea (solo lectura, no edites nada):
1. Confirma que la sub-cuenta activa es "Ilatek - PR" (Location ID 8OxUENFVM60EKzqsTcoD). Si no lo es, cámbiala y dime que lo hiciste.
2. Ve a Sites → Websites y abre el website llamado "Ilatek" (Site ID XG0ggFh3pBPpA5s0Pe37).
3. Entra a la pestaña Pages.
4. Dime exactamente qué ves: cuántas páginas lista, y si existen estas cuatro por nombre: Home, Garantia, Política de Privacidad, Terminos y Condiciones.

No abras el editor de ninguna página todavía. No publiques. No cambies nada.
Si algún nombre no coincide, dime el nombre exacto que aparece en pantalla antes de continuar.
```

---

## PROMPT 2 · Diagnóstico del Home (solo lectura)

```
Sigue dentro del website "Ilatek".

Tarea (solo lectura): abre la página "Home" (Page ID JoweAhkuoTlcBowZbBen) en el editor.
Dentro de la página busca el bloque llamado "Custom HTML/JavaScript". NO lo edites todavía.
Pulsa "Open Code Editor" para abrirlo y dime, sin cambiar nada:
1. Cuántos bloques "Custom HTML/JavaScript" tiene la página en total.
2. Cuántos caracteres tiene el contenido del bloque (si el editor no muestra el conteo, dime cuántas líneas o cómo se ve el final del código).
3. Los primeros 100 caracteres del contenido.
4. Los últimos 100 caracteres del contenido.

Referencia: el archivo local de esa página tiene 464.869 caracteres y empieza con "<!-- ILATEK:INTERNAL-LINKS:START -->".

Cierra el editor con Cancelar o Escape, sin guardar. No pulses Save ni Publish.
Después de leer, dime si hay UN solo bloque con el embed completo o si la página está dividida en varios bloques.
```

---

## PROMPT 3 · Diagnóstico de las 3 estáticas (solo lectura)

Repite este prompt cambiando solo las tres líneas marcadas:

```
Sigue dentro del website "Ilatek".

Tarea (solo lectura): abre la página "Garantia" (Page ID BXtziNWh8Zrm3jxBLB7Z) en el editor.
Busca el bloque "Custom HTML/JavaScript", abre "Open Code Editor" y dime sin cambiar nada:
1. Cuántos bloques "Custom HTML/JavaScript" tiene la página.
2. Cuántos caracteres tiene el contenido.
3. Los primeros 100 y los últimos 100 caracteres.

Referencia: el archivo local tiene 237.632 caracteres.

Cierra con Cancelar/Escape sin guardar. No pulses Save ni Publish.
```

Cambia el nombre, el Page ID y la referencia para las otras dos:

| Página | Page ID | Caracteres del archivo local |
|---|---|---|
| Garantia | `BXtziNWh8Zrm3jxBLB7Z` | 237.632 |
| Política de Privacidad | `wUiXO7WAwiLCvRpDsT5x` | 231.682 |
| Terminos y Condiciones | `5YcjXSxjngQjavMxkv1m` | 231.319 |

---

## PROMPT 3.5 · Copia de seguridad del bloque (OBLIGATORIO antes de pegar)

Sin esto no se pega nada. Es la única forma de revertir un bloque que ya se guardó.

```
Antes de tocar nada, guarda una copia del contenido actual del bloque.

1. Abre la página "Home" (Page ID JoweAhkuoTlcBowZbBen) → bloque "Custom HTML/JavaScript" → "Open Code Editor".
2. Copia TODO el contenido del editor tal como está (Ctrl+A, Ctrl+C).
3. Guárdalo en un archivo nuevo con este nombre exacto: backups-ghl/home-20261115-bloque.html
   Si no puedes crear archivos, pégamelo en el chat y lo guardo yo.
4. Dime cuántos caracteres copiaste y CIERRA con Cancelar/Escape, sin modificar el editor.

No pulses Save ni Publish.
```

Repite el mismo prompt para las estáticas cambiando nombre y archivo:
`garantia-20261115-bloque.html`, `politica-20261115-bloque.html`, `terminos-20261115-bloque.html`.

**Referencia ya guardada:** las versiones vivas de las 4 URLs están capturadas en
`documentacion/backups-ghl/` (`home-20261115.html` 1.128.577 B, `garantia-20261115.html` 472.797 B,
`politica-20261115.html` 544.249 B, `terminos-20261115.html` 543.186 B, todas HTTP 200).
Sirven para comparar el HTML servido, no para reponer el bloque: el HTML servido trae el envoltorio de GHL.

---

## PROMPT 4 · Pegar y publicar (una página por vez)

Úsalo **solo** cuando el diagnóstico confirme que la página tiene un único bloque con el embed.
Pega el contenido completo del archivo justo después del prompt, en el mismo mensaje.

```
Vas a reemplazar el embed de una sola página y publicarla.

Página: Home (Page ID JoweAhkuoTlcBowZbBen), website "Ilatek", subcuenta "Ilatek - PR".
Al final de este mensaje te pego el contenido COMPLETO del embed.

Pasos:
1. Abre la página en el editor.
2. Abre el bloque "Custom HTML/JavaScript" → "Open Code Editor".
3. Selecciona todo el contenido y bórralo.
4. Pega el contenido que te doy, completo y tal cual: no cambies URLs, IDs, scripts, estilos, acentos ni los textos que están entre {{ }}.
5. Si el pegado se corta o el editor avisa de un límite, DETENTE y avísame: no publiques nada.
6. Save del editor y luego Save de la página.
7. Publish.
8. Dime la URL publicada que muestra GHL.

No toques ninguna otra página. No toques la página "Blog - Home" bajo ningún motivo.
```

---

## PROMPT 5 · Verificar la URL publicada

```
Verifica la publicación en https://ilatekpr.com/ (para las estáticas: /garantia, /politica-de-privacidad, /terminos-y-condiciones).

Comprueba y dime el resultado de cada punto, con el valor exacto que encuentres:
1. La página responde 200.
2. Aparecen estas tres etiquetas: hreflang="es", hreflang="en" y hreflang="x-default".
3. En la estática, aparece el texto "ILATEK:GHL-VALUES" en el código.
4. Hay exactamente un elemento con id="ilatek-nav" y uno con id="ilatek-footer".
5. No queda ningún {{custom_values...}} sin resolver en el HTML servido.
6. La página se ve bien en desktop y en móvil (cambia el ancho de la ventana).

Si algo falla, dime qué punto y el fragmento exacto del código donde se ve el problema. No corrijas nada por tu cuenta.
```

---

## PROMPT 6 · Cierre del lote

```
Cierra el Lote 1 con esta tabla, una fila por página (Home, Garantia, Política de Privacidad, Terminos y Condiciones):

| Página | Page ID | URL publicada | Estado | Qué se verificó / qué falló |

"Estado" solo puede ser: Publicado, Publicado con avisos, o Fallido.
Después dime qué páginas quedaron pendientes y por qué.
```

---

## PROMPT 7 · Reversión (si el pegado deja la página rota)

```
La página quedó rota o vacía. Vamos a revertir, sin improvisar arreglos.

Página: Home (Page ID JoweAhkuoTlcBowZbBen), subcuenta "Ilatek - PR".

1. Abre la página en Sites → Websites → Ilatek → Pages.
2. Si AÚN no has guardado: cierra el editor con Cancelar/Escape y dime que no se guardó nada.
3. Si ya guardaste pero no publicaste: abre el bloque "Custom HTML/JavaScript" → "Open Code Editor",
   borra todo y pega el contenido de la copia de seguridad backups-ghl/home-20261115-bloque.html.
   Save del editor y Save de la página. No publiques todavía: avísame primero.
4. Si ya publicaste y la página está rota: repite el paso 3 con la copia de seguridad y luego Publish.
5. Verifica: HTTP 200, hreflang es/en/x-default, un solo #ilatek-nav y un solo #ilatek-footer,
   y que no queden {{custom_values...}} sin resolver.
6. Dime qué pasó, en qué paso, y el mensaje exacto que mostró GHL.

No edites el código a mano para "arreglarlo". Restaurar la copia o detenerte y avisar.
Si el builder no carga o no encuentras el bloque, DETENTE y descríbeme la pantalla.
```

Después de revertir, esa página se marca **FALLIDO — necesita revisión** y se pasa a la siguiente.
Nunca se reintenta el pegado más de 2 veces en la misma página.

---

## Reglas que Muse no debe romper

- **Nunca pegar sin copia de seguridad del bloque anterior.** Si no hay respaldo, no hay pegado.
- **Localizar la página por Page ID, nunca por nombre.** La búsqueda por «home» coincide primero con `Blog - Home`, que es el maestro del blog y no se sobrescribe jamás.
- Si el bloque no coincide en forma con el archivo local (por ejemplo la página tiene varios bloques), **parar** y avisar. No pegar.
- Los `{{custom_values.*}}` se pegan literales; GHL los sustituye al publicar.
- Si GHL pide login, verificación o muestra una advertencia sobre el código, **detenerse** y avisar.
