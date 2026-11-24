# ILA-TEK · Prompts de imagen social para el blog

Una imagen por cada una de las **118 URLs** del blog (`Ilatek/blog`). Cada prompt está escrito para que la pieza 
**no lleve texto encima**: la imagen ilustra el tema, y el titular, la cifra o el logo se montan después en la 
pieza final. La dirección de arte sigue el prompt maestro de ILA-TEK (paleta, luz, composición y límites legales).

---

## 1. Cómo se usa esta lista

1. Busca la URL de la página en la sección 5 y copia el prompt completo de su bloque.
2. Pega el **Anexo B (negativo)** en el campo de prompt negativo. Si la herramienta no tiene ese campo, 
   añade al final: *Evita todo texto, letras, números, logotipos, etiquetas y marcas de agua.*
3. Genera en **4:5**. Exporta tres versiones del mismo encuadre:
   - `og:image` → **1200 × 630** (recorte centrado, el sujeto debe quedar en el tercio central).
   - Instagram feed → **1080 × 1350**.
   - Stories / Reels cover → **1080 × 1920** (recorte hacia arriba; el espacio del logo se conserva).
4. Monta el **logo oficial** en el espacio negativo de la esquina superior izquierda, a 18–20 % del borde, 
   sin deformarlo y con contraste suficiente. Si no tienes el archivo original, deja el espacio vacío: no se inventa.
5. Nombra el archivo con el slug de la página: `assets/optimized/social/<slug>.jpg` (el índice raíz usa `blog.jpg`).

## 2. Las cinco reglas que no se negocian

| Regla | Por qué |
|---|---|
| **Sin texto de ningún tipo** | Ni titular, ni cifras, ni "antes/después", ni etiquetas en cubetas. El texto vive en el caption y en el overlay posterior. |
| **Sin logotipos** | Ni de ILA-TEK (se monta el oficial) ni de terceros (Cintrón, Danosa, Sika, Soprema, etc.). Las comparativas se ilustran por sistema, no por marca. |
| **Espacio para el logo** | Esquina superior izquierda libre, 18–20 %. Sin él, la pieza no se puede firmar. |
| **La imagen ilustra, no prueba** | No se presenta como evidencia de un trabajo real de ILA-TEK ni como resultado de un cliente (regla 4 del prompt maestro). |
| **Personas creíbles y seguras** | Si aparece gente: guantes, manga larga, gafas y arnés cuando corresponda; gestos naturales, sin poses de catálogo. |

## 3. Dirección de arte común (Anexo A)

Todas las piezas comparten esto; la cola de estilo de cada prompt ya lo resume, pero si quieres reforzarlo, añade este bloque:

> Fotografía editorial corporativa, realismo documental, sin estética de banco de imágenes. Luz natural de día en 
> Puerto Rico: sol alto filtrado, sombras suaves, cielo con nubes alisias. Predominio de azul corporativo #173F69, 
> blanco #F7F8F7 y gris #8B949B; verde natural #6E987B para bienestar y protección; amarillo suave #E4BD59, crema 
> #EDE4D5 y marrón claro #B99D7B solo como acentos. Cemento, metal, agua y vegetación tropical como texturas reales. 
> Composición minimalista, un sujeto protagonista, mucho aire, sin degradados decorativos ni efectos. 
> Vertical 4:5. Nada de texto.

## 4. Prompt negativo (Anexo B)

> texto, letras, palabras, tipografía, números, cifras, titulares, subtítulos, rótulos, etiquetas de producto, texto en 
> cubetas o camiones, carteles, señalética, capturas de pantalla, interfaz, logotipos, marcas registradas, marcas de 
> agua, firmas, sellos, fechas, marcos con texto, collage, cuadrícula, líneas gráficas de comparación, flechas, marcas 
> de verificación, círculos rojos, antes y después, split screen publicitario, iconos, emojis, viñeta excesiva, HDR 
> excesivo, saturación alta, piel plástica, manos deformes, rostros irreales, personas posando de forma imposible, 
> techo flotante, perspectiva imposible, lluvia de dinero, sellos de "garantizado".

## 5. Lista de prompts

Cada entrada: número · URL · título de la página · sección. Debajo, el prompt listo para pegar.

---

### A. Índices del blog (4)

*Portadas de hub y de categoría.*

#### 001 · `/blog`
*Blog de sellado de techos en Puerto Rico | Ilatek* — sección `indice`

> Vista aérea baja de un techo plano de losa blanca recién sellada en un vecindario tropical de Puerto Rico, palmas y casas de colores suaves alrededor, la superficie limpia reflejando el cielo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 002 · `/blog/comparativas`
*Comparativas de sistemas de sellado de techos en Puerto Rico* — sección `indice`

> Dos muestras de sistema lado a lado sobre una misma losa: a la izquierda membrana asfáltica en rollo con granilla, a la derecha una superficie líquida blanca satinada, separadas por una junta limpia de concreto, vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 003 · `/blog/comunidades-y-servicios`
*Comunidades y servicios de Ilatek en Puerto Rico* — sección `indice`

> Vista aérea de un residencial puertorriqueño con techos planos blancos, patios y calles arboladas, luz cálida de tarde, sensación de comunidad bien cuidada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 004 · `/blog/preguntas-frecuentes`
*Preguntas frecuentes sobre sellado de techos en Puerto Rico* — sección `indice`

