// Ilatek · Techos · constructores de JSON-LD para descubrimiento por IA (AEO/GEO).
// Grafo por página: RoofingContractor (+ makesOffer + hasOfferCatalog) · WebSite ·
// WebPage (datePublished/dateModified + speakable) · Service (con ImageObject[]) ·
// BreadcrumbList. Segundo bloque: FAQPage espejo 1:1 de las preguntas visibles.
// Los nodos GEO/AEO opcionales (PostalAddress + GeoCoordinates + AggregateRating)
// se emiten SOLO cuando lib/data/business.mjs trae valores reales: nunca se inventan.
// Todas las URLs/ids usan {{custom_values.website_url}} — cero hardcode.
import { BUSINESS, hasGeo, hasRating } from './data/business.mjs';
import { UPDATED } from './data/build.mjs';

const URL_TOKEN = '{{custom_values.website_url}}';

function j(obj) {
  return JSON.stringify(obj, null, 1);
}

function areaServed() {
  return [
    { '@type': 'AdministrativeArea', name: '{{custom_values.county_name_and_state}}' },
    { '@type': 'Country', name: 'Puerto Rico' },
  ];
}

// Imágenes de la página como entidades ImageObject (mejor que una URL suelta:
// alimenta Image Search y los resúmenes de IA con contexto y dimensiones).
function imageObjects(page) {
  return [
    {
      '@type': 'ImageObject',
      url: page.hero.webp,
      contentUrl: page.hero.raw,
      width: 1200,
      height: 1320,
      caption: page.hero.title,
    },
    {
      '@type': 'ImageObject',
      url: page.incl.webp,
      contentUrl: page.incl.raw,
      width: 1200,
      height: 900,
      caption: page.incl.title,
    },
  ];
}

// Qué partes de la página puede leer en voz alta un asistente (AEO).
function speakable() {
  return {
    '@type': 'SpeakableSpecification',
    cssSelector: ['h1', '.ilt-faq summary h3'],
  };
}

function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.locality,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postalCode,
    addressCountry: BUSINESS.country,
  };
}

function geoCoordinates() {
  return {
    '@type': 'GeoCoordinates',
    latitude: BUSINESS.latitude,
    longitude: BUSINESS.longitude,
  };
}

function aggregateRating() {
  return {
    '@type': 'AggregateRating',
    ratingValue: BUSINESS.ratingValue,
    reviewCount: BUSINESS.reviewCount,
    bestRating: '5',
    worstRating: '1',
  };
}

export function bizSchema(page) {
  const base = page.slug === 'techos' ? URL_TOKEN + '/home' : URL_TOKEN + '/' + page.slug;
  const bizId = base + '/#service';
  const svcId = base + '/#service-offer';
  const webId = URL_TOKEN + '/#website';
  const pageId = base + '/#webpage';

  const offer = {
    '@type': 'Offer',
    '@id': base + '/#offer',
    name: page.serviceName,
    description: page.price.text,
    price: page.price.amount,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: URL_TOKEN + '/cotizacion',
    itemOffered: { '@id': svcId },
    priceSpecification: {
      '@type': 'PriceSpecification',
      price: page.price.amount,
      priceCurrency: 'USD',
      valueAddedTaxIncluded: false,
    },
  };

  const service = {
    '@type': 'Service',
    '@id': svcId,
    name: page.serviceName,
    description: page.serviceDesc,
    serviceType: page.serviceName,
    url: base,
    image: imageObjects(page),
    provider: { '@id': bizId },
    areaServed: areaServed(),
    mainEntityOfPage: { '@id': pageId },
    isPartOf: { '@id': webId },
    offers: offer,
  };

  const crumbs = page.breadcrumb || [];
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': base + '/#breadcrumb',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.slug ? URL_TOKEN + '/' + c.slug : URL_TOKEN,
    })),
  };

  const hubItems = page.slug === 'techos'
    ? [{ name: 'Techos', slug: 'home' }].concat(
        (page.directory || []).flatMap((cat) => [
          { name: cat.name, slug: cat.slug },
          ...(cat.children || []).map((ch) => ({ name: ch.name, slug: ch.slug })),
        ]),
      )
    : [];
  const itemList = hubItems.length
    ? {
        '@type': 'ItemList',
        '@id': URL_TOKEN + '/home/#servicios',
        name: (page.extra && page.extra.title) || 'Servicios de techos de Ilatek',
        numberOfItems: hubItems.length,
        itemListElement: hubItems.map((it, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: it.name,
          url: URL_TOKEN + '/' + it.slug,
        })),
      }
    : null;

  const webPage = {
    '@type': 'WebPage',
    '@id': pageId,
    url: base,
    name: page.metaTitle,
    description: page.metaDescription,
    inLanguage: 'es',
    isPartOf: { '@id': webId },
    about: { '@id': svcId },
    mainEntity: { '@id': svcId },
    breadcrumb: { '@id': base + '/#breadcrumb' },
    datePublished: UPDATED,
    dateModified: UPDATED,
    speakable: speakable(),
  };

  const nodes = [
    {
      '@type': 'RoofingContractor',
      '@id': bizId,
      name: page.metaTitle,
      description: page.metaDescription,
      url: base,
      telephone: '{{custom_values.business__phone}}',
      email: '{{custom_values.business__email}}',
      image: imageObjects(page),
      logo: 'https://assets.cdn.filesafe.space/8OxUENFVM60EKzqsTcoD/media/6aa1c05dd953a0128b5348c2.jpg',
      priceRange: '$$',
      currenciesAccepted: 'USD',
      paymentAccepted: 'Cash, Credit Card, Debit Card',
      areaServed: areaServed(),
      availableLanguage: ['es'],
      sameAs: ['{{custom_values.facebook_url}}', '{{custom_values.instagram_url}}'],
      makesOffer: [offer],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de techos de Ilatek',
        itemListElement: [{ '@type': 'Offer', itemOffered: { '@id': svcId } }],
      },
      ...(hasGeo() ? { address: postalAddress(), geo: geoCoordinates() } : {}),
      ...(hasRating() ? { aggregateRating: aggregateRating() } : {}),
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00',
        },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': webId,
      url: URL_TOKEN,
      name: 'Ilatek Techos',
      inLanguage: 'es',
      publisher: { '@id': bizId },
    },
    webPage,
    service,
    breadcrumb,
    ...(itemList ? [itemList] : []),
  ];

  // Marca explícita cuando los nodos GEO/AEO opcionales están apagados.
  const todo = !hasGeo() || !hasRating()
    ? '<!-- Schema GEO/AEO opcional APAGADO: rellena lib/data/business.mjs y corre build-techos.mjs para activar PostalAddress + GeoCoordinates + AggregateRating. No se publican valores inventados. -->'
    : '';

  const script = '<script type="application/ld+json">\n' + j({
    '@context': 'https://schema.org',
    '@graph': nodes,
  }) + '\n</script>';

  return todo ? todo + '\n' + script : script;
}

export function faqSchema(page) {
  return '<script type="application/ld+json">\n' + j({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': URL_TOKEN + '/' + (page.slug === 'techos' ? 'home' : page.slug) + '/#faq',
    mainEntity: page.faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
    })),
  }) + '\n</script>';
}
