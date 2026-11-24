# Lote 1 · Runbook para Muse (4 páginas)

Pega los prompts **en orden**, uno a uno, esperando la respuesta de Muse.
Entre el prompt «B» y el «C» de cada página, **tú** abres la página local y pulsas el botón para dejar el embed en el portapapeles.

## Datos fijos

| Página | Page ID | Caracteres del embed | Página para copiar |
|---|---|---|---|
| Home | `JoweAhkuoTlcBowZbBen` | 464.869 | `entrega-muse/home-copiar.html` |
| Garantia | `BXtziNWh8Zrm3jxBLB7Z` | 237.632 | `entrega-muse/garantia-copiar.html` |
| Política de Privacidad | `wUiXO7WAwiLCvRpDsT5x` | 231.682 | `entrega-muse/politica-copiar.html` |
| Terminos y Condiciones | `5YcjXSxjngQjavMxkv1m` | 231.319 | `entrega-muse/terminos-copiar.html` |

Carpeta local (ábrelas en una pestaña nueva de tu Chrome):
`C:\Users\Omele\Downloads\Ilatek - Snapshot  - Code\Ilatek\documentacion\entrega-muse\`

Rutas publicadas a verificar: `/`, `/garantia`, `/politica-de-privacidad`, `/terminos-y-condiciones`.

---

# PASO 0 · Contexto (una vez)

```
Actúa como yo dentro de mi Chrome. Estás en GoHighLevel con mi sesión.

Comprueba y dime:
1. Que la sub-cuenta activa es "Ilatek - PR" (Location ID 8OxUENFVM60EKzqsTcoD). Si no, cámbiala y avísame.
2. Que existe el website "Ilatek" (Site ID XG0ggFh3pBPpA5s0Pe37) y que en su pestaña Pages aparecen estas cuatro: Home, Garantia, Política de Privacidad, Terminos y Condiciones.

No edites ni publiques nada todavía. Si algún nombre no coincide, dime el exacto que ves.
```

---

# HOME

## A · Leer y respaldar (solo lectura)

```
Website "Ilatek". Tarea de solo lectura sobre la página "Home" (Page ID JoweAhkuoTlcBowZbBen).

1. Ábrela en el editor y localiza el bloque "Custom HTML/JavaScript". Dime cuántos bloques de ese tipo tiene la página.
2. Abre "Open Code Editor" y dime cuántos caracteres tiene el contenido.
3. Dime los primeros 100 y los últimos 100 caracteres.
4. Copia TODO el contenido y guárdalo en backups-ghl/home-20261115-bloque.html. Si no puedes crear archivos, pégamelo en el chat.
5. Cierra con Cancelar/Escape, sin modificar nada.

Referencia del embed nuevo: 464.869 caracteres, empieza con "<!-- ILATEK:INTERNAL-LINKS:START -->".
No pulses Save ni Publish. Si el bloque actual difiere mucho de la referencia o hay varios bloques, DETENTE y avísame.
```

## B · Pegar y publicar

```
El embed completo ya está en el portapapeles.

Página: "Home" (Page ID JoweAhkuoTlcBowZbBen), website "Ilatek", subcuenta "Ilatek - PR".

1. Abre la página → bloque "Custom HTML/JavaScript" → "Open Code Editor".
2. Selecciona todo y bórralo.
3. Pega con Ctrl+V. No modifiques nada: ni URLs, ni IDs, ni scripts, ni estilos, ni los textos entre {{ }}.
4. Si el pegado se corta o el editor avisa de un límite, DETENTE y avísame: no publiques nada.
5. Save del editor → Save de la página → Publish.
6. Dime la URL publicada y los caracteres que quedaron en el bloque.

No toques ninguna otra página. No toques "Blog - Home".
```

## C · Verificar en vivo

```
Verifica https://ilatekpr.com/ (el home recién publicado) y dime el valor exacto de cada punto:
1. Responde 200.
2. Existen las tres etiquetas: hreflang="es", hreflang="en" y hreflang="x-default".
3. Hay exactamente un id="ilatek-nav" y un id="ilatek-footer".
4. Existe el nodo con data-ilatek="webpage-home".
5. Existe un bloque JSON-LD con "@type":"FAQPage".
6. La página se ve bien en desktop y en móvil.

Si algo falla, dime qué punto y el fragmento de código donde se ve. No corrijas nada por tu cuenta.
```

---

# GARANTIA

## A · Leer y respaldar

```
Website "Ilatek". Solo lectura sobre la página "Garantia" (Page ID BXtziNWh8Zrm3jxBLB7Z).

1. Cuántos bloques "Custom HTML/JavaScript" tiene la página.
2. Caracteres del contenido del bloque principal.
3. Primeros 100 y últimos 100 caracteres.
4. Copia TODO y guárdalo en backups-ghl/garantia-20261115-bloque.html (o pégamelo en el chat).
5. Cierra sin guardar.

Referencia del embed nuevo: 237.632 caracteres. Debe contener el bloque "ILATEK:GHL-VALUES".
```

## B · Pegar y publicar

```
El embed completo ya está en el portapapeles.

Página: "Garantia" (Page ID BXtziNWh8Zrm3jxBLB7Z), website "Ilatek", subcuenta "Ilatek - PR".

