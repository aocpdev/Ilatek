// Ilustraciones del blog: cortes de techo por sistema, en SVG generado.
// Se incrustan en la página (sin archivos externos ni material de terceros),
// así que funcionan igual en local y en GHL, y no dependen de un CDN.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(HERE, "."); // Cada sistema se dibuja de arriba (superficie) hacia abajo (losa).
const SIS = {
  "silicona-100": {
    nombre: "Silicona 100%",
    capas: [
      ["Membrana de silicona", "#00b94f", 42],
      ["Imprimador", "#8bdcae", 13],
      ["Losa de concreto", "#c9d3ee", 56],
    ],
  },
  poliuretano: {
    nombre: "Poliuretano",
    capas: [
      ["Acabado protector", "#f2c14e", 16],
      ["Poliuretano", "#df8f00", 34],
      ["Imprimador", "#f6d79b", 12],
      ["Losa de concreto", "#c9d3ee", 52],
    ],
  },
  "acrilico-elastomerico": {
    nombre: "Acrílico elastomérico",
    capas: [
      ["Acrílico elastomérico", "#7fb3e8", 30],
      ["Sellador", "#bcd6f2", 14],
      ["Losa de concreto", "#c9d3ee", 54],
    ],
  },
  "membrana-asfaltica": {
    nombre: "Membrana asfáltica",
    capas: [
      ["Granilla mineral", "#5a5f72", 12, "grano"],
      ["Membrana SBS", "#20263a", 30],
      ["Imprimador asfáltico", "#3a4157", 12],
      ["Losa de concreto", "#c9d3ee", 50],
    ],
  },
  "membrana-liquida": {
    nombre: "Membrana líquida",
    capas: [
      ["Acabado", "#dfe6f5", 14],
      ["Capa base", "#9fb2d8", 16],
      ["Primer", "#c7d2e8", 12],
      ["Losa de concreto", "#c9d3ee", 52],
    ],
  },
  "sistema-multicapa": {
    nombre: "Sistema multicapa",
    capas: [
      ["Acabado reflectivo", "#eef3ff", 14],
      ["Capa de refuerzo", "#00b94f", 16],
      ["Base", "#0f8f4a", 18],
      ["Imprimador", "#8bdcae", 12],
      ["Losa de concreto", "#c9d3ee", 48],
    ],
  },
  "tpo-pvc": {
    nombre: "Membrana TPO / PVC",
    capas: [
      ["Lámina termoplástica", "#f7f9ff", 26, "soldadura"],
      ["Aislante", "#d9c9a8", 26],
      ["Losa de concreto", "#c9d3ee", 50],
    ],
  },
  "metal-zinc": {
    nombre: "Metal y zinc",
    capas: [
      ["Lámina acanalada", "#b9c3d6", 34, "canal"],
      ["Fieltro", "#6b7280", 12],
      ["Estructura", "#a8896a", 40],
    ],
  },
  "losa-cementicia": {
    nombre: "Losa de concreto",
    capas: [
      ["Sellador penetrante", "#bfe6cf", 16],
      ["Losa de concreto", "#c9d3ee", 96, "grieta"],
    ],
  },
  "techo-plano": {
    nombre: "Techo plano",
    capas: [
      ["Superficie de drenaje", "#dbe2f1", 18],
      ["Losa con pendiente", "#c9d3ee", 84],
    ],
  },
  "techo-comercial": {
    nombre: "Techo comercial",
    capas: [
      ["Cubierta", "#eef3ff", 20],
      ["Aislante rígido", "#d9c9a8", 32],
      ["Deck metálico", "#b9c3d6", 30],
    ],
  },
  "techo-residencial": {
    nombre: "Techo residencial",
    capas: [
      ["Cubierta", "#00b94f", 20],
      ["Fieltro", "#6b7280", 12],
      ["Madera", "#a8896a", 52],
    ],
  },
};
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Textura sobre la capa superior: granilla, soldadura, canal o grieta.
function motivo(tipo, x, y, w, h) {
  if (!tipo) return "";
  if (tipo === "grano") {
    const dots = [];
    for (let i = 0; i < 46; i++) {
      const px = x + 8 + ((i * 37) % (w - 16));
      const py = y + 4 + ((i * 13) % Math.max(4, h - 8));
      dots.push(
        `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="1.6" fill="#8d93a8" opacity=".7"/>`,
      );
    }
    return dots.join("");
  }
  if (tipo === "soldadura") {
    return `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#9fb2d8" stroke-width="2" stroke-dasharray="6 5"/>`;
  }
  if (tipo === "canal") {
    const ribs = [];
    for (let i = 1; i < 9; i++) {
      const rx = x + (w / 9) * i;
      ribs.push(
        `<path d="M${rx - 9} ${y} q9 ${h / 2} 0 ${h}" fill="none" stroke="#8b97ad" stroke-width="2" opacity=".85"/>`,
      );
    }
    return ribs.join("");
  }
  if (tipo === "grieta") {
    return `<path d="M${x + w * 0.28} ${y + 6} l14 22 l-8 14 l16 20 l-10 16" fill="none" stroke="#7f8aa3" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>`;
  }
  return "";
} // Pila de capas con su etiqueta debajo.
function pila(id, x, y, w) {
  const s = SIS[id] || SIS["techo-plano"];
  const total = s.capas.reduce((a, c) => a + c[2], 0);
  const escala = 300 / total; // alto de dibujo normalizado let cy = y; const rects = []; s.capas.forEach(([nombre, color, h, tipo], i) => { const hh = h * escala; rects.push(`<rect x="${x}" y="${cy.toFixed(1)}" width="${w}" height="${hh.toFixed(1)}" fill="${color}" rx="${i === s.capas.length - 1 ? 0 : 3}"/>`); rects.push(`<rect x="${x}" y="${cy.toFixed(1)}" width="${w}" height="${hh.toFixed(1)}" fill="none" stroke="#0b103d" stroke-opacity=".18" rx="3"/>`); if (tipo) rects.push(motivo(tipo, x, cy, w, hh)); cy += hh; }); return `<g> ${rects.join('')} <text x="${x}" y="${y - 16}" fill="#ffffff" font-family="Manrope,Arial,sans-serif" font-size="21" font-weight="800">${esc(s.nombre)}</text> </g>`;
}
export function imagenSistema({
  sistemas = ["techo-plano"],
  titulo = "",
} = {}) {
  const W = 1200,
    H = 660;
  const ids = sistemas.slice(0, 2);
  const gap = 64;
  const w = ids.length === 2 ? (W - 160 - gap) / 2 : Math.min(560, W - 160);
  const y = 250;
  const paneles = ids
    .map((id, i) => pila(id, 80 + i * (w + gap), y, w))
    .join("\n");
  const divisor =
    ids.length === 2
      ? `<g> <circle cx="${W / 2}" cy="${y + 150}" r="30" fill="#ffffff" fill-opacity=".08" stroke="#ffffff" stroke-opacity=".22"/> <text x="${W / 2}" y="${y + 158}" text-anchor="middle" fill="#ffffff" font-family="Manrope,Arial,sans-serif" font-size="17" font-weight="800" letter-spacing="1">vs</text> </g>`
      : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="ilbfig-t"> <title id="ilbfig-t">${esc(titulo || "Corte de techo por sistema")}</title> <defs> <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1"> <stop offset="0" stop-color="#0b103d"/><stop offset="1" stop-color="#1a2a6c"/> </linearGradient> <pattern id="malla" width="44" height="44" patternUnits="userSpaceOnUse"> <path d="M44 0H0V44" fill="none" stroke="#ffffff" stroke-opacity=".05"/> </pattern> </defs> <rect width="${W}" height="${H}" fill="url(#fondo)"/> <rect width="${W}" height="${H}" fill="url(#malla)"/> <text x="80" y="104" fill="#7fe3a6" font-family="Manrope,Arial,sans-serif" font-size="15" font-weight="800" letter-spacing="3">CORTE DEL SISTEMA</text> <text x="80" y="158" fill="#ffffff" font-family="Outfit,Manrope,Arial,sans-serif" font-size="42" font-weight="700">${esc(titulo || "Cómo se compone el techo")}</text> <line x1="80" y1="196" x2="${W - 80}" y2="196" stroke="#ffffff" stroke-opacity=".14"/> ${paneles} ${divisor} <text x="80" y="${H - 44}" fill="#93a0c4" font-family="Manrope,Arial,sans-serif" font-size="15" font-weight="600">Ilatek Property Solution · Puerto Rico · precios publicados por cada empresa, con fuente</text>
</svg>`;
} // Empareja un post con su ilustración y su texto alternativo.
export function imagenDePost(p) {
  const fams = p.familias || [];
  const map = {
    "losa-cementicia": "losa-cementicia",
    "metal-zinc": "metal-zinc",
    "techo-plano": "techo-plano",
  };
  let ids = fams.filter((f) => SIS[f]);
  if (!ids.length) {
    const porGrupo = {
      plano: "techo-plano",
      comercial: "techo-comercial",
      residencial: "techo-residencial",
      concreto: "losa-cementicia",
      zinc: "metal-zinc",
      aluminio: "metal-zinc",
      asfalto: "membrana-asfaltica",
      teja: "techo-residencial",
      madera: "techo-residencial",
      shingle: "membrana-asfaltica",
      industrial: "techo-comercial",
      costero: "silicona-100",
      institucional: "techo-comercial",
    };
    ids = [porGrupo[p.sustrato] || "techo-plano"];
  }
  const nombres = ids.slice(0, 2).map((i) => SIS[i].nombre);
  const alt =
    nombres.length === 2
      ? `Corte comparado del techo: capas de ${nombres[0]} frente a ${nombres[1]}, de la superficie a la losa.`
      : `Corte del techo con ${nombres[0]}: capas del sistema desde la superficie hasta la losa.`;
  const titulo =
    nombres.length === 2 ? `${nombres[0]} y ${nombres[1]}` : nombres[0];
  return { svg: imagenSistema({ sistemas: ids, titulo }), alt };
}
if (process.argv[2] === "demo") {
  const svg = imagenSistema({
    sistemas: ["silicona-100", "poliuretano"],
    titulo: "Silicona 100% y poliuretano",
  });
  const file = path.join(OUT, "preview-imagen.svg");
  fs.writeFileSync(file, svg);
  console.log("demo:", file, Math.round(svg.length / 1024) + "KB");
}