> Dueña de casa de pie en el borde de su techo plano, mirando una grieta fina con atención, libreta de páginas en blanco en la mano, luz de mañana, cielo despejado. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

---

### B. Comparativas (100)

*Sistema contra sistema, marca contra marca, por tipo de techo, precio, proceso y garantía.*

#### 005 · `/blog/acrilico-elastomerico-vs-membrana-asfaltica`
*Acrílico elastomérico vs. membrana asfáltica* — sección `materiales`

> Dos tramos de losa contiguos: izquierda recubrimiento acrílico azul claro aplicado fino, derecha membrana asfáltica negra con granilla mineral; una junta de concreto separa ambos, vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 006 · `/blog/acrilico-elastomerico-vs-membrana-liquida`
*Acrílico elastomérico vs. membrana líquida* — sección `proceso`

> Un aplicador vierte membrana líquida gris desde una jarra sin etiqueta sobre la losa, mientras al lado se ve una capa acrílica blanca ya curada; manos con guantes, luz suave de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 007 · `/blog/acrilico-elastomerico-vs-sistema-multicapa`
*Acrílico vs. sistema multicapa con garantía* — sección `garantia-leyes`

> Tres franjas paralelas sobre la misma losa: blanca fina, gris intermedia y blanca gruesa con malla de refuerzo asomando en el borde; vista cenital ordenada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 008 · `/blog/acrilico-elastomerico-vs-tpo-pvc`
*Acrílico elastomérico vs. TPO o PVC* — sección `materiales`

> Techo comercial grande a media instalación: una zona con lámina termoplástica blanca soldada y costuras visibles, otra con recubrimiento acrílico; vista aérea oblicua, unidades de aire al fondo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 009 · `/blog/cintron-vs-danosa`
*Sistema Cintrón vs. Danosa: ¿cuál te conviene?* — sección `garantia-leyes`

> Dos operarios en techos vecinos: uno aplica recubrimiento líquido blanco con rodillo, otro alinea un rollo de membrana asfáltica; misma hora, camisas de trabajo lisas, vehículos sin rotulación. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 010 · `/blog/cintron-vs-lanco`
*Sistema Cintrón vs. Lanco: marca propia o ferretería* — sección `garantia-leyes`

> Contraste de contexto: en la calle un camión de servicio con equipo profesional sin rotulación, y en el techo de al lado una persona aplicando con rodillo y un galón genérico; vista desde la escalera. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 011 · `/blog/cintron-vs-marin-membrana`
*Sistema Cintrón vs. Marín Membrana* — sección `garantia-leyes`

> Dos cubetas genéricas sin etiqueta sobre la losa, una con líquido blanco espeso y otra con líquido gris; cuchara de aplicación y probeta de vidrio al lado, vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 012 · `/blog/cintron-vs-windmar`
*Sistema Cintrón vs. WindMar Roofing* — sección `proceso`

> Dos cuadrillas trabajando en techos de casas vecinas, ambas con casco y camisa de trabajo lisa, escaleras y andamios, vista desde una loma cercana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 013 · `/blog/cintronator-vs-duroseal`
*Cintronator vs. DUROSEAL: sistemas de poliuretano* — sección `proceso`

> Dos juegos de poliuretano ordenados sobre lona: galón A, galón B y bandeja en cada uno, uno a cada lado de la losa, etiquetas en blanco, vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 014 · `/blog/como-elegir-contratista-de-sellado-en-puerto-rico`
*Cómo elegir un contratista de sellado en Puerto Rico* — sección `garantia-leyes`

> Apretón de manos entre una dueña de casa y un contratista con chaleco y casco frente a una casa puertorriqueña, camión de trabajo sin rotulación al fondo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 015 · `/blog/conspro-bullbond-vs-cintron`
*Conspro Bull-Bond vs. Sistema Cintrón: comparación* — sección `garantia-leyes`

> Aplicación de sistema multicapa: imprimador verde claro extendido en una franja, malla de refuerzo a la vista y acabado blanco en la siguiente; manos enguantadas, vista cercana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 016 · `/blog/conspro-bullbond-vs-danosa`
*Bull-Bond vs. Danosa: líquido contra membrana* — sección `garantia-leyes`

> Losa dividida en dos: una mitad con sistema líquido multicapa blanco en proceso, la otra con membrana asfáltica ya instalada y rodillo de presión; vista aérea baja. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 017 · `/blog/conspro-bullbond-vs-lanco`
*Bull-Bond vs. Lanco: sistema o mantenimiento* — sección `garantia-leyes`

> Superficie preparada y marcada con tiza esperando el sistema completo, frente a una losa vecina con restos de recubrimiento viejo y grietas abiertas; luz dura de mediodía. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 018 · `/blog/conspro-bullbond-vs-marin-membrana`
*Bull-Bond vs. Marín Membrana: precios y garantía* — sección `garantia-leyes`

> Dos losas de casas vecinas, una con sistema blanco de varias capas y otra con líquido gris recién aplicado, mismo ángulo y misma hora, vista elevada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 019 · `/blog/conspro-bullbond-vs-soprema`
*Bull-Bond vs. Soprema para techo industrial* — sección `garantia-leyes`