Abre la página → bloque "Custom HTML/JavaScript" → "Open Code Editor" → selecciona todo → borra → pega con Ctrl+V, tal cual.
Si el pegado se corta, DETENTE y avísame.
Save del editor → Save de la página → Publish. Dime la URL publicada y los caracteres finales.
No toques "Blog - Home" ni otras páginas.
```

## C · Verificar en vivo

```
Verifica https://ilatekpr.com/garantia y dime:
1. HTTP 200.
2. Las tres etiquetas hreflang (es, en, x-default).
3. Que aparece el texto "ILATEK:GHL-VALUES" en el código.
4. Un solo id="ilatek-nav" y un solo id="ilatek-footer".
5. Que se ve bien en desktop y en móvil.
```

---

# POLÍTICA DE PRIVACIDAD

## A · Leer y respaldar

```
Website "Ilatek". Solo lectura sobre "Política de Privacidad" (Page ID wUiXO7WAwiLCvRpDsT5x).

1. Cuántos bloques "Custom HTML/JavaScript" tiene.
2. Caracteres del contenido del bloque principal.
3. Primeros 100 y últimos 100 caracteres.
4. Copia TODO y guárdalo en backups-ghl/politica-20261115-bloque.html (o pégamelo en el chat).
5. Cierra sin guardar.

Referencia del embed nuevo: 231.682 caracteres. Debe contener el bloque "ILATEK:GHL-VALUES".
```

## B · Pegar y publicar

```
El embed completo ya está en el portapapeles.

Página: "Política de Privacidad" (Page ID wUiXO7WAwiLCvRpDsT5x), website "Ilatek", subcuenta "Ilatek - PR".

Abre la página → bloque "Custom HTML/JavaScript" → "Open Code Editor" → selecciona todo → borra → pega con Ctrl+V, tal cual.
Si el pegado se corta, DETENTE y avísame.
Save del editor → Save de la página → Publish. Dime la URL publicada y los caracteres finales.
No toques "Blog - Home" ni otras páginas.
```

## C · Verificar en vivo

```
Verifica https://ilatekpr.com/politica-de-privacidad y dime:
1. HTTP 200.
2. Las tres etiquetas hreflang (es, en, x-default).
3. Que aparece "ILATEK:GHL-VALUES" en el código.
4. Un solo id="ilatek-nav" y un solo id="ilatek-footer".
5. Que se ve bien en desktop y en móvil.
```

---

# TERMINOS Y CONDICIONES

## A · Leer y respaldar

```
Website "Ilatek". Solo lectura sobre "Terminos y Condiciones" (Page ID 5YcjXSxjngQjavMxkv1m).

1. Cuántos bloques "Custom HTML/JavaScript" tiene.
2. Caracteres del contenido del bloque principal.
3. Primeros 100 y últimos 100 caracteres.
4. Copia TODO y guárdalo en backups-ghl/terminos-20261115-bloque.html (o pégamelo en el chat).
5. Cierra sin guardar.

Referencia del embed nuevo: 231.319 caracteres. Debe contener el bloque "ILATEK:GHL-VALUES".
```

## B · Pegar y publicar

```
El embed completo ya está en el portapapeles.

Página: "Terminos y Condiciones" (Page ID 5YcjXSxjngQjavMxkv1m), website "Ilatek", subcuenta "Ilatek - PR".

Abre la página → bloque "Custom HTML/JavaScript" → "Open Code Editor" → selecciona todo → borra → pega con Ctrl+V, tal cual.
Si el pegado se corta, DETENTE y avísame.
Save del editor → Save de la página → Publish. Dime la URL publicada y los caracteres finales.
No toques "Blog - Home" ni otras páginas.
```

## C · Verificar en vivo

```
Verifica https://ilatekpr.com/terminos-y-condiciones y dime:
1. HTTP 200.
2. Las tres etiquetas hreflang (es, en, x-default).
3. Que aparece "ILATEK:GHL-VALUES" en el código.
4. Un solo id="ilatek-nav" y un solo id="ilatek-footer".
5. Que se ve bien en desktop y en móvil.
```

---

# CIERRE DEL LOTE

```
Cierra el Lote 1 con esta tabla, una fila por página (Home, Garantia, Política de Privacidad, Terminos y Condiciones):

| Página | Page ID | Caracteres pegados | URL publicada | Estado | Qué se verificó o qué falló |

"Estado" solo puede ser: Publicado, Publicado con avisos, o Fallido.
Después dime qué quedó pendiente y por qué, y no pases al Lote 2 hasta que yo te lo pida.
```

---

## Si algo sale mal

Pega esto y **no reintentes el pegado** más de dos veces en la misma página:

```
La página quedó rota o vacía. Vamos a revertir, sin arreglar código a mano.

Página: <NOMBRE> (Page ID <ID>), subcuenta "Ilatek - PR".

1. Si aún no guardaste: cierra con Cancelar/Escape y dime que no se guardó nada.
2. Si guardaste pero no publicaste: abre el bloque "Custom HTML/JavaScript" → "Open Code Editor", borra todo,
   pega el contenido de backups-ghl/<slug>-20261115-bloque.html, Save del editor y Save de la página.
   No publiques: avísame primero.
3. Si ya publicaste roto: haz lo del paso 2 y luego Publish.
4. Verifica: 200, hreflang es/en/x-default, un solo #ilatek-nav y un solo #ilatek-footer.
5. Dime qué pasó, en qué paso, y el mensaje exacto de GHL.
```

## Reglas que no se rompen

- Localizar la página **por Page ID**, nunca por nombre: «home» coincide primero con `Blog - Home`, que es el maestro del blog y no se sobrescribe.
- Nunca pegar sin la copia de seguridad del bloque anterior.
- Los `{{custom_values.*}}` se pegan literales; GHL los resuelve en el cliente.
- Si GHL pide login, verificación o muestra una advertencia sobre el código: detenerse y avisar.
