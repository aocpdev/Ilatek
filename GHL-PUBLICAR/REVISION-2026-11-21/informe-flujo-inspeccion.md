# Punto 2 — Flujo para dar el informe de inspección con fotos

## (a) Qué encontré

- Las páginas `012-inspeccion-de-techos` y `013-inspeccion-y-mantenimiento-de-techos` ya prometen: “subimos, revisamos cada componente, tomamos fotos y entregamos un informe con las recomendaciones ordenadas por prioridad”.
- En GHL hay **3 formularios**: `Calendar - Emergencia` (`mB0wlqTWsMjyYo9kq1F5`), `Contáctanos` (`9UJNpQSLzMmFyzEirLWh`) y `Calendar` (`dEZ6L7tZoEqax2uNoQDc`). **No existe un formulario de informe de inspección.**
- En GHL hay workflows de captura, agenda, notificaciones y reseña. **No hay un workflow de informe de inspección** ni una plantilla única de informe.
- El flujo actual depende de una nota en el contacto y de un correo escrito a mano. Eso explica que el informe cambie de formato y que las fotos no siempre queden en orden.

## (b) Qué propongo (3 pasos, sin herramientas nuevas)

1. **Antes de subir:** el calendario existente confirma fecha, dirección, tipo de techo y urgencia. No se pide un formulario nuevo ni se duplican datos que ya estén en el contacto.
2. **Durante la inspección:** se toman **6 fotos fijas, siempre en el mismo orden**. Se guardan con el nombre `direccion_AAAA-MM-DD_01_techo-general.jpg` … `_06_interior.jpg`.
3. **Después:** se envía **un informe de una página** desde el correo existente y se copia el resumen en la nota del contacto. Las 6 fotos van dentro del informe, en el mismo orden y con pie de foto; no se borra ninguna.

## (c) Orden fijo de las fotos

| # | Foto | Qué debe verse | Pie de foto |
|---|---|---|---|
| 1 | Techo general | Plano amplio, desde el punto más alto o desde la calle | “Estado general del techo” |
| 2 | Acceso y perímetro | Bordes, paredes, remates y acceso | “Acceso y perímetro” |
| 3 | Desagües y canaletas | Bajantes, coladeras y acumulación | “Desagües y canaletas” |
| 4 | Penetraciones | Tubos, tragaluces, equipos y anclajes | “Penetraciones y sellos” |
| 5 | Daño puntual | Grieta, ampolla, óxido o filtración, en primer plano | “Hallazgo principal” |
| 6 | Interior (si aplica) | Mancha o humedad en techo interior | “Interior relacionado” |

Si no aplica la foto 6, se escribe “No aplica” en el informe; no se inventa una foto.

## (d) Plantilla del informe (una página)

```
INFORME DE INSPECCIÓN — ILATEK PROPERTY SOLUTION
Fecha: __ / __ / ____     Inspección: __________     Teléfono: {{custom_values.business__phone}}
Propiedad: ______________________     Municipio: {{custom_values.business__county_name}}
Tipo de techo: concreto / zinc / teja / asfalto / madera / otro: ______

1. RESULTADO EN UNA LÍNEA
______________________________________________________________________

2. PRIORIDADES
[ ] Ahora: ______________________  (riesgo de filtración o seguridad)
[ ] Próximos 30 días: ___________  (mantenimiento preventivo)
[ ] Observación: ________________  (sin acción inmediata)

3. FOTOS (en este orden)
1. Estado general — pie: ______________________
2. Acceso y perímetro — pie: __________________
3. Desagües y canaletas — pie: ________________
4. Penetraciones y sellos — pie: ______________
5. Hallazgo principal — pie: __________________
6. Interior relacionado — pie: ________________

4. SISTEMA RECOMENDADO
Sistema: silicona 100% / membrana asfáltica / elastomérico / poliuretano / acrílico
Motivo: _____________________________________________________________
Precio: desde $250 por servicio, confirmado por escrito después de la inspección.
La inspección de $50 se descuenta del total.

5. SIGUIENTE PASO
[ ] Agendar el servicio   [ ] Mantenimiento preventivo   [ ] Sin acción por ahora
Responsable: ______________________     Fecha: ______________________

Garantía: escrita de mano de obra con materiales certificados. El plazo y las
exclusiones constan en la garantía escrita; no se promete un plazo en años.
```

## (e) Qué simplificar

- **No pedir fotos antes de la visita.** Las fotos se toman en la inspección; pedirlas antes duplica pasos y retrasa la cita.
- **No pedir dos veces la dirección ni el teléfono.** Si el calendario ya los tiene, el informe los toma del contacto.
- **No crear un formulario nuevo de informe.** La nota del contacto y el correo existente bastan.
- **No borrar fotos.** Si una foto sale mal, se repite y se conserva la buena; no se elimina la evidencia.
- **No añadir campos de precio al informe.** El precio se confirma por escrito después de la inspección, como ya promete el sitio.

## (f) Qué NO cambié

- **No cambié ningún formulario de GHL.**
- **No cambié ningún workflow de GHL.**
- **No añadí herramientas, campos ni automatizaciones.**
- No publiqué nada.

## (g) PENDIENTE

1. Confirmar qué campos tiene hoy el calendario de inspección de techos, para no duplicar dirección/teléfono al aplicarlo.
2. Confirmar si el correo de GHL permite adjuntar 6 fotos o si el equipo debe usar un enlace al álbum del contacto. No se asumió una herramienta nueva.
3. Confirmar si el informe se envía desde `ilatek.pr.lead@gmail.com` (remitente actual de los workflows) o desde el correo de la subcuenta.
