# HANDOFF · Lote 1 de GHL — continuación desde Garantía

**Para:** el chat que ejecuta el Lote 1 (el «hermano»).
**De:** el Vigilante de la operación.
**Última actualización:** 2026-11-15 01:49:16 EST (medición de solo lectura de las cuatro URLs).

> ## ⚠️ EL HOME YA ESTÁ PUBLICADO — NO REPETIR SU PASO A
>
> El Home se publicó a las ~01:43 con el embed nuevo (hreflang 1/1/1, `data-ilatek="webpage-home"`,
> FAQPage, 17/17 secciones, un solo nav y un solo footer) y su respaldo de bloque ya existe
> (`home-20261115-bloque.html`, 472.401 B, 01:42:40).
>
> **No vuelvas a respaldar, pegar ni publicar el Home.** Su Paso A está hecho. Si repites el pegado,
> además de no ganar nada, se pierde la referencia de 1.127.075 bytes contra la que se comprueba que
> el sitio sigue bien.
>
> El trabajo arranca en **Garantía** y sigue con Política de Privacidad y Términos y Condiciones.

**Cómo se usa este archivo:** leerlo completo y ejecutar, tal cual, el bloque único de la sección 5.
No hace falta releer el runbook: sus cifras están desactualizadas (ver sección 3) y provocan un aborto
en falso.

---

## 1 · Qué pasó (bitácora medida, no supuesta)

| Hora | Hecho |
|---|---|
| 01:38:15 | Primer driver del Home (`.tmp-ghl-publicar.py`) arranca y muere ~01:41:20 **sin escribir respaldo**. Nada pegado, nada publicado. |
| 01:42:40 | Aparece `documentacion/backups-ghl/home-20261115-bloque.html` (472.401 B): respaldo del bloque del Home hecho. |
| ~01:43 | **Home publicado** con el embed nuevo. |
| 01:44:27 | Arranca el driver de **Garantía** (`.tmp-ghl-pagina.py Garantia …`). |
| 01:45:21 | Ese driver **muere sin escribir `garantia-20261115-bloque.html`**: la página no se tocó. |
| 01:47:54 | Medición intermedia de las cuatro URLs: mismos valores que la final. |
| 01:49:16 | **Medición final** de las cuatro URLs (sección 2). Ningún driver activo. |

**Conclusión: el lote está detenido en el Paso A de Garantía.** Solo hay un respaldo de bloque en
disco —el del Home—; no existe respaldo de bloque de Garantía, Política ni Términos.

---

## 2 · Estado de las cuatro páginas (medido 2026-11-15 01:49:16 EST)

Medición de solo lectura con `curl -L` y `Cache-Control: no-cache`; sin clics en GHL, sin pegar, sin
Save, sin Publish, sin tocar «Blog - Home».

| Página | URL | HTTP | Bytes | hreflang es/en/x | `ILATEK:GHL-VALUES` | `{{custom_values` | Estado |
|---|---|---|---|---|---|---|---|
| Home | `https://ilatekpr.com/` | 200 | 1.127.075 | **1/1/1** | 6 | 1.032 | **Publicado** (embed nuevo) |
| Garantía | `https://ilatekpr.com/garantia` | 200 | 472.797 | 0/0/0 | 6 | 0 | **Intacta** (sin tocar) |
| Política | `https://ilatekpr.com/politica-de-privacidad` | 200 | 544.249 | 0/0/0 | 10 | 0 | **Intacta** (sin tocar) |
| Términos | `https://ilatekpr.com/terminos-y-condiciones` | 200 | 543.186 | 0/0/0 | 10 | 0 | **Intacta** (sin tocar) |

Comprobaciones extra del Home publicado: `data-ilatek="webpage-home"` = 1, `FAQPage` presente en el
JSON-LD, 17 `<section>` y 17 `</section>` (balanceados), exactamente un `id="ilatek-nav"` y un
`id="ilatek-footer"`.

Los bytes de Garantía (472.797), Política (544.249) y Términos (543.186) son **idénticos** a las
capturas de `documentacion/backups-ghl/*-20261115.html` de las 00:43: esas tres páginas no cambiaron
ni un byte. Referencia del Home **anterior**: 1.128.577 B; si el Home vuelve a ese tamaño, es que se
repuso la versión vieja.

