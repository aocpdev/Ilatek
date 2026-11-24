/**
 * gsc-sitemaps.gs — envío de sitemaps a Search Console SIN cuenta de servicio
 * ---------------------------------------------------------------------------
 * Corre dentro de Google Apps Script con TU cuenta de Google: no hay que crear
 * una cuenta de servicio ni descargar claves. El token lo emite el propio
 * Apps Script para el usuario que ejecuta el script, que debe tener permiso en
 * Search Console sobre las propiedades.
 *
 * Montaje (5 minutos, una sola vez):
 *   1. script.google.com → Nuevo proyecto.
 *   2. Menú ⋮ → Configuración del proyecto → marcar "Mostrar el archivo de
 *      manifiesto appsscript.json".
 *   3. Substituir appsscript.json por el bloque APPSScript_MANIFEST de abajo.
 *   4. Pegar este archivo en Código.gs y pulsar Ejecutar → `listarPropiedades`.
 *      Google pedirá autorización de los dos scopes; aceptar.
 *   5. Ejecutar `enviarSitemaps`. El registro sale en Ejecuciones → Registros.
 *
 * Si un envío responde 403 con "API has not been used / is disabled":
 *   el proyecto implícito de Apps Script no tiene habilitada la Search Console
 *   API. Es el único paso que toca Google Cloud, y es gratuito: vincular un
 *   proyecto (Configuración del proyecto → Proyecto de Google Cloud → Cambiar),
 *   habilitar "Google Search Console API" y volver a ejecutar. No hace falta
 *   crear claves ni cuentas de servicio.
 */

var HOSTS = ['ilatekpr.com', 'comunidades.ilatekpr.com'];

// Descomenta para incluir los 78 subdominios municipales (solo si sus
// canonical dejan de apuntar al dominio principal).
// var SLUGS = ['adjuntas','aguada','aguadilla' /* ... */];
// HOSTS = HOSTS.concat(SLUGS.map(function (s) { return s + '.ilatekpr.com'; }));

var PROPIEDAD_DOMINIO = 'sc-domain:ilatekpr.com';
var API = 'https://www.googleapis.com/webmasters/v3';

function token_() {
  return ScriptApp.getOAuthToken();
}

function api_(metodo, ruta) {
  var respuesta = UrlFetchApp.fetch(API + ruta, {
    method: metodo,
    headers: { Authorization: 'Bearer ' + token_() },
    muteHttpExceptions: true,
  });
  var texto = respuesta.getContentText();
  var datos = null;
  try { datos = texto ? JSON.parse(texto) : null; } catch (e) { datos = null; }
  return { http: respuesta.getResponseCode(), datos: datos, texto: texto };
}

/** Paso 1: qué propiedades ve tu cuenta y con qué permiso. */
function listarPropiedades() {
  var r = api_('GET', '/sites');
  if (r.http !== 200) { Logger.log('HTTP ' + r.http + ': ' + r.texto); return; }
  var entradas = (r.datos && r.datos.siteEntry) || [];
  Logger.log('Propiedades visibles: ' + entradas.length);
  entradas.forEach(function (e) {
    Logger.log('· ' + e.siteUrl + '  →  ' + e.permissionLevel);
  });
}

/** Paso 2: enviar el sitemap de cada host y verificar el resultado. */
function enviarSitemaps() {
  var resumen = [];
  HOSTS.forEach(function (host) {
    var sitemap = 'https://' + host + '/sitemap.xml';

    // Nunca enviamos un sitemap vacío: es ruido para Google.
    var vivo = UrlFetchApp.fetch(sitemap, { muteHttpExceptions: true });
    var locs = (vivo.getContentText().match(/<loc>/g) || []).length;
    if (vivo.getResponseCode() !== 200 || locs === 0) {
      Logger.log('⏳ ' + host + ': sitemap HTTP ' + vivo.getResponseCode() + ' con ' + locs + ' URLs → NO se envía');
      resumen.push([host, 0, 'omitido: sitemap vacío o inaccesible']);
      return;
    }

    // Propiedad de dominio primero; si no hay permiso, se intenta el prefijo de URL.
    var propiedades = [PROPIEDAD_DOMINIO, 'https://' + host + '/'];
    var hecho = false;
    for (var i = 0; i < propiedades.length && !hecho; i++) {
      var prop = propiedades[i];
      var ruta = '/sites/' + encodeURIComponent(prop) + '/sitemaps/' + encodeURIComponent(sitemap);
      var put = api_('PUT', ruta);
      if (put.http === 200 || put.http === 204) {
        var ver = api_('GET', 'https://www.googleapis.com/webmasters/v3' === API ? ruta : ruta);
        var e = (ver.datos || {});
        Logger.log('✓ ' + host + ' → ' + prop + ' · verificación ' + ver.http +
          ' · ' + (e.isPending ? 'pendiente' : 'procesado') +
          ' · avisos ' + ((e.warnings || []).length + (e.errors || []).length) +
          ' · ' + locs + ' URLs');
        resumen.push([host, locs, 'ok ' + prop]);
        hecho = true;
      } else {
        Logger.log('✖ ' + host + ' → ' + prop + ': HTTP ' + put.http + ' ' + put.texto.slice(0, 200));
        resumen.push([host, locs, 'error ' + prop + ' HTTP ' + put.http]);
      }
    }
  });
  Logger.log(JSON.stringify(resumen));
}

/**
 * appsscript.json — pegar en el manifiesto:
 *
 * {
 *   "timeZone": "America/Puerto_Rico",
 *   "dependencies": {},
 *   "exceptionLogging": "STACKDRIVER",
 *   "runtimeVersion": "V8",
 *   "oauthScopes": [
 *     "https://www.googleapis.com/auth/webmasters",
 *     "https://www.googleapis.com/auth/script.external_request"
 *   ]
 * }
 */
