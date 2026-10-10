// Ilatek · Techos · modelo del árbol del sitio.
// Único dueño de la jerarquía hub → madre → hija: los breadcrumbs se DERIVAN
// del orden de los clusters (la madre es el primer elemento de cada archivo),
// así no hay una lista de jerarquía duplicada que pueda desincronizarse.
import { hub } from './data/hub.mjs';
import { reparacion } from './data/reparacion.mjs';
import { sellado } from './data/sellado.mjs';
import { impermeabilizacion } from './data/impermeabilizacion.mjs';
import { segmentos } from './data/segmentos.mjs';
import { mantenimiento } from './data/mantenimiento.mjs';
import { localizeText } from '../../tools/location-contract.mjs';

export const CLUSTERS = [reparacion, sellado, impermeabilizacion, segmentos, mantenimiento];

export function buildTree() {
  const home = [{ name: 'Inicio', slug: '' }];
  const techos = { name: 'Techos', slug: 'home' };
  const breadcrumbs = { [hub.slug]: [...home, techos] };

  CLUSTERS.forEach((cluster) => {
    const [mother, ...children] = cluster;
    breadcrumbs[mother.slug] = [...home, techos, { name: mother.eyebrow, slug: mother.slug }];
    children.forEach((child) => {
      breadcrumbs[child.slug] = [...breadcrumbs[mother.slug], { name: child.eyebrow, slug: child.slug }];
    });
  });

  // Directorio de servicios por categoría (solo el hub): mismo dueño de la
  // jerarquía que los breadcrumbs, así nunca se duplica la lista de categorías.
  const directory = CLUSTERS.map(([mother, ...children]) => ({
    slug: mother.slug,
    name: mother.eyebrow,
    children: children.map((child) => ({ slug: child.slug, name: child.eyebrow })),
  }));

  return [hub, ...CLUSTERS.flat()].map((page) => ({
    ...page,
    metaTitle: localizeText(page.metaTitle),
    metaDescription: localizeText(page.metaDescription),
    breadcrumb: breadcrumbs[page.slug],
    ...(page.slug === hub.slug ? { directory } : {}),
  }));
}