---

## 3 · Cifras que mandan (el runbook está viejo)

Tamaños reales de los embeds locales, contados con `wc -m` el 2026-11-15:

| Página | Page ID | Archivo a pegar | Caracteres |
|---|---|---|---|
| Home (hecho) | `JoweAhkuoTlcBowZbBen` | `home/es/landing-pages/ghl-home-multiservicios.html` | **467.041** |
| Garantía | `BXtziNWh8Zrm3jxBLB7Z` | `garantia/ghl-garantia-embed.html` | **238.431** |
| Política de Privacidad | `wUiXO7WAwiLCvRpDsT5x` | `politica-de-privacidad/ghl-politica-embed.html` | **232.525** |
| Términos y Condiciones | `5YcjXSxjngQjavMxkv1m` | `terminos-y-condiciones/ghl-terminos-embed.html` | **232.161** |

> **AVISO — no abortar en falso.** `MUSE-LOTE-1-RUNBOOK.md` y `PROMPTS-MUSE-LOTE-1.md` citan
> 464.869 / 237.632 / 231.682 / 231.319. Son cifras viejas, entre 800 y 2.200 caracteres por debajo
> del archivo real. La referencia para aceptar o rechazar un pegado es **la lectura de vuelta contra
> la columna «Caracteres» de esta tabla**, nunca el número del runbook.

Los cuatro archivos ya traen `hreflang` es/en/x-default (uno de cada), un solo `#ilatek-nav`, un solo
`#ilatek-footer` y el bloque `ILATEK:GHL-VALUES`. No hay que añadirles nada.

---

## 4 · Tres trampas conocidas

1. **El editor no está en el frame de arriba.** Vive dentro del iframe
   `page-builder.leadconnectorhq.com`. El botón «Open Code Editor» **solo aparece después de
   seleccionar el bloque «Custom HTML/JavaScript»**. Si `get_by_role("button", name="Open Code
   Editor").count() == 0`, hacer clic primero en el bloque; si aun así no aparece, parar y describir
   la pantalla, no improvisar.
2. **Guardar por Page ID, no por nombre.** Antes de abrir el editor hay que confirmar el Page ID en
   la URL del builder, contra el esperado. Si no coincide, abortar sin tocar nada. «home» coincide
   primero con `Blog - Home`, que es el maestro del blog y **no se sobrescribe jamás**.
3. **El nombre de la tarjeta puede llevar tilde.** El runbook escribe «Garantia» sin tilde, pero la
   UI puede mostrar «Garantía»: un filtro por `"Garantia"` no encuentra nada y `.first` puede reventar
   o coger otra tarjeta. Usar la subcadena sin tilde (`"Garant"`, `"Pol"`, `"Termin"`) y validar
   siempre por Page ID.

---

## 5 · PROMPT DE CONTINUACIÓN (pieza única, pegable tal cual)