> Nave industrial con techo de lámina metálica y rollos de membrana apilados en un extremo, mientras al fondo se ve un área residencial sellada en blanco; vista desde dron. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 020 · `/blog/conspro-bullbond-vs-windmar`
*Bull-Bond vs. WindMar: producto contra servicio* — sección `proceso`

> Casa con techo recién sellado en blanco y una familia en el patio, camión de instalador y escalera apoyada al fondo, luz cálida de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 021 · `/blog/cuando-sellar-el-techo-en-puerto-rico`
*Cuándo sellar el techo en Puerto Rico: calendario* — sección `proceso`

> Ventana abierta de una casa con cielo despejado y techo plano visible afuera, cortina liviana moviéndose, luz seca de mañana, sensación de ventana de trabajo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 022 · `/blog/cuantas-canas-de-sellador-necesito`
*¿Cuántas pailas de sellador necesito para mi techo?* — sección `proceso`

> Cubetas genéricas apiladas junto a una losa marcada en cuadrícula con tiza, cinta métrica extendida y una calculadora apagada sobre el concreto; vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 023 · `/blog/cuanto-cuesta-sellar-un-techo-de-1200-pies`
*Sellar un techo de 1,200 pies cuadrados: costo real* — sección `proceso`

> Casa pequeña de una planta con techo plano blanco recién sellado, vista aérea cenital que muestra la geometría completa del techo, el patio y el jardín. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 024 · `/blog/cuanto-cuesta-sellar-un-techo-en-puerto-rico`
*¿Cuánto cuesta sellar un techo en Puerto Rico?* — sección `proceso`

> Técnico mostrando una tableta con pantalla en blanco a una pareja frente a su casa, techo plano al fondo, gesto natural de explicación, luz de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 025 · `/blog/cuanto-dura-el-sellado-de-un-techo`
*¿Cuánto dura el sellado de un techo en Puerto Rico?* — sección `proceso`

> Macro del borde de una membrana blanca envejecida: una zona nueva brillante y otra desgastada por el sol, junta visible, textura y polvo fino. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 026 · `/blog/cuanto-tarda-el-sellado-de-un-techo`
*¿Cuánto tarda el sellado de un techo?* — sección `proceso`

> Techo a medio sellar: un tercio limpio, un tercio con imprimador verde claro y un tercio con acabado blanco brillante, vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 027 · `/blog/danosa-vs-polyglass`
*Danosa vs. Polyglass: membrana asfáltica en PR* — sección `garantia-leyes`

> Dos rollos de membrana asfáltica sobre palets en un techo comercial al atardecer, uno liso y brillante, otro con granilla mineral, operario revisando el borde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 028 · `/blog/danosa-vs-sika`
*Danosa vs. Sika: asfáltica o PVC* — sección `garantia-leyes`

> Techo comercial con dos zonas: membrana asfáltica negra en una y lámina de PVC gris claro soldada en la otra, vista oblicua, cielo cargado. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 029 · `/blog/danosa-vs-soprema`
*Danosa vs. Soprema: membranas asfálticas* — sección `garantia-leyes`

> Rollo de membrana desenrollado a medio instalar sobre la losa, soplete de gas apagado al lado, humo tenue, enfoque en la textura del material. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 030 · `/blog/danosa-vs-windmar`
*Danosa vs. WindMar: membrana o silicona* — sección `proceso`

> Mitad de techo con rollo asfáltico negro y mitad con silicona blanca brillante, línea divisoria recta y limpia, vista aérea. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 031 · `/blog/errores-comunes-al-sellar-un-techo`
*Errores comunes al sellar un techo (y cómo evitarlos)* — sección `proceso`

> Losa con defectos evidentes: grieta sin abrir, zona sin barrer con hojas secas y una mano de producto demasiado fina, luz dura de mediodía, tono documental. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 032 · `/blog/garantia-de-sellado-de-techo`
*Garantía de sellado de techo: qué exigir por escrito* — sección `proceso`

> Borde de techo donde el sellado se levantó en una burbuja, dedo enguantado señalando el defecto, textura clara y concreto visible debajo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 033 · `/blog/junta-de-impermeabilizacion-de-techos-de-puerto-rico`
*Junta de Impermeabilización de Techos de Puerto Rico* — sección `garantia-leyes`

> Sala de reuniones institucional con planos enrollados y una maqueta de techo sobre la mesa, sillas ordenadas, luz de ventana, sin rótulos. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 034 · `/blog/licencia-y-permisos-para-sellado-de-techo-en-puerto-rico`
*Licencia y permisos para sellar techos en Puerto Rico* — sección `garantia-leyes`

> Carpeta azul cerrada, sello de goma y credencial en blanco sobre un escritorio con planos al fondo, vista cenital, luz lateral. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 035 · `/blog/mantenimiento-del-sellado-cada-cuantos-anos`
*Cada cuántos años dar mantenimiento al sellado* — sección `proceso`

> Técnico arrodillado inspeccionando el borde de un techo blanco de varios años, tabla de madera y palanca en la mano, luz de mañana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 036 · `/blog/maravilla-vs-top-seal`
*La Maravilla vs. TOP SEAL: acrílicos y elastoméricos* — sección `proceso`

