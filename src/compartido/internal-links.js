/* ILATEK: one shared URL contract; inlined into standalone GHL embeds. */
(function (w) {
  'use strict';
  if (w.ILATEK_LINKS) return;
  var TOKEN = '{' + '{custom_values.website_url}' + '}';
  var FALLBACK = 'https://ilatekpr.com';
  function normalize(value) {
    var raw = String(value || '').trim();
    if (!raw || raw.startsWith('/') || /[{}\s<>"'\\]/.test(raw)) return '';
    if (/^[a-z][a-z\d+.-]*:/i.test(raw) && !/^https?:\/\//i.test(raw)) return '';
    try {
      var u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw);
      if (u.username || u.password || u.search || u.hash || !u.hostname.includes('.')) return '';
      return 'https://' + u.host + u.pathname.replace(/\/+$/, '');
    } catch (e) { return ''; }
  }
  function bridge() {
    if (!w.document) return '';
    var nodes = w.document.querySelectorAll('.dv-ghl-values, #dv-ghl-values');
    var values = [];
    for (var i = 0; i < nodes.length; i++) {
      var parts = nodes[i].textContent.split('|||DV|||');
      if (parts.length !== 6) continue;
      var value = normalize(parts[3]);
      if (value && values.indexOf(value) < 0) values.push(value);
    }
    return values.length === 1 ? values[0] : '';
  }
  function base(value) { return bridge() || normalize(value) || FALLBACK; }
  function join(value, pathname) {
    var root = base(value), suffix = String(pathname || '/');
    if (!suffix.startsWith('/') || suffix.startsWith('//')) return root + '/';
    // Support an existing base-path once without changing the service path.
    var prefix = new URL(root).pathname.replace(/\/$/, '');
    if (prefix && (suffix === prefix || suffix.startsWith(prefix + '/'))) return new URL(root).origin + suffix;
    return root + suffix;
  }
  function replace(text, key, value) {
    var out = String(text || '');
    if (key !== TOKEN) return out.split(key).join(value);
    var root = base(value);
    return out.split('https://' + TOKEN).join(root).split('http://' + TOKEN).join(root).split(TOKEN).join(root);
  }
  w.ILATEK_LINKS = { normalize: normalize, base: base, join: join, replace: replace };
  if (!w.document) return;
  var doc = w.document, queued = false;
  function refresh() {
    queued = false;
    var nodes = doc.querySelectorAll('a[data-ilatek-path]');
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i], root = a.closest('[data-website-url]');
      var value = root && root.getAttribute('data-website-url');
      if (!normalize(value)) {
        var declared = doc.querySelector('[data-website-url]');
        value = declared && declared.getAttribute('data-website-url');
      }
      // GHL may resolve the href even when the surrounding data attribute is absent.
      if (!normalize(value)) {
        try { value = new URL(a.getAttribute('href')).origin; } catch (e) {}
      }
      var url = join(value, a.getAttribute('data-ilatek-path'));
      if (a.getAttribute('href') !== url) a.setAttribute('href', url);
    }
  }
  function schedule() {
    if (!queued) { queued = true; (w.requestAnimationFrame || w.setTimeout)(refresh); }
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', refresh, { once: true });
  else schedule();
  // One observer shared across menu/footer/page, including late GHL bridge values.
  if (w.MutationObserver) new w.MutationObserver(schedule).observe(doc.documentElement, {
    childList: true, subtree: true, characterData: true,
    attributes: true, attributeFilter: ['data-website-url', 'data-ilatek-path']
  });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-ilatek-anchor]');
    if (!a || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || a.target === '_blank') return;
    var id = a.getAttribute('data-ilatek-anchor');
    var target = id && doc.getElementById(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });
})(window);