```
Continúa el Lote 1 de GHL desde Garantía. El Home YA está publicado: NO repitas su Paso A ni vuelvas
a respaldar, pegar o publicar su bloque. Lee antes documentacion/HANDOFF-LOTE-1-20261115.md.

Estado verificado a las 01:49:16 EST (solo lectura): Home 200 / 1.127.075 B / hreflang 1-1-1
(publicado) · Garantía 200 / 472.797 B / hreflang 0-0-0 · Política 200 / 544.249 B / 0-0-0 ·
Términos 200 / 543.186 B / 0-0-0. Las tres estáticas están intactas.

Pendiente, una página a la vez y en este orden: Garantía → Política de Privacidad → Términos y
Condiciones. Cifras de referencia reales (wc -m): Garantía 238431 · Política 232525 · Términos
232161. Las del runbook (237.632 / 231.682 / 231.319) están viejas: NO son motivo de aborto.

Secuencia obligatoria por página:
1. RESPALDO del bloque actual a documentacion/backups-ghl/<slug>-20261115-bloque.html. Sin este
   archivo no se pega nada.
2. PEGAR el archivo local completo y literal: ni una coma cambiada, y los {{custom_values.*}} van
   tal cual.
3. VERIFICAR LA LECTURA DE VUELTA: debe medir exactamente la cifra de esa página. Si no coincide,
   NO guardar.
4. SAVE del editor → SAVE de la página → PUBLISH.
5. VERIFICAR LA URL pública: HTTP 200 · hreflang es/en/x-default (uno de cada) · exactamente un
   id="ilatek-nav" y un id="ilatek-footer" · ILATEK:GHL-VALUES presente.

Página 1 — Garantía (Page ID BXtziNWh8Zrm3jxBLB7Z, archivo garantia/ghl-garantia-embed.html).
Página 2 — Política de Privacidad (Page ID wUiXO7WAwiLCvRpDsT5x, archivo
politica-de-privacidad/ghl-politica-embed.html).
Página 3 — Términos y Condiciones (Page ID 5YcjXSxjngQjavMxkv1m, archivo
terminos-y-condiciones/ghl-terminos-embed.html).

Guardas antes de editar:
- Confirma el Page ID en la URL del builder: debe ser el de la página que vas a tocar. Si no
  coincide, aborta sin tocar nada.
- El editor vive dentro del iframe page-builder.leadconnectorhq.com: «Open Code Editor» solo aparece
  después de seleccionar el bloque «Custom HTML/JavaScript». Si el botón no está, haz clic primero
  en el bloque.
- Filtra la tarjeta con la subcadena sin tilde y valida por Page ID, nunca solo por nombre.
- CDP del Chrome del propietario: http://127.0.0.1:9333 (no cerrar ni recargar esa ventana).

Invocación con el driver, una página cada vez:
python .tmp-ghl-pagina.py Garantia garantia garantia/ghl-garantia-embed.html https://ilatekpr.com/garantia
python .tmp-ghl-pagina.py "Política de Privacidad" politica politica-de-privacidad/ghl-politica-embed.html https://ilatekpr.com/politica-de-privacidad
python .tmp-ghl-pagina.py Terminos terminos terminos-y-condiciones/ghl-terminos-embed.html https://ilatekpr.com/terminos-y-condiciones

CONDICIÓN DE PARADA: si algo falla, restaura el bloque desde su respaldo, avisa con el paso exacto y
el mensaje literal de GHL, y no sigas con la página siguiente. Máximo DOS intentos de pegado por
página; al segundo fallo, esa página se marca FALLIDO — necesita revisión.

Nota que no se corrige: el Home sirve 1.032 apariciones de {{custom_values (antes de publicar eran
1.028). Es condición previa conocida —el párrafo puente se pega literal y se resuelve en el cliente—
y solo se mide antes/después, sin corregirlos: no se toca el párrafo ni se edita código a mano.

No toques «Blog - Home». No repitas el Paso A del Home. No cierres ni recargues la ventana de Chrome
del propietario, no uses headless, no hagas push.
```

---

## 6 · Reglas que no se rompen

- Respaldo primero, siempre. Sin respaldo no hay pegado.
- Localizar la página **por Page ID**, nunca solo por nombre.
- Una página a la vez. Nada de pegar en paralelo.
- Los `{{custom_values.*}}` se pegan literales; GHL los resuelve.
- Si el pegado se corta o el editor avisa de un límite: parar, no publicar.
- Si GHL pide login, verificación o muestra una advertencia sobre el código: parar y avisar.
- Nunca cerrar la ventana ni la pestaña del Chrome del propietario; nunca headless.
- No publicar ni hacer push fuera de las páginas de este lote.

---

## 7 · Cómo comprobar el estado sin tocar GHL

Pedir las cuatro URLs (`/`, `/garantia`, `/politica-de-privacidad`, `/terminos-y-condiciones`) y
mirar tres cosas por página: el código HTTP (200), el tamaño en bytes y los `hreflang` es/en/x-default.

Una estática está publicada cuando sus `hreflang` pasan de 0/0/0 a 1/1/1 y aparece `ILATEK:GHL-VALUES`
con el tamaño de la versión nueva. Si un tamaño retrocede al de la tabla de las 00:43 (472.797 /
544.249 / 543.186), esa página sigue sin publicar. Si el Home pasara de 1.127.075 a 1.128.577 B, se
habría repuesto la versión anterior del Home.