> Dos baldes genéricos con recubrimiento, uno blanco y otro crema, brochas y rodillos pequeños al lado, detalle de la consistencia en primer plano. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 037 · `/blog/marin-membrana-vs-danosa`
*Marín Membrana vs. Danosa: líquido o rollo* — sección `proceso`

> Losa residencial con sistema líquido gris a medio aplicar en un lado y rollo asfáltico en el otro, ambos sin terminar, vista desde la escalera. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 038 · `/blog/marin-membrana-vs-lanco`
*Marín Membrana vs. Lanco para techo residencial* — sección `proceso`

> Techo de una casa modesta con recubrimiento acrílico blanco aplicado por el propio dueño con rodillo, y al fondo un techo recién sellado por una cuadrilla uniformada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 039 · `/blog/marin-membrana-vs-windmar`
*Marín Membrana vs. WindMar: líquido o silicona* — sección `proceso`

> Dos casas vecinas al atardecer: una con techo gris recién aplicado en capas, otra con techo blanco brillante, vista aérea. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 040 · `/blog/membrana-asfaltica-vs-membrana-liquida`
*Membrana asfáltica vs. membrana líquida* — sección `proceso`

> Corte transversal de techo en exhibición sobre una mesa: capas de membrana asfáltica apiladas a un lado y capas líquidas aplicadas al otro, sin rótulos. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 041 · `/blog/membrana-asfaltica-vs-sistema-multicapa`
*Membrana asfáltica vs. sistema multicapa líquido* — sección `garantia-leyes`

> Reemplazo completo: rollo nuevo extendido sobre losa desnuda en primer plano y al fondo un techo rehabilitado en blanco con malla, contraste de escala. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 042 · `/blog/membrana-asfaltica-vs-tpo-pvc`
*Membrana asfáltica vs. TPO o PVC* — sección `garantia-leyes`

> Techo comercial grande: rollo asfáltico negro en una sección y lámina termoplástica blanca soldada en otra, vista desde el aire con cielo de nubes alisias. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 043 · `/blog/membrana-liquida-vs-sistema-multicapa`
*Membrana líquida vs. sistema multicapa de marca* — sección `garantia-leyes`

> Detalle de dos losas: una con dos capas líquidas y otra con cuatro capas incluido refuerzo, bordes delimitados con cinta de papel en blanco. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 044 · `/blog/membrana-liquida-vs-tpo-pvc`
*Membrana líquida vs. TPO para techo plano* — sección `materiales`

> Techo plano con acceso por escalera: a un lado membrana líquida aplicada a rodillo, al otro rollo termoplástico esperando sobre palet, herramientas ordenadas. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 045 · `/blog/poliuretano-vs-acrilico-elastomerico`
*Poliuretano vs. acrílico elastomérico para techos* — sección `proceso`

> Zona de tránsito: huellas de zapato sobre acabado blanco acrílico desgastado y, al lado, poliuretano ámbar resistente bajo una base de equipo pesado. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 046 · `/blog/poliuretano-vs-membrana-asfaltica`
*Poliuretano vs. membrana asfáltica: precio y duración* — sección `proceso`

> Techo con equipos de aire sobre poliuretano gris y, contiguo, membrana asfáltica negra recién instalada, vista cercana desde el borde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 047 · `/blog/poliuretano-vs-membrana-liquida`
*Poliuretano vs. membrana líquida para losa* — sección `proceso`

> Dos aplicadores en el mismo techo: uno mezcla poliuretano ámbar en balde y otro extiende membrana líquida gris con rodillo, trabajo coordinado. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 048 · `/blog/poliuretano-vs-sistema-multicapa`
*Poliuretano suelto vs. sistema multicapa completo* — sección `garantia-leyes`

> Un galón genérico de poliuretano solo sobre la losa, frente a un conjunto completo de imprimador, base, refuerzo y acabado alineados; vista cenital. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 049 · `/blog/poliuretano-vs-tpo-pvc`
*Poliuretano vs. TPO: techo comercial en Puerto Rico* — sección `sustratos`

> Nave comercial con techo metálico: una mitad rehabilitada con poliuretano y la otra con membrana termoplástica blanca, vista aérea rasante. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 050 · `/blog/por-que-varia-el-precio-del-sellado-de-techo`
*Por qué varía tanto el precio del sellado de techo* — sección `proceso`

> Tres carpetas azules cerradas sobre una mesa con plano y cinta métrica, luz lateral, sombras largas, sin ningún rótulo visible. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 051 · `/blog/precio-por-pie-cuadrado-sellado-de-techo`
*Precio por pie cuadrado del sellado de techo en PR* — sección `proceso`

> Manos con cinta métrica marcando un cuadrado de un pie sobre la losa con tiza y escuadra, vista cenital, textura del concreto en detalle. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 052 · `/blog/preguntas-para-hacerle-a-un-sellador-de-techos`
*9 preguntas que debes hacerle a un sellador de techos* — sección `garantia-leyes`

> Dueño de casa entrevistando a un técnico en el techo: uno señala una grieta, el otro toma notas en una libreta de páginas en blanco, luz natural. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 053 · `/blog/primer-bullbond-vs-primer-cintron`
*Imprimador Bull-Bond vs. imprimador Cintrón* — sección `garantia-leyes`

