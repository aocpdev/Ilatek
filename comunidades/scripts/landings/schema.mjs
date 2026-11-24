// JSON-LD de cada landing: Service (area del lugar), FAQPage (AEO) y
// BreadcrumbList Ilatek > servicio de la comunidad. La URL canonica vive en el
// subdominio propio; el inicio del breadcrumb apunta al sitio principal.
import { MAIN_SITE } from './config.mjs';

export function schemaFor(r, c) {
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: c.h1,
    serviceType: c.T ? 'Sellado de techos residencial' : 'Servicio de limpieza residencial',
    provider: { '@type': 'LocalBusiness', name: 'Ilatek', url: `${MAIN_SITE}/` },
    areaServed: { '@type': 'Place', name: c.place, address: { '@type': 'PostalAddress', addressLocality: c.muni, addressRegion: 'PR', addressCountry: 'US' } },
    url: c.canonical,
  };
  const faq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: c.faqs.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };

  const trail = [
    { '@type': 'ListItem', position: 1, name: 'Ilatek', item: `${MAIN_SITE}/` },
    { '@type': 'ListItem', position: 2, name: c.T ? 'Sellado de techo' : 'Limpieza', item: c.canonical },
  ];
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: trail };

  return [service, faq, breadcrumb];
}
