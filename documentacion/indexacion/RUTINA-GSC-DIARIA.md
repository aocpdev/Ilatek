# Rutina diaria — "Solicitar indexación" en Search Console

Estado al **6 de noviembre de 2026**. Este documento basta para lanzar la rutina diaria sin leer el
código del runner.

## Qué hace

`scripts/indexacion/gsc-inspeccion.py` conduce el Chrome del propietario (CDP en
`127.0.0.1:9222`) y pulsa **"Solicitar indexación"** en *Inspección de URLs* de la propiedad
`sc-domain:ilatekpr.com`, exactamente el flujo manual de la interfaz. No usa cuenta de servicio, ni
OAuth propio, ni claves: la autorización es la sesión de Google de ese perfil de Chrome.

## El comando diario

```bash
python scripts/indexacion/gsc-inspeccion.py --limite=40 --yes
```

- `--yes` es obligatorio para enviar de verdad; sin él es dry-run (inspecciona y no pulsa).
- `--limite=N` cuántas URLs intentar en la corrida (por defecto 10; **40** es lo razonable).
- `--probar --url=<url>` inspecciona una URL y muestra veredicto y si el botón existe, sin pulsar.
- `--sin-calentamiento` salta la inspección de calentamiento; `--pausa=4` ajusta la espera entre URLs.

Requisitos: Python 3 con `playwright` (y `websocket-client`), Chrome abierto con
`--remote-debugging-port=9222` y **sesión de Google activa** en ese perfil. No cerrar las ventanas de
Chrome del propietario mientras corre.

## De dónde se reanuda

Todo el estado vive en `Ilatek/documentacion/indexacion/`:

| Archivo | Papel |
|---|---|
| `gsc-cola.txt` | La cola completa: **4.877 URLs** (38 servicios → 1.017 comunidades → 3.822 municipales); las aceptadas se saltan vía `gsc-solicitadas.txt` |
| `gsc-solicitadas.txt` | Las ya aceptadas: el runner las salta, así que se puede cortar y relanzar |
| `gsc-solicitudes.csv` | Ledger incremental: `fecha,url,estado,detalle` |

Estados del ledger: `solicitada` (Google aceptó), `cuota` (techo diario), `sin-boton` (el panel no
mostró el botón), `sin-confirmacion` (se pulsó y no hubo acuse), `no-pulsable` (el clic falló).
Solo `solicitada` mueve la URL a `gsc-solicitadas.txt`; el resto se reintenta en la siguiente corrida.

## Techos medidos y bloqueos reales

- **~46 solicitudes aceptadas por día.** Medido el 6 de noviembre de 2026: 46 aceptadas y, al
  intentar la siguiente, Google respondió *"Cuota superada — No se ha podido procesar esta solicitud
  porque has superado tu cuota diaria. Prueba a enviarla de nuevo mañana."* Es un límite externo:
  no se esquiva repartiendo cuentas ni reintentando en bucle.
- Con 4.831 pendientes (4.877 menos las 46 aceptadas), a ese ritmo son unas **106 jornadas**. El atajo real para el resto es el
  sitemap más el rastreo normal de Google, no esta rutina.
- Bing no se toca desde aquí: va por su API con `scripts/indexacion/lote-diario.mjs` (cola en
  `pendientes-bing.txt`; las URLs que no sirven su propia página se apartan en `muertas-bing.txt`).

## Si la sesión de Google caduca

Síntoma: el runner imprime `✖ Sin sesión de Google en Chrome: inicia sesión en el perfil y relanza.`
y termina en ~2 s con código 2 (antes de gastar nada).

Qué hacer: iniciar sesión en Google en ese mismo Chrome y comprobar que
`search.google.com/search-console` abre la propiedad `ilatekpr.com`. Relanzar el mismo comando.
No hay credenciales en el repo que renovar: la sesión es la del usuario.

## Si la cuota se agota

Síntoma: `⏳ Cuota alcanzada: se detiene sin marcar el resto.` y en el ledger una fila `cuota` cuyo
detalle contiene el texto real de Google (*"Cuota superada…"*). La URL **no** se marca como hecha.

Qué hacer: nada más hoy. Relanzar mañana; la cola sigue donde estaba. El aviso deja un modal abierto
que el propio runner cierra al salir (`cerrar_dialogo`), para que la siguiente corrida no se bloquee.

## Cuidado al hacer pruebas

Probar con `--url=<algo>` sobre una URL **ya aceptada** no sirve como ensayo: Google no devuelve ni
acuse ni aviso al repetir la solicitud en el mismo día y el runner la anota como `sin-confirmacion`,
que es el estado honesto (no se puede confirmar nada). Para validar el flujo, usa una URL pendiente
de `gsc-cola.txt`; `--probar` sirve para mirar sin pulsar, pero tampoco prueba el envío.

## Qué esperar en la salida

```
Search Console · sc-domain:ilatekpr.com · N URL(s) de K en cola
Calentando el panel con https://ilatekpr.com/<algo ya solicitado>
Calentamiento listo: panel operativo.

  ✓ 1/N indexación solicitada · La URL está en Google · https://…
  · 2/N cuota: https://…

  Resumen: solicitadas X · incidencias Y · quedan en cola Z
```

Entre corchetes aparece el tiempo de cada fase (`[propiedad: 4s]`, `[inspeccion: 2s]`,
`[clic+acuse: 17s]`). El calentamiento ronda los 30 s y es el coste fijo de cada corrida; el resto
es de segundos. Cuando la cuota está agotada, la corrida completa tarda ~57 s y termina en el primer
intento, sin reintentos ni esperas colgadas.

El calentamiento existe porque el primer panel de cada corrida carga en frío y a veces no pinta el
botón; gasta ese coste en una URL ya resuelta, sin pulsar nada. Si dice `calentamiento incompleto`,
la corrida continúa igual.