> Dos bandejas con imprimador, una verde claro y otra ámbar, brochas de cerdas al lado, aplicadas sobre franjas de concreto; vista cercana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 054 · `/blog/puedo-sellar-mi-techo-sobre-el-sellado-viejo`
*¿Puedo sellar sobre el sellado viejo de mi techo?* — sección `proceso`

> Prueba sobre recubrimiento viejo: cuadrado cortado con cuchilla y una porción levantada mostrando el concreto debajo, textura clara. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 055 · `/blog/que-sistema-de-sellado-dura-mas-anos`
*Qué sistema de sellado de techo dura más años* — sección `proceso`

> Tres muestras de membrana envejecida colgadas en un tablero de madera con distinto desgaste, luz de taller, sin etiquetas. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 056 · `/blog/se-puede-sellar-un-techo-con-filtracion-activa`
*Sellar un techo con filtración activa: ¿se puede?* — sección `proceso`

> Grieta con una gota de agua suspendida y mancha de humedad extendida en el concreto, dedo enguantado señalando, macro a contraluz. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 057 · `/blog/se-puede-sellar-un-techo-mojado`
*¿Se puede sellar un techo mojado o con lluvia?* — sección `proceso`

> Losa con charcos después de lluvia, reflejos del cielo gris, hojas flotando y una escoba apoyada, nadie trabajando. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 058 · `/blog/sellado-de-techo-antes-de-la-temporada-de-huracanes`
*Sellado de techo antes de la temporada de huracanes* — sección `proceso`

> Techo blanco recién sellado bajo un cielo de mayo despejado, palma inclinada por la brisa y horizonte marino al fondo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 059 · `/blog/sellado-de-techo-comercial`
*Sellado de techo comercial: sistemas y garantías* — sección `garantia-leyes`

> Plaza comercial con techos planos blancos, unidades de aire y fachadas limpias sin rótulos, vista aérea al atardecer. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 060 · `/blog/sellado-de-techo-con-equipos-de-aire`
*Sellar el techo alrededor de equipos de aire* — sección `proceso`

> Detalle de la base de una unidad de aire sobre la losa: anclajes sellados con poliuretano gris, tornillos y brida, manos con guantes y llave. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 061 · `/blog/sellado-de-techo-con-garantia-escrita`
*Sellado de techo con garantía escrita: qué debe decir* — sección `garantia-leyes`

> Documento en blanco sobre tabla de madera con clips, una muestra de membrana y una pluma al lado, sombra de mano, luz de ventana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 062 · `/blog/sellado-de-techo-con-paneles-solares`
*Sellado de techo con paneles solares* — sección `proceso`

> Techo con paneles solares instalados y el área sellada alrededor de los soportes, vista aérea, reflejos del sol en el vidrio. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 063 · `/blog/sellado-de-techo-de-aluminio`
*Sellado de techo de aluminio: juntas y oxidación* — sección `sustratos`

> Techo de lámina de aluminio corrugado con juntas y tornillos, aplicador sellando un traslape con cartucho, macro del metal y la herramienta. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 064 · `/blog/sellado-de-techo-de-asfalto`
*Sellado de techo de asfalto: compatibilidad primero* — sección `proceso`

> Techo de asfalto granulado con un parche nuevo que contrasta con el viejo, rodillo y balde genérico al lado, vista desde el borde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 065 · `/blog/sellado-de-techo-de-concreto`
*Sellado de techo de concreto: guía para losas en PR* — sección `proceso`

> Losa de concreto con grietas finas y remate contra la pared, pendiente visible, escoba y sellador en primer plano, luz rasante. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 066 · `/blog/sellado-de-techo-de-concreto-vs-membrana-asfaltica`
*Losa de concreto: sellar o poner membrana asfáltica* — sección `garantia-leyes`

> Mitad de losa rehabilitada en líquido blanco y mitad cubierta con membrana asfáltica nueva, vista aérea con la junta central bien marcada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 067 · `/blog/sellado-de-techo-de-condominio`
*Sellado de techo en condominios: cómo se organiza* — sección `proceso`

> Techo compartido de un condominio con varias secciones, técnicos coordinados y barreras de seguridad, vista aérea, áreas comunes alrededor. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 068 · `/blog/sellado-de-techo-de-hormigon-poroso`
*Hormigón poroso: sellar o rellenar primero* — sección `proceso`

> Macro de concreto poroso absorbiendo líquido: una gota expandiéndose sobre la superficie rugosa, poros abiertos en detalle. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 069 · `/blog/sellado-de-techo-de-madera`
*Sellado de techo de madera: qué funciona y qué no* — sección `proceso`

> Estructura de techo de madera con tablones y ventilación, aplicador con brocha sellando una junta, luz cálida filtrada entre las tablas. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 070 · `/blog/sellado-de-techo-de-shingle`
*Sellado de techo de shingle: límites reales* — sección `materiales`

> Techo de shingle gris con tejas levantadas por el sol, mano enguantada revisando el borde, vista inclinada, textura granulada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 071 · `/blog/sellado-de-techo-de-teja`
*Sellado de techo de teja: juntas, remates y calor* — sección `proceso`

