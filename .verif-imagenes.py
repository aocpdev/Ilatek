"""Verificacion final del lote y bitacora cuadrada con el disco."""
import hashlib
import json
import pathlib
import sys
import time

sys.path.insert(0, 'Comunidades/scripts/imagenes')
from PIL import Image  # noqa: E402

import flow_plan  # noqa: E402

img = pathlib.Path('Comunidades/scripts/imagenes')
S = pathlib.Path('comunidades imagenes')

pngs = sorted(S.glob('*.png'))
malos = 0
for p in pngs:
    try:
        with Image.open(p) as im:
            im.load()
    except Exception:                                     # noqa: BLE001
        malos += 1

vistos, dups = set(), 0
for p in pngs:
    h = hashlib.md5(p.read_bytes()).hexdigest()
    if h in vistos:
        dups += 1
    vistos.add(h)

pr = json.loads((img / 'prompts.json').read_text(encoding='utf-8'))
cola = flow_plan.construir_cola(pr, pr, S)
idx = json.loads(pathlib.Path('Comunidades/data/ghl/index.json').read_text(encoding='utf-8'))
pubs = sum(1 for f in idx['funnels'] if f.get('status') == 'publicado')

ahora = time.time()
ult10 = sum(1 for p in pngs if ahora - p.stat().st_mtime < 600)
print('PNG', len(pngs), '| faltan', 1112 - len(pngs), '| no abren', malos,
      '| duplicados', dups, '| pendientes', len(cola), '| ledger', pubs, '/', pubs * 2)
print('PNG en los ultimos 10 min:', ult10, '| ritmo', round(ult10 / 10, 2), 'PNG/min')

p = pathlib.Path('Comunidades/progress.md')
t = p.read_text(encoding='utf-8')
marca = '## Tres carriles y el vigia que ya no se mata solo (07:45)'
if marca not in t:
    p.write_text(t.rstrip() + '\n' + f"""
{marca}

- **El vigia podaba a sus propios workers**: al terminar su ronda el lote sale
  (`--rondas 1`), no habia lote vivo y la regla de "Flow huerfano" mataba los
  `flow-ui` de los carriles 1 y 2. Ahora solo poda el ayudante `flow_navegador`
  del lote; los `flow-ui` de los carriles mueren por su cuenta. Ese era el
  hueco de ritmo entre tandas.
- **Tercer carril**: `carriles.json` en 3, sumando `o.melendez1991@gmail.com`
  (pestana 2, `/u/1`) a fullnessmindset (pestana 0) y
  osvaldodmelendez/fullnessfrequency (pestana 4). Cada carril con su pestana,
  su candado (47666/47668/47670) y su registro `cuenta-activa-wN.json`.
- **Vigilancia probada matando procesos**: se mato el reanudador (27660) y el
  vigia lo levanto solo (9188); tambien relanza los `flow-ui` de los carriles,
  el lote, el colero y el alta-funnel-ghl, podando duplicados por PID.
- Estado real: {len(pngs)} PNG validos, {malos} que no abren, {dups} pares
  repetidos, {len(cola)} pendientes de 1112, ledger {pubs} comunidades /
  {pubs * 2} paginas. Ritmo ultimos 10 min: {ult10} PNG.
""", encoding='utf-8')
    print('progress.md actualizado')
else:
    print('progress.md ya tenia la seccion')
