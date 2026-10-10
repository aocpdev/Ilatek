// Refresh page-local delivery packs without changing production HTML or CDN URLs.
// --download fetches only media URLs already present in existing ILATEK embeds.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/estructura.json'), 'utf8'));
const download = process.argv.includes('--download');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const read = p => fs.readFileSync(path.join(ROOT,p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT,p)), {recursive:true}); fs.writeFileSync(path.join(ROOT,p), s); };
const json = (p, x) => write(p, JSON.stringify(x,null,2)+'\n');
const link = (from, to) => path.relative(from,to).split(path.sep).join('/');
const allMedia = new Map();
const missing = [];
const mediaRe = /https?:\/\/[^\s"'<>`)]+?\.(?:png|jpe?g|webp|gif|svg|mp4)(?:\?[^\s"'<>`)]*)?(?=[\s"'<>`)]|$)/gi;
function metadata(html) {
  const metas = {};
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...m[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map(a=>[a[1].toLowerCase(),decode(a[3])]));
    if (attrs.name || attrs.property) metas[attrs.name || attrs.property] = attrs.content;
  }
  return { title: decode(html.match(/<title>(.*?)<\/title>/s)?.[1] || ''),
    description: metas.description || '', image: metas['og:image'] || '',
    canonical: html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/)?.[1] || '', metas };
}
function binaryOK(file) {
  if (!fs.existsSync(file) || !fs.statSync(file).size) return false;
  const head = fs.readFileSync(file).subarray(0,64);
  if (/^\s*(?:<!doctype html|<html|\{\s*"error)/i.test(head.toString())) return false;
  return true;
}
for (const p of manifest.pages) {
  const html = read(p.file);
  const base = `${p.folder}/es`;
  const blockRe = /<!-- ▼▼ \/([^\n]+?) ▼▼ -->(.*?)<!-- ▲▲ fin \/\1 ▲▲ -->/gs;
  const ownBlocks = [...html.matchAll(blockRe)];
  const seoSource = ownBlocks.length ? p.file : p.group === 'techos' ? 'techos/ghl-techos-head-seo.html' : 'documentacion/seo/limpieza-head-original.html';
  const blocks = ownBlocks.length ? ownBlocks : [...read(seoSource).matchAll(blockRe)].filter(m=>m[1] === p.slug);
  if (blocks.length !== 1) throw new Error(`Expected one SEO block for ${p.file}; found ${blocks.length}`);
  const seoHtml = blocks[0][2];
  const meta = metadata(seoHtml);
  if (!meta.title || !meta.description || !meta.image || !meta.canonical) throw new Error(`Incomplete existing SEO: ${p.file}`);
  const urls = [...new Set((html+'\n'+seoHtml).match(mediaRe) || [])].map(decode);
  if (!urls.includes(meta.image)) throw new Error(`Social media not inventoried: ${p.file}`);
  const assets = [];
  for (const url of urls) {
    const parsed = new URL(url);
    const isSocial = url === meta.image;
    const local = `${base}/assets/${isSocial ? 'meta-image'+path.extname(parsed.pathname) : 'media/'+path.basename(parsed.pathname)}`;
    const target = path.join(ROOT,local);
    fs.mkdirSync(path.dirname(target), {recursive:true});
    let source = allMedia.get(url);
    const repoMatch = parsed.pathname.match(/^\/gh\/aocpdev\/Ilatek@[^/]+\/(assets\/.*)$/);
    if (parsed.hostname === 'cdn.jsdelivr.net' && repoMatch) source = path.join(ROOT,decodeURIComponent(repoMatch[1]));
    if (!binaryOK(target)) {
      if (source && binaryOK(source)) fs.copyFileSync(source, target);
      else if (download && ['assets.cdn.filesafe.space','cdn.jsdelivr.net','storage.googleapis.com'].includes(parsed.hostname)) {
        const temp = target + '.download';
        const r = spawnSync('curl', ['--fail','--location','--silent','--show-error','--retry','2','--max-time','45','--max-filesize','40000000','--output',temp,url], {encoding:'utf8'});
        if (r.status === 0 && binaryOK(temp)) {
          fs.renameSync(temp, target);
          console.log(`Downloaded ${path.basename(target)}`);
        } else {
          if (fs.existsSync(temp)) fs.unlinkSync(temp);
          console.error(`Media unavailable: ${url}: ${(r.stderr || '').trim()}`);
        }
      }
    }
    const exists = binaryOK(target);
    if (exists) allMedia.set(url,target);
    let backup = null;
    let backupPublicUrl = null;
    if (!exists && parsed.hostname === 'assets.cdn.filesafe.space') {
      const variant = 'assets/optimized/techos/'+path.basename(parsed.pathname).replace(/\.[^.]+$/,'.webp');
      if (binaryOK(path.join(ROOT, variant))) {
        backup = `${base}/assets/respaldo/${path.basename(variant)}`;
        fs.mkdirSync(path.dirname(path.join(ROOT,backup)), {recursive:true});
        fs.copyFileSync(path.join(ROOT,variant),path.join(ROOT,backup));
        backupPublicUrl = 'https://cdn.jsdelivr.net/gh/aocpdev/Ilatek@main/'+variant;
      }
    }
    if (!exists) missing.push({page:p.slug,url,backupFile:backup,backupPublicUrl});
    const resolvedFile = exists ? local : backup;
    const bytes = resolvedFile ? fs.readFileSync(path.join(ROOT,resolvedFile)) : null;
    assets.push({role:isSocial ? 'social-image' : /\.mp4$/i.test(parsed.pathname) ? 'video' : 'media-or-fallback',
      publicUrl:url, file:resolvedFile ? link(base,resolvedFile) : null,
      status:exists ? 'local-copy' : backup ? 'local-optimized-backup' : 'download-pending',
      ...(backup ? {backupPublicUrl, note:'Original CDN no disponible; se conserva la variante WebP del mismo ID existente en el repositorio. No se modificó el embed.'} : {}),
      bytes:bytes?.length || null, sha256:bytes ? sha(bytes) : null});
  }
  const social = assets.find(a=>a.role === 'social-image');
  const english = p.english === 'selector-integrado' ? 'El HTML existente contiene traducciones propias mediante su selector ES/EN.' : 'No existe una landing inglesa independiente. El menú compartido puede ofrecer su traducción automática existente.';
  const legacy = p.status === 'legacy-canonical-home' ? '\n> Esta página de techos es un legado: su canonical existente apunta a /home. No sustituye el Home multiservicios ni debe publicarse como un segundo Home.\n' : '';
  json(`${base}/seo.json`, {source:seoSource, language:'es', status:'extraido-del-html-existente',
    metaTagTitle:meta.title, metaTagDescription:meta.description, metaTagImage:meta.image,
    canonical:meta.canonical, socialImageFile:social.file, publication:'No modificada en GHL; verificar el HEAD publicado.'});
  json(`${base}/ASSETS.json`, {page:p.slug,source:p.file,
    policy:'Copias locales de medios referenciados en HTML, CSS y JS, incluidos fallbacks. URLs de producción conservadas. No incluye contenido remoto interno de widgets, fuentes o calendarios.',
    externalDependencies:[...new Set([...html.matchAll(/<(?:script|iframe|link)\b[^>]*?(?:src|href)=["'](https?:\/\/[^"']+)["']/g)].map(m=>decode(m[1])))],
    socialImage:social, assets});
  write(`${base}/SEO-GHL.md`, `# SEO — ${meta.title}\n\nValores extraídos del embed existente, sin cambiar la estrategia ni el contenido SEO.\n${legacy}\n## Meta Tag Title\n\n\`\`\`text\n${meta.title}\n\`\`\`\n\n## Meta Tag Description\n\n\`\`\`text\n${meta.description}\n\`\`\`\n\n## Meta Tag Image\n\n[Imagen social — URL pública](${meta.image})\n\n\`\`\`text\n${meta.image}\n\`\`\`\n\nCopia local: [${social.file}](${social.file}). No usar una ruta local en GHL.\n\n## Canonical existente\n\n${meta.canonical}\n\n## Instalación y comprobación\n\n1. En SEO Meta Data de GHL, usar Title, Description y Social Image de esta ficha.\n2. El embed conserva sus metadatos originales. Si se utiliza [HEAD-TEMPLATE.html](HEAD-TEMPLATE.html), revisar que el HEAD servido no termine con títulos, descriptions o canonicals duplicados. No pegar el conjunto de metadatos de otras páginas.\n3. Las URLs de medios se mantienen: mover carpetas locales no publica ni modifica archivos en GHL.\n4. Validar el HTML público final, la imagen social y los Custom Values resueltos. No depender del selector de idioma para metadatos de una ruta EN independiente.\n5. ${english} No se creó ni se anunció una URL /en/ ni hreflang hacia páginas inexistentes.\n\nInventario: [ASSETS.json](ASSETS.json). Datos reutilizables: [seo.json](seo.json).\n`);
  write(`${base}/HEAD-TEMPLATE.html`, '<!-- Referencia del HEAD existente. Usar solo una configuración SEO por página en GHL. -->\n'+seoHtml.trim()+'\n');
  let seoDoc = read(`${base}/SEO-GHL.md`);
  seoDoc += '\n## Dominio y enlaces internos\n\nConfigurar `website_url` como dominio sin protocolo ni barra final, por ejemplo `ilatekpr.com`. Los enlaces y canonical usan `https://{{custom_values.website_url}}/ruta`. Validar que GHL entregue estos valores resueltos en el HEAD público; no confiar en JavaScript para los metadatos sociales.\n';
  seoDoc = seoDoc.replace('Valores extraídos del embed existente', 'Valores extraídos del HTML y del bloque HEAD existentes');
  seoDoc = seoDoc.replace('El embed conserva sus metadatos originales.', ownBlocks.length ? 'El embed conserva sus metadatos originales.' : 'Este embed no incluye el bloque HEAD: los metadatos originales están separados en HEAD-TEMPLATE.html.');
  if (social.backupPublicUrl) seoDoc += `\n## Aviso sobre la imagen social original\n\nLa URL original del CDN no está disponible. La copia local es la variante WebP del mismo ID, no el JPG original.\n\nAlternativa existente en el repositorio: [imagen WebP](${social.backupPublicUrl}). Antes de instalar el SEO, comprobar esta URL pública y usarla como Social Image si continúa disponible. El embed y el HEAD de referencia no se modificaron automáticamente.\n`;
  write(`${base}/SEO-GHL.md`,seoDoc);
  const relatives = manifest.pages.filter(c=>c.category === p.slug && c.slug !== p.slug);
  const children = relatives.length ? '\n## Páginas relacionadas\n\n'+relatives.map(c=>`- [${c.slug}](${link(p.folder,c.folder)}/README.md)`).join('\n')+'\n' : '';
  write(`${p.folder}/README.md`, `# ${p.slug === 'home' ? 'Home Page — ILATEK' : meta.title}\n\n${p.slug === 'home' ? 'Home principal confirmado: **ghl-home-multiservicios.html**. Incluye su menú; el footer se mantiene como componente separado.' : 'Página existente organizada sin cambios de diseño, texto ni URLs de producción.'}\n${legacy}\n- [Embed para copiar en GHL](es/landing-pages/${path.basename(p.file)})\n- [Meta Title, Meta Description y Meta Image](es/SEO-GHL.md)\n- [Inventario de assets](es/ASSETS.json)\n- [Estado de inglés](en/README.md)\n\nLos archivos de assets están en \`es/assets/\`. Son respaldos locales de las referencias del embed; este conserva las URLs públicas para seguir siendo copiable a GHL.\n\n${english} Se mantiene una sola fuente de HTML para evitar divergencias.\n${children}`);
  write(`${p.folder}/en/README.md`, `# English — ${p.slug}\n\n**Status: no standalone English landing page exists in the source project.**\n\n${english}\n\nUse the [existing embed](../es/landing-pages/${path.basename(p.file)}) and its current language controls where present. Shared page media are inventoried in [ASSETS.json](../es/ASSETS.json) and stored in [es/assets](../es/assets/).\n\nThis folder intentionally contains no duplicate Spanish HTML presented as English, no invented /en/ public URL, and no English metadata presented as published. A separate EN landing requires a translation and URL decision; once approved, use the same landing-pages/assets/SEO-GHL.md structure as ES.\n`);
}
write('documentacion/MAPA-DE-PAGINAS.md', '# Mapa de páginas — ILATEK\n\nLa ruta de disco no cambia la URL publicada. ES es la fuente existente; EN se documenta según su estado real.\n\n| Página | Grupo | Carpeta | SEO | Estado EN |\n|---|---|---|---|---|\n'+manifest.pages.map(p=>`| ${p.slug} | ${p.group} | [${p.folder}](${link('documentacion',p.folder)}/README.md) | [SEO](${link('documentacion',p.folder)}/es/SEO-GHL.md) | ${p.english} |`).join('\n')+'\n');
for (const section of ['categorias','servicios']) {
  const entries = manifest.pages.filter(p=>p.folder.startsWith(section+'/'));
  write(`${section}/README.md`, `# ${section === 'categorias' ? 'Categorías' : 'Servicios'} — ILATEK\n\n${entries.length} páginas existentes. Cada carpeta incluye el embed ES, su SEO, assets y el estado de EN.\n\n`+
    ['limpieza','techos'].map(group=>`## ${group === 'limpieza' ? 'Limpieza' : 'Techos'}\n\n`+entries.filter(p=>p.group===group).map(p=>`- [${p.slug}](${link(section,p.folder)}/README.md)${p.status.startsWith('legacy') ? ' — legado con canonical /home' : ''}`).join('\n')).join('\n\n')+'\n');
}
json('documentacion/assets-pendientes.json', missing);
const withoutBackup = missing.filter(m=>!m.backupFile);
console.log(`Packaged ${manifest.pages.length} pages; ${allMedia.size} distinct original media; ${missing.length} CDN references unavailable; ${withoutBackup.length} without local backup.`);
if (withoutBackup.length) process.exitCode = 1;