> Techo de teja roja con cumbrera y remate, aplicador sellando una unión con cartucho flexible, sombra dura y calor visible. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 072 · `/blog/sellado-de-techo-de-terraza-transitable`
*Sellado de terraza transitable: qué sistema aguanta* — sección `proceso`

> Terraza transitable con acabado gris texturizado, muebles de exterior y plantas, vista desde la puerta, luz de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 073 · `/blog/sellado-de-techo-de-zinc`
*Sellado de techo de zinc en Puerto Rico: cómo se hace* — sección `sustratos`

> Techo de zinc acanalado con tornillos nuevos y traslapes sellados, vista rasante que resalta las ondas del metal contra el cielo tropical. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 074 · `/blog/sellado-de-techo-de-zinc-vs-silicona`
*¿Silicona en techo de zinc? Qué aguanta el metal* — sección `proceso`

> Detalle comparativo: una junta metálica con sellador flexible gris y, al lado, una franja de silicona blanca agrietada sobre zinc, macro. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 075 · `/blog/sellado-de-techo-despues-de-un-huracan`
*Sellado de techo después de un huracán: orden correcto* — sección `proceso`

> Techo con ramas caídas y membrana desprendida tras una tormenta, cielo despejándose, nadie trabajando, tono documental y sobrio. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 076 · `/blog/sellado-de-techo-en-condominio-quien-paga`
*Condominio: quién paga el sellado del techo* — sección `garantia-leyes`

> Área común de condominio vista desde el techo: pasillo, jardín y puertas de apartamentos, plano enrollado en primer plano sobre la losa. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 077 · `/blog/sellado-de-techo-en-epoca-de-lluvia`
*¿Se puede sellar un techo en época de lluvia?* — sección `proceso`

> Lluvia cayendo sobre un techo plano con charcos, cielo gris, gotas congeladas en el aire, sensación de espera. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 078 · `/blog/sellado-de-techo-en-zonas-costeras`
*Sellado de techos en zonas costeras de Puerto Rico* — sección `proceso`

> Techo cerca del mar: salitre visible en el metal, olas al fondo, acabado blanco contrastando con oxidación ligera en los tornillos. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 079 · `/blog/sellado-de-techo-industrial`
*Sellado de techo industrial: especificación y viento* — sección `garantia-leyes`

> Galpón industrial con techo de lámina y membrana, estructura de acero a la vista, técnicos con arnés, vista amplia desde el aire. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 080 · `/blog/sellado-de-techo-olor-y-tiempo-de-curado`
*Olor y curado del sellador de techo: qué esperar* — sección `proceso`

> Habitación con ventana abierta que muestra el techo recién sellado afuera, cortina liviana moviéndose, persona respirando tranquila de espaldas. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 081 · `/blog/sellado-de-techo-para-airbnb-o-alquiler-corto`
*Sellado de techo para Airbnb y alquiler a corto plazo* — sección `proceso`

> Terraza de alquiler con hamaca, plantas y vista al mar, el techo blanco sobre la escena, sensación de descanso sin interrupciones. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 082 · `/blog/sellado-de-techo-plano`
*Sellado de techo plano en Puerto Rico: guía práctica* — sección `proceso`

> Techo plano extenso de una casa puertorriqueña desde arriba, con tanque de agua, respiraderos y bordes definidos, geometría limpia. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 083 · `/blog/sellado-de-techo-plano-con-empozamiento`
*Empozamiento de agua en el techo: qué hacer* — sección `proceso`

> Charca de agua estancada en una depresión de la losa reflejando el cielo, una hoja flotando, vista cenital y textura del agua quieta. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 084 · `/blog/sellado-de-techo-por-mi-cuenta-o-contratista`
*¿Sellado de techo por mi cuenta o con contratista?* — sección `proceso`

> Dueño de casa con rodillo en el techo y escalera de aluminio, y al fondo una cuadrilla con equipo completo trabajando en otra casa. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 085 · `/blog/sellado-de-techo-precio-mano-de-obra`
*Sellado de techo: cuánto se cobra solo de mano de obra* — sección `garantia-leyes`

> Dos técnicos en el techo, uno aplicando y otro preparando la superficie, herramientas ordenadas y un reloj de cocina en el borde de la losa. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 086 · `/blog/sellado-de-techo-que-no-dure-un-ano`
*Por qué tu sellado de techo no duró ni un año* — sección `garantia-leyes`

> Sellado reventado: ampollas y desprendimiento sobre la losa con polvo y hojas acumuladas, macro con luz dura. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 087 · `/blog/sellado-de-techo-reflectivo-y-consumo-de-energia`
*Techo blanco reflectivo: ¿baja el aire acondicionado?* — sección `proceso`

> Techo blanco reflectivo bajo sol fuerte, reflejo intenso, sombra de palma sobre la losa y unidad de aire acondicionado en el patio. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 088 · `/blog/sellado-de-techo-residencial`
*Sellado de techo residencial: qué pide una casa* — sección `proceso`

> Casa de una planta en Puerto Rico con techo plano blanco recién sellado, jardín, reja y cielo de tarde, vista ligeramente elevada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 089 · `/blog/sellado-de-techo-vs-impermeabilizacion`
*Sellado vs. impermeabilización de techo: diferencia* — sección `proceso`

