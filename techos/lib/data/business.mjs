// Ilatek · Techos · hechos del negocio que NO deben inventarse.
// Estos valores alimentan los nodos de schema opcionales PostalAddress +
// GeoCoordinates + AggregateRating. Están VACÍOS a propósito: mientras no se
// rellenen con datos reales, el generador OMITE esos nodos en vez de publicar
// un placeholder (nunca se fabrican direcciones, coordenadas ni calificaciones).
// Para activarlos: rellena los campos y corre techos/build-techos.mjs.
export const BUSINESS = {
  street: '',
  locality: 'Puerto Rico',
  region: 'PR',
  postalCode: '',
  country: 'PR',
  latitude: '',
  longitude: '',
  ratingValue: '',
  reviewCount: '',
};

export function hasGeo(b = BUSINESS) {
  return Boolean(b.street && b.latitude && b.longitude);
}

export function hasRating(b = BUSINESS) {
  return Boolean(b.ratingValue && b.reviewCount);
}