> Comparación en el mismo techo: un parche puntual sellado en una esquina frente a la losa completa cubierta con membrana, vista aérea. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 090 · `/blog/sellado-de-techo-y-moho-en-el-techo`
*Moho en el techo: por qué sale y cómo se evita* — sección `proceso`

> Manchas de moho verde oscuro en una esquina húmeda del techo, gotera al fondo, textura y humedad visibles a contraluz. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 091 · `/blog/sellado-de-techo-y-seguro-del-hogar`
*¿El seguro cubre el sellado del techo?* — sección `garantia-leyes`

> Persona tomando fotos de su techo con el celular desde el patio antes de la inspección, casa al fondo, luz de mañana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 092 · `/blog/sellado-de-techos-escolares`
*Sellado de techos escolares e institucionales* — sección `proceso`

> Techo plano de una escuela con unidades de aire y barandas, patio escolar con cancha al fondo, vista aérea. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 093 · `/blog/sika-vs-polyglass`
*Sika vs. Polyglass: PVC contra autoadhesiva* — sección `garantia-leyes`

> Techo comercial: lámina de PVC gris soldada con costura limpia frente a membrana autoadhesiva negra, vista cercana y ordenada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 094 · `/blog/sil-hs-vs-king-of-silicone`
*SIL HS vs. King of Silicone: siliconas 100%* — sección `proceso`

> Dos cubetas genéricas de silicona blanca, una abierta mostrando la consistencia, espátula y probeta al lado, fondo de losa blanca. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 095 · `/blog/silicona-100-vs-acrilico-elastomerico`
*Silicona 100% vs. acrílico elastomérico: ¿cuál elegir?* — sección `proceso`

> Losa con mitad en silicona blanca brillante y mitad en acrílico mate, junta recta, un charco de agua deslizándose sobre la silicona. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 096 · `/blog/silicona-100-vs-membrana-asfaltica`
*Silicona 100% vs. membrana asfáltica para techo* — sección `proceso`

> Techo con rollo asfáltico negro en un extremo y silicona blanca en el otro, ambos nuevos, vista aérea con la línea divisoria visible. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 097 · `/blog/silicona-100-vs-membrana-liquida`
*Silicona 100% vs. membrana líquida de tres capas* — sección `proceso`

> Detalle de espesor en exhibición: una capa gruesa de silicona en el borde frente a tres capas finas de membrana líquida, corte sobre mesa de trabajo. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 098 · `/blog/silicona-100-vs-poliuretano`
*Silicona 100% vs. poliuretano para techos en Puerto Rico* — sección `proceso`

> Dos tramos de losa, uno blanco de silicona con agua empozada y otro ámbar de poliuretano con equipos encima, vista elevada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 099 · `/blog/silicona-100-vs-sistema-multicapa`
*Silicona suelta vs. sistema multicapa con garantía* — sección `proceso`

> Una cubeta de silicona sola al lado de un sistema completo de cuatro componentes alineados sobre lona, vista cenital, sin etiquetas. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 100 · `/blog/silicona-100-vs-tpo-pvc`
*Silicona 100% vs. membrana TPO o PVC* — sección `proceso`

> Residencial con techo blanco de silicona y, al fondo, techo comercial con membrana termoplástica, contraste de escala, vista aérea. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 101 · `/blog/soprema-vs-polyglass`
*Soprema vs. Polyglass: sistemas y líneas líquidas* — sección `proceso`

> Almacén de materiales con rollos de membrana apilados en palets, uno con acabado mineral y otro liso, luz de nave industrial. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 102 · `/blog/top-coat-marin-vs-top-coat-cintron`
*Top Coat Marín vs. acabado Cintrón* — sección `garantia-leyes`

> Macro de dos acabados finales, uno blanco satinado y otro marfil mate, lado a lado sobre la losa, brillo comparado bajo el sol. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 103 · `/blog/tpo-pvc-vs-sistema-multicapa`
*TPO vs. sistema multicapa líquido* — sección `garantia-leyes`

> Techo comercial con área nueva de membrana termoplástica blanca y área rehabilitada en líquido con malla, vista aérea entre unidades de aire. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 104 · `/blog/windmar-vs-lanco`
*WindMar vs. Lanco: silicona instalada o acrílico DIY* — sección `proceso`

> Techo blanco recién instalado por una cuadrilla con vehículo sin rotulación, y a un lado escalera con rodillo y galón de ferretería, contraste. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

---

### C. Preguntas frecuentes (6)

*Un clúster temático por página.*

#### 105 · `/blog/preguntas-frecuentes-sellado-de-techos-clima-y-huracanes`
*Clima y temporada de huracanes en Puerto Rico* — sección `clima`

> Nubes de tormenta tropical avanzando sobre un techo plano blanco en la costa de Puerto Rico, palmas inclinadas por el viento, contraste dramático y limpio. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 106 · `/blog/preguntas-frecuentes-sellado-de-techos-garantia-y-leyes`
*Garantía, licencias y leyes en Puerto Rico* — sección `garantia-leyes`

> Sobre una losa recién sellada, una carpeta azul cerrada y un nivel de burbuja, un técnico con chaleco revisando la superficie de rodillas. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 107 · `/blog/preguntas-frecuentes-sellado-de-techos-materiales`
*Materiales y sistemas en Puerto Rico* — sección `materiales`

> Cerca cenital de tres componentes genéricos sin etiqueta sobre concreto húmedo: una cubeta blanca, un galón ámbar y un rollo de membrana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 108 · `/blog/preguntas-frecuentes-sellado-de-techos-precio`
*Precio y presupuesto en Puerto Rico* — sección `precio`

> Técnico con cinta métrica extendida sobre una losa, área rectangular marcada con tiza, vista desde arriba, sombras largas de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 109 · `/blog/preguntas-frecuentes-sellado-de-techos-proceso`
*Proceso y aplicación en Puerto Rico* — sección `proceso`

> Aplicación de recubrimiento blanco con rodillo de mango largo, movimiento capturado, franja recién aplicada brillante contra el concreto gris, vista lateral baja. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 110 · `/blog/preguntas-frecuentes-sellado-de-techos-tipos-de-techo`
*Tipos de techo en Puerto Rico* — sección `sustratos`

> Tres tipos de techo en un solo plano natural: teja roja en primer término, zinc acanalado detrás y losa plana blanca al fondo, todos bajo el mismo cielo tropical. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

---

### D. Comunidades y servicios (8)

*Páginas puente de marca y servicio.*

#### 111 · `/blog/comunidades-ilatekpr-como-funciona`
*Sellado de techos en tu comunidad en Puerto Rico* — sección `puente`

> Vista aérea de un residencial puertorriqueño con techos blancos, calles y áreas verdes, sensación de comunidad atendida y ordenada. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 112 · `/blog/guia-de-servicios-de-techos-de-ilatek`
*Guía de servicios de techos de Ilatek* — sección `puente`

> Cuadrilla de tres técnicos uniformados de pie frente a una casa, equipo ordenado y camión sin rotulación, retrato de equipo con luz de mañana. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 113 · `/blog/ilatek-y-el-recubrimiento-elastomerico`
*Ilatek y el recubrimiento elastomérico* — sección `puente`

> Aplicación de recubrimiento elastomérico blanco con rodillo sobre losa de concreto sana, franja brillante recién extendida, luz lateral. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 114 · `/blog/ilatek-y-el-sellado-acrilico`
*Ilatek y el sellado acrílico* — sección `puente`

> Técnico aplicando acrílico blanco en una losa limpia y sana, balde genérico y rodillo, detalle de la textura fina del acabado. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 115 · `/blog/ilatek-y-el-sellado-de-poliuretano`
*Ilatek y el sellado de poliuretano* — sección `puente`

> Terraza transitable con poliuretano gris texturizado, sillas de exterior y plantas, aplicación reciente, luz de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 116 · `/blog/ilatek-y-el-sellado-de-silicona`
*Ilatek y el sellado de silicona 100%* — sección `puente`

> Losa con silicona blanca recién aplicada y un charco de agua que se desliza sin penetrar, vista rasante. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 117 · `/blog/ilatek-y-la-membrana-asfaltica`
*Ilatek y la membrana asfáltica* — sección `puente`

> Instalación de membrana asfáltica en rollo sobre losa, soplete apagado al lado, traslape alineado con precisión, técnica y orden. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

#### 118 · `/blog/sellado-de-techos-con-ilatek-property-solution`
*Sellado de techos con Ilatek Property Solution* — sección `puente`

> Técnico con camisa azul corporativa lisa inspeccionando un techo blanco, tableta en mano, casa y palmas al fondo, luz de tarde. Fotografía editorial hiperrealista, luz natural de día en Puerto Rico, paleta de azul corporativo #173F69, blanco #F7F8F7, gris #8B949B y verde natural #6E987B, encuadre vertical 4:5, profundidad de campo suave, composición minimalista con espacio negativo limpio arriba a la izquierda para el logo, sin texto, sin letras, sin números, sin logotipos, sin marcas de agua.

---

## 6. Ajustes por herramienta

- **Gemini / Nano Banana** (el flujo que ya existe en `imagegen/`): pega el prompt completo; el negativo va al final 
  del mismo mensaje, como *Evita: …*. Si devuelve texto o logos, regenera con la misma instrucción y sube la 
  penalización de texto si la herramienta lo permite.
- **Midjourney**: añade `--ar 4:5 --style raw --s 150 --no text, letters, numbers, logos, watermark`.
- **GPT-image / DALL·E**: agrega la frase *The image must contain no text of any kind.*
- **Flux / Ideogram**: usa el Anexo B en el campo negativo; Ideogram tiende a escribir, así que revisa cada pieza.

## 7. Control de calidad antes de publicar

1. ¿Se entiende el tema de la página sin leer una sola palabra?
2. ¿Hay aunque sea una letra o un número? → descartar.
3. ¿Se ve un logo o una marca de terceros? → descartar.
4. ¿Queda espacio limpio arriba a la izquierda para el logo oficial?
5. ¿Parece una foto real de un techo en Puerto Rico y no una imagen genérica de catálogo?
6. ¿Alguna afirmación de la imagen (resultado, garantía, precio) que no esté verificada? → corregir la escena, no el texto.

*Las 118 escenas son ilustrativas: no representan trabajos ejecutados por ILA-TEK ni clientes reales.*
