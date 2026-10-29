import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import GUI from "lil-gui";

const AUTOR = "Paula Lijun Nuez Hernández";
const TEXDIR = "src/textures/";

// datos de los astros (info que se ve en la esquina baja izquierda)
const SOL = {
  name: "Sol",
  radius: 3,
  archivo: TEXDIR + "2k_sun.jpg",
  info: {
    desc: "Es una estrella de tipo G. Concentra el 99,86 % de la masa del sistema solar y su gravedad mantiene en órbita a todos los planetas.",
    diametro: "1,39 millones de km",
    periodo: "Gira sobre sí mismo cada ~25 días (en el ecuador)",
  },
};

const PLANETAS = [
  {
    name: "Mercurio",
    tipo: "rocoso",
    colores: ["#8c8c8c", "#5e5e5e"],
    archivos: { map: TEXDIR + "2k_mercury.jpg" },
    radius: 0.35,
    dist: 6,
    f1: 1,
    f2: 0.94,
    speed: 1.0,
    spin: 0.1,
    tilt: 0.03,
    info: {
      desc: "El planeta más pequeño y el más cercano al Sol. No tiene atmósfera apreciable, así que sus temperaturas varían muchísimo entre el día y la noche.",
      diametro: "4.879 km",
      periodo: "88 días",
      lunas: "Ninguna",
    },
  },
  {
    name: "Venus",
    tipo: "gas",
    colores: ["#e6c27a", "#c9a15a", "#f0d9a0"],
    archivos: { map: TEXDIR + "2k_venus_atmosphere.jpg" },
    radius: 0.7,
    dist: 9,
    f1: 1,
    f2: 0.98,
    speed: 0.75,
    spin: -0.05,
    tilt: 0.05,
    info: {
      desc: "Su atmósfera de CO2 provoca un efecto invernadero extremo (~465 °C), el planeta más caliente. Gira al revés que casi todos los demás (rotación retrógrada).",
      diametro: "12.104 km",
      periodo: "225 días",
      lunas: "Ninguna",
    },
  },
  {
    name: "Tierra",
    tipo: "tierra",
    colores: [],
    radius: 0.75,
    dist: 13,
    f1: 1,
    f2: 0.97,
    speed: 0.55,
    spin: 1.0,
    tilt: 0.41,
    nubes: true,
    archivos: {
      map: TEXDIR + "2k_earth_daymap.jpg",
      normal: TEXDIR + "2k_earth_normal_map.jpg",
      spec: TEXDIR + "2k_earth_specular_map.jpg",
      noche: TEXDIR + "2k_earth_nightmap.jpg",
      nubes: TEXDIR + "2k_earth_clouds.jpg",
    },
    info: {
      desc: "Nuestro hogar y el único mundo conocido con vida hasta ahora. Cerca del 71 % de su superficie está cubierta por océanos. La inclinación de su eje (~23,4°) origina las estaciones.",
      diametro: "12.742 km",
      periodo: "365,25 días",
      lunas: "1 (la Luna)",
    },
    lunas: [
      {
        name: "Luna",
        radius: 0.2,
        dist: 1.5,
        speed: 2.0,
        incl: 0.09,
        colores: ["#b5b5b5", "#7d7d7d"],
        archivo: TEXDIR + "2k_moon.jpg",
        info: {
          desc: "Único satélite natural de la Tierra. Siempre nos muestra la misma cara porque su rotación y su traslación duran lo mismo.",
          diametro: "3.474 km",
          periodo: "27,3 días alrededor de la Tierra",
        },
      },
    ],
  },
  {
    name: "Marte",
    tipo: "rocoso",
    colores: ["#c1440e", "#8a2f0a"],
    archivos: { map: TEXDIR + "2k_mars.jpg" },
    radius: 0.5,
    dist: 17,
    f1: 1,
    f2: 0.9,
    speed: 0.42,
    spin: 0.95,
    tilt: 0.44,
    info: {
      desc: "El planeta rojo debe su color al óxido de hierro. Alberga el Monte Olimpo, el mayor volcán conocido del sistema solar.",
      diametro: "6.779 km",
      periodo: "687 días",
      lunas: "2 (Fobos y Deimos)",
    },
    lunas: [
      {
        name: "Fobos",
        radius: 0.08,
        dist: 0.85,
        speed: 4.0,
        incl: 0.05,
        colores: ["#8a7a6a", "#5a4a3a"],
        info: {
          desc: "Luna diminuta y de forma irregular; orbita muy cerca de Marte.",
          diametro: "~22 km",
        },
      },
      {
        name: "Deimos",
        radius: 0.06,
        dist: 1.2,
        speed: 2.8,
        incl: 0.1,
        colores: ["#9a8a7a", "#6a5a4a"],
        info: {
          desc: "La más pequeña y externa de las dos lunas de Marte.",
          diametro: "~12 km",
        },
      },
    ],
  },
  {
    name: "Júpiter",
    tipo: "gas",
    colores: ["#d8b894", "#a67b5b", "#e8d8c0", "#8c5a3c"],
    archivos: { map: TEXDIR + "2k_jupiter.jpg" },
    radius: 1.9,
    dist: 25,
    f1: 1,
    f2: 0.96,
    speed: 0.25,
    spin: 2.4,
    tilt: 0.05,
    info: {
      desc: "El gigante del sistema solar: cabrían más de 1.300 Tierras en su interior. Es un planeta gaseoso con tormentas enormes, como la Gran Mancha Roja.",
      diametro: "139.820 km",
      periodo: "11,9 años",
      lunas: "Más de 90 (se muestran las 3 mayores galileanas)",
    },
    lunas: [
      {
        name: "Ío",
        radius: 0.22,
        dist: 2.7,
        speed: 3.2,
        incl: 0.03,
        colores: ["#e8d25a", "#b08a2a"],
        info: {
          desc: "El cuerpo con más actividad volcánica del sistema solar.",
          diametro: "3.643 km",
        },
      },
      {
        name: "Europa",
        radius: 0.2,
        dist: 3.3,
        speed: 2.4,
        incl: 0.05,
        colores: ["#e6dccc", "#b59a7a"],
        info: {
          desc: "Bajo su corteza de hielo podría haber un océano de agua líquida.",
          diametro: "3.122 km",
        },
      },
      {
        name: "Ganímedes",
        radius: 0.3,
        dist: 4.0,
        speed: 1.7,
        incl: 0.04,
        colores: ["#9a8f85", "#6a5f55"],
        info: {
          desc: "La luna más grande del sistema solar, mayor incluso que Mercurio.",
          diametro: "5.268 km",
        },
      },
    ],
  },
  {
    name: "Saturno",
    tipo: "gas",
    colores: ["#e8d08a", "#c9a85a", "#f2e2b0"],
    archivos: { map: TEXDIR + "2k_saturn.jpg" },
    radius: 1.6,
    dist: 34,
    f1: 1,
    f2: 0.97,
    speed: 0.18,
    spin: 2.2,
    tilt: 0.47,
    anillos: {
      inner: 2.05,
      outer: 3.85,
      archivo: TEXDIR + "2k_saturn_ring_alpha.png",
    },
    info: {
      desc: "Famoso por sus anillos de hielo y roca. Es tan poco denso que flotaría en agua (si hubiera un océano suficientemente grande).",
      diametro: "116.460 km",
      periodo: "29,5 años",
      lunas: "Más de 140 (se muestra Titán)",
    },
    lunas: [
      {
        name: "Titán",
        radius: 0.3,
        dist: 4.6,
        speed: 1.2,
        incl: 0.1,
        colores: ["#d9a441", "#a8742a"],
        info: {
          desc: "La segunda luna más grande del sistema solar y la única con una atmósfera densa.",
          diametro: "5.150 km",
        },
      },
    ],
  },
  {
    name: "Urano",
    tipo: "hielo",
    colores: ["#9fe3e8", "#8dd3da"],
    archivos: { map: TEXDIR + "2k_uranus.jpg" },
    radius: 1.1,
    dist: 42,
    f1: 1,
    f2: 0.98,
    speed: 0.12,
    spin: -1.4,
    tilt: 1.71,
    info: {
      desc: "Gigante helado cuyo eje está inclinado ~98°: da la sensación de rodar de lado alrededor del Sol.",
      diametro: "50.724 km",
      periodo: "84 años",
      lunas: "Más de 25",
    },
  },
  {
    name: "Neptuno",
    tipo: "hielo",
    colores: ["#3f5fe0", "#2a3fa8", "#5a7bf0"],
    archivos: { map: TEXDIR + "2k_neptune.jpg" },
    radius: 1.05,
    dist: 49,
    f1: 1,
    f2: 0.99,
    speed: 0.09,
    spin: 1.5,
    tilt: 0.49,
    info: {
      desc: "El planeta más lejano. Tiene los vientos más rápidos del sistema solar, que superan los 2.000 km/h.",
      diametro: "49.244 km",
      periodo: "164,8 años",
      lunas: "Más de una decena (Tritón es la mayor)",
    },
  },

  // planetas enanos (texturas "fictional" de solar system scope)
  {
    name: "Ceres",
    tipo: "rocoso",
    colores: ["#8a8a8a", "#5a5a5a"],
    archivos: { map: TEXDIR + "2k_ceres_fictional.jpg" },
    radius: 0.2,
    dist: 21,
    f1: 1,
    f2: 0.93,
    speed: 0.33,
    spin: 1.0,
    tilt: 0.07,
    info: {
      desc: "Planeta enano del cinturón de asteroides, entre Marte y Júpiter. Descubierto en 1801, es el mayor objeto de ese cinturón. La sonda Dawn de la NASA lo estudió desde su órbita.",
      diametro: "~940 km",
      periodo: "4,6 años",
      lunas: "Ninguna",
    },
  },
  {
    name: "Haumea",
    tipo: "rocoso",
    colores: ["#cfcfcf", "#9a9a9a"],
    archivos: { map: TEXDIR + "2k_haumea_fictional.jpg" },
    radius: 0.25,
    dist: 56,
    f1: 1,
    f2: 0.9,
    speed: 0.07,
    spin: 2.5,
    tilt: 0.1,
    info: {
      desc: "Planeta enano muy alargado porque gira sobre sí mismo en unas 4 horas. Tiene dos lunas y un sistema de anillos.",
      diametro: "~1.600 km (media)",
      periodo: "~284 años",
      lunas: "2 (Hi'iaka y Namaka)",
    },
  },
  {
    name: "Makemake",
    tipo: "rocoso",
    colores: ["#b5754a", "#7a4a2a"],
    archivos: { map: TEXDIR + "2k_makemake_fictional.jpg" },
    radius: 0.25,
    dist: 63,
    f1: 1,
    f2: 0.95,
    speed: 0.06,
    spin: 0.8,
    tilt: 0.05,
    info: {
      desc: "Planeta enano del cinturón de Kuiper, descubierto en 2005. Su superficie es muy brillante y está cubierta de hielos, entre ellos metano.",
      diametro: "~1.430 km",
      periodo: "~305 años",
      lunas: "1",
    },
  },
  {
    name: "Eris",
    tipo: "rocoso",
    colores: ["#e0e0e0", "#a8a8a8"],
    archivos: { map: TEXDIR + "2k_eris_fictional.jpg" },
    radius: 0.3,
    dist: 70,
    f1: 1,
    f2: 0.88,
    speed: 0.05,
    spin: 0.6,
    tilt: 0.1,
    info: {
      desc: "Planeta enano del disco disperso, descubierto en 2005. Es más masivo que Plutón, y su hallazgo llevó a la Unión Astronómica Internacional a definir qué es un planeta enano (2006).",
      diametro: "~2.330 km",
      periodo: "~560 años",
      lunas: "1 (Disnomia)",
    },
  },
];

// variables gloables
let scene, renderer, camGen, camNave, orbit, nave, ambient, luzSol;
let sol;
const planetas = [];
const pickables = []; // mallas que se pueden seleccionar con el ratón
let orbitasGroup;
let dock = null; // astro al que está acoplada la nave
let simTime = 0;
let frame = 0;
let gui;
let mouse = null; // posición del ratón sobre el canvas (null si está fuera)
let fichaClave = ""; // para no reescribir la ficha si no ha cambiado

const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();
const teclas = {};

// interfaz (CSS + paneles)
const ui = crearInterfaz();
const labelsEl = ui.etiquetas;
const fichaEl = ui.ficha;
const hudEl = ui.hud;
const insetEl = ui.inset;

// parámetros controlados por la GUI
const params = {
  vista: "general",
  pausa: false,
  velocidad: 1,
  orbitas: true,
  etiquetas: true,
  seguir: false,
  velNave: 10,
  fov: 70,
  destino: "Tierra",
  acoplar: false,
};

// texturas procedurales (canvas) --> no hace falta ningún archivo
// generador pseudoaleatorio con semilla (mulberry32) para que sean reproducibles
function rng(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function semilla(texto) {
  let h = 7;
  for (const ch of texto) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return h;
}

function canvasTexture(w, h, dibujar) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  dibujar(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const TEX = {
  rocoso: (c, s) =>
    canvasTexture(512, 256, (g, w, h) => {
      const r = rng(s);
      g.fillStyle = c[0];
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 900; i++) {
        g.globalAlpha = 0.15 + r() * 0.35;
        g.fillStyle = r() < 0.5 ? c[1] : c[0];
        g.beginPath();
        g.arc(r() * w, r() * h, 1 + r() * r() * 14, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }),

  // bandas horizontales --> sirve para gigantes gaseosos, venus y gigantes helados
  gas: (c, s) =>
    canvasTexture(512, 256, (g, w, h) => {
      const r = rng(s);
      g.fillStyle = c[0];
      g.fillRect(0, 0, w, h);
      for (let y = 0; y < h; ) {
        const bh = 4 + r() * 20;
        g.globalAlpha = 0.6 + r() * 0.4;
        g.fillStyle = c[(r() * c.length) | 0];
        g.fillRect(0, y, w, bh);
        y += bh;
      }
      g.globalAlpha = 0.18;
      for (let i = 0; i < 250; i++) {
        g.fillStyle = c[(r() * c.length) | 0];
        g.beginPath();
        g.ellipse(
          r() * w,
          r() * h,
          6 + r() * 20,
          1 + r() * 3,
          0,
          0,
          Math.PI * 2
        );
        g.fill();
      }
      g.globalAlpha = 1;
    }),

  tierra: (c, s) =>
    canvasTexture(1024, 512, (g, w, h) => {
      const r = rng(s);
      g.fillStyle = "#1d4e9e";
      g.fillRect(0, 0, w, h);
      const tierras = ["#3f8a3c", "#5f9b45", "#8a7a45"];
      for (let k = 0; k < 12; k++) {
        const cx = r() * w;
        const cy = h * 0.2 + r() * h * 0.6;
        g.fillStyle = tierras[k % 3];
        for (let j = 0; j < 40; j++) {
          g.beginPath();
          g.arc(
            cx + (r() - 0.5) * 110,
            cy + (r() - 0.5) * 60,
            6 + r() * 20,
            0,
            Math.PI * 2
          );
          g.fill();
        }
      }
      g.fillStyle = "#f4f8ff"; // casquetes polares
      g.fillRect(0, 0, w, 14);
      g.fillRect(0, h - 14, w, 14);
    }),

  nubes: (s) =>
    canvasTexture(1024, 512, (g, w, h) => {
      const r = rng(s);
      g.clearRect(0, 0, w, h);
      for (let i = 0; i < 220; i++) {
        g.globalAlpha = 0.2 + r() * 0.4;
        g.fillStyle = "#ffffff";
        g.beginPath();
        g.ellipse(
          r() * w,
          r() * h,
          10 + r() * 40,
          3 + r() * 10,
          0,
          0,
          Math.PI * 2
        );
        g.fill();
      }
      g.globalAlpha = 1;
    }),

  sol: (c, s) =>
    canvasTexture(512, 256, (g, w, h) => {
      const r = rng(s);
      g.fillStyle = c[0];
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 1200; i++) {
        g.globalAlpha = 0.1 + r() * 0.25;
        g.fillStyle = r() < 0.6 ? c[1] : c[2];
        g.beginPath();
        g.arc(r() * w, r() * h, 2 + r() * r() * 18, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }),

  // textura radial para el anillo (ringgeometry usa uv planares)
  anillos: (ratio, s) =>
    canvasTexture(512, 512, (g, w, h) => {
      const r = rng(s);
      const R = w / 2;
      g.clearRect(0, 0, w, h);
      for (let rr = ratio * R; rr < R; rr += 1.5) {
        const f = rr / R;
        if (f > 0.74 && f < 0.77) continue; // hueco tipo división de cassini
        const rojo = 200 + ((r() * 40) | 0);
        const verde = 180 + ((r() * 40) | 0);
        const azul = 130 + ((r() * 30) | 0);
        g.strokeStyle =
          "rgba(" +
          rojo +
          "," +
          verde +
          "," +
          azul +
          "," +
          (0.25 + r() * 0.6) +
          ")";
        g.lineWidth = 2;
        g.beginPath();
        g.arc(R, R, rr, 0, Math.PI * 2);
        g.stroke();
      }
    }),

  halo: () =>
    canvasTexture(256, 256, (g, w, h) => {
      const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, "rgba(255,220,120,1)");
      gr.addColorStop(0.35, "rgba(255,160,40,0.45)");
      gr.addColorStop(1, "rgba(255,120,0,0)");
      g.fillStyle = gr;
      g.fillRect(0, 0, w, h);
    }),
};

function texturaPlaneta(d) {
  const s = semilla(d.name);
  if (d.tipo === "tierra") return TEX.tierra(d.colores, s);
  if (d.tipo === "rocoso") return TEX.rocoso(d.colores, s);
  return TEX.gas(d.colores, s); // gas, hielo
}

// intenta cargar texturas reales; si no existen se queda la procedural
const loader = new THREE.TextureLoader();
function cargarOpcional(url, esColor, alCargar) {
  loader.load(
    url,
    (t) => {
      if (esColor) t.colorSpace = THREE.SRGBColorSpace;
      alCargar(t);
    },
    undefined,
    () =>
      console.info("Textura no encontrada (" + url + "), se usa la procedural")
  );
}

// creación de la escena
//   - arriba centro: título y autoría
//   - arriba izquierda: estado de la nave y controles
//   - arriba derecha: panel de lil-gui
//   - abajo izquierda: ficha del astro (ratón encima / cercanía de la nave)
//   - abajo derecha: mini-vista de la nave (modo 3)
function crearInterfaz() {
  // si el index.html antiguo aún trae estos elementos, se quitan para no duplicarlos
  ["titulo", "etiquetas", "inset", "hud", "ficha", "ayuda"].forEach((id) => {
    const viejo = document.getElementById(id);
    if (viejo) viejo.remove();
  });

  const css = `
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #000; color: #fff; font-family: Monospace, monospace; }
    canvas { display: block; position: fixed; top: 0; left: 0; z-index: 0; }
    #ui-titulo { position: fixed; top: 12px; left: 0; width: 100%; text-align: center; font-weight: bold; text-shadow: 0 0 4px #000; pointer-events: none; z-index: 5; }
    #ui-titulo .t1 { font-size: 18px; }
    #ui-titulo .t2 { font-size: 13px; font-weight: normal; opacity: 0.85; }
    #ui-etiquetas { position: fixed; top: 0; left: 0; right: 0; bottom: 0; overflow: hidden; pointer-events: none; z-index: 2; }
    .ui-etiqueta { position: absolute; transform: translate(-50%, -130%); font-size: 12px; white-space: nowrap; text-shadow: 0 0 3px #000, 0 0 3px #000; }
    #ui-izq { position: fixed; top: 12px; left: 12px; width: 280px; z-index: 5; display: flex; flex-direction: column; gap: 8px; }
    #ui-hud { display: none; background: rgba(0,0,0,0.6); border-radius: 8px; padding: 6px 12px; font-size: 12px; line-height: 1.4; pointer-events: none; }
    #ui-ayuda { background: rgba(0,0,0,0.6); border-radius: 8px; padding: 6px 12px; font-size: 12px; line-height: 1.5; }
    #ui-ayuda summary { cursor: pointer; font-weight: bold; }
    #ui-ayuda .ui-sub { margin: 6px 0 2px; color: #8fd3ff; }
    #ui-ayuda kbd { background: #333; border-radius: 3px; padding: 0 4px; }
    #ui-ficha { display: none; position: fixed; left: 12px; bottom: 12px; width: 290px; background: rgba(0,0,0,0.7); border: 1px solid #555; border-radius: 8px; padding: 4px 14px 10px; font-size: 13px; line-height: 1.4; z-index: 5; pointer-events: none; max-height: 62vh; overflow: hidden; }
    #ui-ficha h3 { margin: 8px 0 4px; }
    #ui-ficha ul { padding-left: 18px; margin: 6px 0 0; }
    #ui-ficha p { margin: 4px 0; }
    #ui-ficha .ficha-item + .ficha-item { border-top: 1px solid #555; margin-top: 8px; padding-top: 2px; }
    #ui-ficha .ficha-sub { color: #8fd3ff; font-size: 11px; }
    #ui-inset { display: none; position: fixed; right: 16px; bottom: 16px; width: 30vw; height: 30vh; border: 2px solid #8fd3ff; box-sizing: border-box; pointer-events: none; z-index: 5; }
  `;
  const estilo = document.createElement("style");
  estilo.textContent = css;
  document.head.appendChild(estilo);

  function crear(tag, id, html) {
    const e = document.createElement(tag);
    e.id = id;
    if (html) e.innerHTML = html;
    return e;
  }

  const titulo = crear(
    "div",
    "ui-titulo",
    '<div class="t1">Sistema solar</div><div class="t2">EII · Autoría: ' +
      AUTOR +
      "</div>"
  );
  const etiquetas = crear("div", "ui-etiquetas");
  const izq = crear("div", "ui-izq");
  const hud = crear("div", "ui-hud");
  const ayuda = crear(
    "details",
    "ui-ayuda",
    `<summary>Controles (atajos)</summary>
     <p class="ui-sub">Vista general</p>
     Arrastrar: orbitar · Rueda: zoom · Clic derecho: desplazar<br>
     Ratón sobre un astro: ficha didáctica
     <p class="ui-sub">Nave</p>
     <kbd>W</kbd>/<kbd>S</kbd> avanzar/frenar · <kbd>Shift</kbd> turbo<br>
     <kbd>A</kbd>/<kbd>D</kbd> o <kbd>←</kbd>/<kbd>→</kbd> girar<br>
     <kbd>↑</kbd>/<kbd>↓</kbd> cabeceo · <kbd>Q</kbd>/<kbd>E</kbd> alabeo<br>
     <kbd>R</kbd>/<kbd>F</kbd> subir/bajar<br>
     Acércate a un astro o luna: ficha didáctica
     <p class="ui-sub">Atajos</p>
     <kbd>1</kbd> general · <kbd>2</kbd> nave · <kbd>3</kbd> general + mini-vista<br>
     <kbd>P</kbd> pausa · <kbd>O</kbd> órbitas · <kbd>L</kbd> nombres`
  );
  ayuda.open = true;
  izq.appendChild(hud);
  izq.appendChild(ayuda);
  const ficha = crear("div", "ui-ficha");
  const inset = crear("div", "ui-inset");

  [titulo, etiquetas, izq, ficha, inset].forEach((e) =>
    document.body.appendChild(e)
  );
  return { etiquetas, ficha, hud, inset };
}

// creación de la escena
function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000005);
  // fondo de la vía láctea (equirrectangular); si no existe queda el negro + estrellas
  cargarOpcional(TEXDIR + "2k_stars_milky_way.jpg", true, (t) => {
    t.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = t;
  });

  // cámara de la vista general
  camGen = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    3000
  );
  camGen.position.set(0, 45, 80);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  orbit = new OrbitControls(camGen, renderer.domElement);
  orbit.enableDamping = true;
  orbit.minDistance = 2;
  orbit.maxDistance = 400;

  // LUCES --> ambiente tenue + luz puntual en el Sol (sin atenuación)
  ambient = new THREE.AmbientLight(0xffffff, 0.15);
  scene.add(ambient);
  luzSol = new THREE.PointLight(0xfff2dd, 1.6, 0, 0);
  scene.add(luzSol);

  crearEstrellas();
  crearSol();
  PLANETAS.forEach((d, i) => crearPlaneta(d, i));
  crearNave();
  crearGUI();
  eventos();
  aplicarVista();
}

function crearEstrellas() {
  const n = 2500;
  const pos = new Float32Array(n * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    v.randomDirection().multiplyScalar(900 + Math.random() * 300);
    pos.set([v.x, v.y, v.z], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 1.6,
    sizeAttenuation: false,
  });
  scene.add(new THREE.Points(g, m));
}

function crearEtiqueta(texto) {
  const el = document.createElement("div");
  el.className = "ui-etiqueta";
  el.textContent = texto;
  labelsEl.appendChild(el);
  return el;
}

function crearSol() {
  const mat = new THREE.MeshBasicMaterial({
    map: TEX.sol(["#ffb400", "#ffe27a", "#d9530b"], semilla("Sol")),
  });
  if (SOL.archivo)
    cargarOpcional(SOL.archivo, true, (t) => {
      mat.map = t;
      mat.needsUpdate = true;
    });
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(SOL.radius, 48, 32),
    mat
  );
  scene.add(mesh);

  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: TEX.halo(),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  );
  halo.scale.set(SOL.radius * 5, SOL.radius * 5, 1);
  mesh.add(halo);

  sol = {
    kind: "sol",
    name: SOL.name,
    mesh,
    radius: SOL.radius,
    info: SOL.info,
    label: crearEtiqueta(SOL.name),
  };
  mesh.userData.body = sol;
  pickables.push(mesh);

  orbitasGroup = new THREE.Group();
  scene.add(orbitasGroup);
}

function crearPlaneta(d, indice) {
  // pivot (posición en la órbita) > tilt (inclinación del eje) > mesh (rotación propia)
  const pivot = new THREE.Object3D();
  scene.add(pivot);
  const tilt = new THREE.Object3D();
  tilt.rotation.z = d.tilt || 0;
  pivot.add(tilt);

  const mat = new THREE.MeshPhongMaterial({
    map: texturaPlaneta(d),
    shininess: 5,
    specular: 0x111111,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(d.radius, 48, 32), mat);
  tilt.add(mesh);

  // texturas reales (si el archivo no existe se queda la procedural)
  if (d.archivos) {
    const a = d.archivos;
    if (a.map)
      cargarOpcional(a.map, true, (t) => {
        mat.map = t;
        mat.needsUpdate = true;
      });
    if (a.normal)
      cargarOpcional(a.normal, false, (t) => {
        mat.normalMap = t;
        mat.needsUpdate = true;
      });
    if (a.spec)
      cargarOpcional(a.spec, false, (t) => {
        mat.specularMap = t;
        mat.specular = new THREE.Color(0x888888);
        mat.shininess = 20;
        mat.needsUpdate = true;
      });
    // luces de las ciudades --> se nota sobre todo en la cara nocturna
    if (a.noche)
      cargarOpcional(a.noche, true, (t) => {
        mat.emissiveMap = t;
        mat.emissive = new THREE.Color(0xffffff);
        mat.emissiveIntensity = 0.6;
        mat.needsUpdate = true;
      });
  }

  const rec = {
    kind: "planeta",
    name: d.name,
    mesh,
    pivot,
    tilt,
    radius: d.radius,
    dist: d.dist,
    f1: d.f1,
    f2: d.f2,
    speed: d.speed,
    spin: d.spin,
    phase: indice * 1.3,
    lunas: [],
    nubes: null,
    info: d.info,
    label: crearEtiqueta(d.name),
  };
  mesh.userData.body = rec;
  pickables.push(mesh);
  planetas.push(rec);

  // capa de nubes
  if (d.nubes) {
    const nm = new THREE.MeshPhongMaterial({
      map: TEX.nubes(semilla("nubes")),
      transparent: true,
      depthWrite: false,
    });
    rec.nubes = new THREE.Mesh(
      new THREE.SphereGeometry(d.radius * 1.03, 48, 32),
      nm
    );
    tilt.add(rec.nubes);
    // la imagen de nubes se usa como mapa de transparencia
    if (d.archivos && d.archivos.nubes) {
      cargarOpcional(d.archivos.nubes, false, (t) => {
        nm.map = null;
        nm.alphaMap = t;
        nm.needsUpdate = true;
      });
    }
  }

  // anillos (saturno)
  if (d.anillos) {
    const ringGeo = new THREE.RingGeometry(
      d.anillos.inner,
      d.anillos.outer,
      96
    );
    const ringMat = new THREE.MeshPhongMaterial({
      map: TEX.anillos(d.anillos.inner / d.anillos.outer, semilla("anillos")),
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2; // lo tumba al plano ecuatorial
    tilt.add(ring);

    if (d.anillos.archivo) {
      cargarOpcional(d.anillos.archivo, true, (t) => {
        // la imagen es una tira (de dentro a fuera)
        const uv = ringGeo.attributes.uv;
        const pos = ringGeo.attributes.position;
        const v = new THREE.Vector3();
        for (let i = 0; i < uv.count; i++) {
          v.fromBufferAttribute(pos, i);
          uv.setXY(
            i,
            (v.length() - d.anillos.inner) /
              (d.anillos.outer - d.anillos.inner),
            0.5
          );
        }
        uv.needsUpdate = true;
        ringMat.map = t;
        ringMat.needsUpdate = true;
      });
    }
  }

  // lunas
  (d.lunas || []).forEach((l) => crearLuna(rec, l));

  // órbita dibujada (elipse en el plano XZ)
  const curva = new THREE.EllipseCurve(0, 0, d.dist * d.f1, d.dist * d.f2);
  const geo = new THREE.BufferGeometry().setFromPoints(curva.getPoints(128));
  geo.rotateX(Math.PI / 2); // (x, y, 0) -> (x, 0, y)
  orbitasGroup.add(
    new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x555555 }))
  );
}

function crearLuna(planeta, l) {
  const mp = new THREE.Object3D(); // pivote de la luna, con su inclinación orbital
  mp.rotation.x = l.incl || 0;
  planeta.pivot.add(mp);
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(l.radius, 24, 16),
    new THREE.MeshPhongMaterial({
      map: TEX.rocoso(l.colores, semilla(l.name)),
      shininess: 3,
    })
  );
  mp.add(mesh);
  if (l.archivo) {
    cargarOpcional(l.archivo, true, (t) => {
      mesh.material.map = t;
      mesh.material.needsUpdate = true;
    });
  }
  const rec = {
    kind: "luna",
    name: l.name,
    padre: planeta.name,
    mesh,
    radius: l.radius,
    dist: l.dist,
    speed: l.speed,
    phase: Math.random() * Math.PI * 2,
    info: l.info,
  };
  mesh.userData.body = rec;
  pickables.push(mesh);
  planeta.lunas.push(rec);
}

// nave
function crearNave() {
  nave = new THREE.Group();
  const gris = new THREE.MeshPhongMaterial({
    color: 0xdddddd,
    emissive: 0x222222,
    shininess: 60,
  });

  const cuerpo = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.9, 16), gris);
  cuerpo.rotation.x = -Math.PI / 2; // la punta apunta hacia -Z (hacia delante)
  nave.add(cuerpo);

  const alas = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.03, 0.35), gris);
  alas.position.z = 0.2;
  nave.add(alas);

  const motor = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 8),
    new THREE.MeshBasicMaterial({ color: 0xff8a2a })
  );
  motor.position.z = 0.5;
  nave.add(motor);

  // la cámara de la nave va dentro de la nave, mirando a -Z
  camNave = new THREE.PerspectiveCamera(
    params.fov,
    window.innerWidth / window.innerHeight,
    0.05,
    3000
  );
  camNave.position.set(0, 0.1, -0.1);
  nave.add(camNave);

  nave.position.set(10, 4, 36);
  apuntarNave(new THREE.Vector3(0, 0, 0));
  scene.add(nave);
}

function apuntarNave(t) {
  const p = nave.position;
  nave.lookAt(2 * p.x - t.x, 2 * p.y - t.y, 2 * p.z - t.z);
}

function actualizarNave(dt) {
  const k = teclas;
  const turbo = k.ShiftLeft || k.ShiftRight ? 4 : 1;
  const avance = (k.KeyW ? 1 : 0) - (k.KeyS ? 1 : 0);
  const vert = (k.KeyR ? 1 : 0) - (k.KeyF ? 1 : 0);
  const guinada =
    (k.KeyA || k.ArrowLeft ? 1 : 0) - (k.KeyD || k.ArrowRight ? 1 : 0);
  const cabeceo = (k.ArrowUp ? 1 : 0) - (k.ArrowDown ? 1 : 0);
  const alabeo = (k.KeyQ ? 1 : 0) - (k.KeyE ? 1 : 0);
  const giro = 1.2 * dt;

  nave.translateZ(-avance * params.velNave * turbo * dt);
  nave.translateY(vert * params.velNave * 0.5 * dt);
  nave.rotateY(guinada * giro);
  nave.rotateX(cabeceo * giro);
  nave.rotateZ(alabeo * giro);
}

function irAlAstro() {
  const a = listaAstros().find((x) => x.name === params.destino);
  if (!a) return;
  a.mesh.getWorldPosition(vA);
  const dir = vA.clone();
  dir.y = 0;
  if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
  dir.normalize();
  const r = a.radius * a.mesh.scale.x;
  nave.position.copy(vA).addScaledVector(dir, r * 3 + 2.5);
  nave.position.y += r * 0.8 + 0.5;
  apuntarNave(vA);
  if (params.acoplar) acoplarA(a);
}

function acoplarA(a) {
  dock = a
    ? { rec: a, last: a.mesh.getWorldPosition(new THREE.Vector3()) }
    : null;
}

function listaAstros() {
  return [sol].concat(planetas);
}

// ficha didáctica/informativa
//   - vista de la nave: astros y lunas cercanos a la nave
//   - vista general y general + mini-vista: astro bajo el ratón
function cuerposCercanos() {
  nave.getWorldPosition(vA);
  const candidatos = [sol].concat(planetas);
  for (const p of planetas) for (const l of p.lunas) candidatos.push(l);

  const cerca = [];
  for (const c of candidatos) {
    c.mesh.getWorldPosition(vB);
    const d = vA.distanceTo(vB) - c.radius; // distancia a la superficie
    if (d < Math.max(c.radius * 5, 5)) cerca.push({ rec: c, d: d });
  }
  cerca.sort((x, y) => x.d - y.d);
  return cerca.slice(0, 2).map((x) => x.rec); // como mucho 2 (p. ej. planeta + luna)
}

function cuerpoBajoRaton() {
  if (!mouse || params.vista === "nave" || enInset(mouse.x, mouse.y))
    return null;
  ndc.set(
    (mouse.x / window.innerWidth) * 2 - 1,
    -(mouse.y / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(ndc, camGen);
  const hit = raycaster.intersectObjects(pickables, false)[0];
  return hit ? hit.object.userData.body : null;
}

function htmlFicha(rec) {
  const i = rec.info || {};
  const filas = [
    ["Diámetro", i.diametro],
    ["Período orbital", i.periodo],
    ["Lunas", i.lunas],
  ].filter((f) => f[1]);
  let html = '<div class="ficha-item"><h3>' + rec.name + "</h3>";
  if (rec.padre)
    html += '<div class="ficha-sub">Luna de ' + rec.padre + "</div>";
  html += "<p>" + (i.desc || "") + "</p>";
  if (filas.length) {
    html +=
      "<ul>" +
      filas.map((f) => "<li><b>" + f[0] + ":</b> " + f[1] + "</li>").join("") +
      "</ul>";
  }
  return html + "</div>";
}

function mostrarFichas(lista) {
  const clave = lista.map((r) => r.name).join("|");
  if (clave === fichaClave) return; // nada ha cambiado
  fichaClave = clave;
  if (!lista.length) {
    fichaEl.style.display = "none";
    return;
  }
  fichaEl.innerHTML =
    lista.map(htmlFicha).join("") +
    '<p style="color:#888;font-size:11px">Escalas y distancias del modelo no son reales.</p>';
  fichaEl.style.display = "block";
}

// GUI
function crearGUI() {
  gui = new GUI();

  gui
    .add(params, "vista", {
      "Vista general": "general",
      "Vista de la nave": "nave",
      "General + mini-vista nave": "pip",
    })
    .name("Vista")
    .onChange(aplicarVista);

  const fSim = gui.addFolder("Simulación");
  fSim.add(params, "pausa").name("Pausa");
  fSim.add(params, "velocidad", 0, 5, 0.05).name("Velocidad del tiempo");
  fSim
    .add(params, "orbitas")
    .name("Mostrar órbitas")
    .onChange((v) => (orbitasGroup.visible = v));
  fSim.add(params, "etiquetas").name("Mostrar nombres");
  fSim.add(params, "seguir").name("Cámara sigue al destino");

  const fLuz = gui.addFolder("Iluminación");
  fLuz.add(ambient, "intensity", 0, 1, 0.01).name("Luz ambiente");
  fLuz.add(luzSol, "intensity", 0, 4, 0.1).name("Luz del Sol");

  const fNave = gui.addFolder("Nave");
  fNave.add(params, "velNave", 1, 80, 1).name("Velocidad (u/s)");
  fNave
    .add(params, "fov", 40, 110, 1)
    .name("Campo de visión")
    .onChange((v) => {
      camNave.fov = v;
      camNave.updateProjectionMatrix();
    });
  fNave
    .add(
      params,
      "destino",
      listaAstros().map((a) => a.name)
    )
    .name("Destino");
  fNave.add({ ir: irAlAstro }, "ir").name("Viajar al destino");
  fNave
    .add(params, "acoplar")
    .name("Acoplar (seguir su movimiento)")
    .onChange((v) => {
      if (v) acoplarA(listaAstros().find((x) => x.name === params.destino));
      else dock = null;
    });
}

function actualizarGUI() {
  gui.controllersRecursive().forEach((c) => c.updateDisplay());
}

function aplicarVista() {
  const enNave = params.vista === "nave";
  orbit.enabled = !enNave;
  insetEl.style.display = params.vista === "pip" ? "block" : "none";
  hudEl.style.display = params.vista === "general" ? "none" : "block";
}

// ------------------------------------------------------------
//  EVENTOS
// ------------------------------------------------------------
function enInset(x, y) {
  return (
    params.vista === "pip" &&
    x >= window.innerWidth * 0.7 - 16 &&
    y >= window.innerHeight * 0.7 - 16
  );
}

function eventos() {
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT") return;
    teclas[e.code] = true;
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].indexOf(
        e.code
      ) >= 0
    ) {
      e.preventDefault();
    }
    if (e.repeat) return;
    if (e.code === "Digit1") params.vista = "general";
    else if (e.code === "Digit2") params.vista = "nave";
    else if (e.code === "Digit3") params.vista = "pip";
    else if (e.code === "KeyP") params.pausa = !params.pausa;
    else if (e.code === "KeyO") {
      params.orbitas = !params.orbitas;
      orbitasGroup.visible = params.orbitas;
    } else if (e.code === "KeyL") params.etiquetas = !params.etiquetas;
    else return;
    aplicarVista();
    actualizarGUI();
  });
  window.addEventListener("keyup", (e) => {
    teclas[e.code] = false;
  });

  // posición del ratón sobre el canvas (para la ficha por "hover")
  renderer.domElement.addEventListener("pointermove", (e) => {
    mouse = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener("pointerleave", () => {
    mouse = null;
  });
}

// bucle de animación
function actualizarCuerpos(sdt) {
  simTime += sdt;

  sol.mesh.rotation.y += 0.05 * sdt;

  for (const p of planetas) {
    const a = p.phase + simTime * p.speed;
    p.pivot.position.set(
      Math.cos(a) * p.dist * p.f1,
      0,
      Math.sin(a) * p.dist * p.f2
    );
    p.mesh.rotation.y += p.spin * sdt;
    if (p.nubes) p.nubes.rotation.y += p.spin * 0.2 * sdt;
    for (const l of p.lunas) {
      const b = l.phase + simTime * l.speed;
      l.mesh.position.set(Math.cos(b) * l.dist, 0, Math.sin(b) * l.dist);
      l.mesh.rotation.y += 0.5 * sdt;
    }
  }
}

function renderVista(cam, x, y, w, h) {
  renderer.setViewport(x, y, w, h);
  renderer.setScissor(x, y, w, h);
  cam.aspect = w / h;
  cam.updateProjectionMatrix();

  nave.visible = cam !== camNave; // desde dentro de la nave no se ve su propio modelo
  renderer.render(scene, cam);
  nave.visible = true;
}

function renderizar() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  renderer.setScissorTest(true);

  const principal = params.vista === "nave" ? camNave : camGen;
  renderVista(principal, 0, 0, W, H);

  if (params.vista === "pip") {
    const w = Math.floor(W * 0.3);
    const h = Math.floor(H * 0.3);
    renderVista(camNave, W - w - 16, 16, w, h);
  }
  return principal;
}

function actualizarEtiquetas(cam) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  for (const a of listaAstros()) {
    a.mesh.getWorldPosition(vA);
    vA.project(cam);
    const sx = (vA.x * 0.5 + 0.5) * W;
    const sy = (-vA.y * 0.5 + 0.5) * H;
    const oculto = !params.etiquetas || vA.z > 1 || enInset(sx, sy);
    a.label.style.display = oculto ? "none" : "block";
    if (!oculto) {
      a.label.style.left = sx + "px";
      a.label.style.top = sy + "px";
    }
  }
}

function actualizarHud() {
  nave.getWorldPosition(vA);
  let cercano = null;
  let dmin = Infinity;
  for (const a of listaAstros()) {
    a.mesh.getWorldPosition(vB);
    const d = vA.distanceTo(vB) - a.radius * a.mesh.scale.x;
    if (d < dmin) {
      dmin = d;
      cercano = a;
    }
  }
  hudEl.textContent =
    "NAVE · velocidad: " +
    params.velNave +
    " u/s · astro más cercano: " +
    cercano.name +
    " (" +
    Math.max(dmin, 0).toFixed(1) +
    " u)";
}

function animar() {
  requestAnimationFrame(animar);
  const dt = Math.min(clock.getDelta(), 0.1);

  actualizarNave(dt);
  actualizarCuerpos(params.pausa ? 0 : dt * params.velocidad);

  if (dock) {
    dock.rec.mesh.getWorldPosition(vA);
    nave.position.add(vB.copy(vA).sub(dock.last));
    dock.last.copy(vA);
  }

  if (params.seguir && params.vista !== "nave") {
    const objetivo = listaAstros().find((x) => x.name === params.destino);
    if (objetivo) {
      objetivo.mesh.getWorldPosition(vA);
      camGen.position.add(vB.copy(vA).sub(orbit.target));
      orbit.target.copy(vA);
    }
  }
  orbit.update();

  const principal = renderizar();
  actualizarEtiquetas(principal);

  if (params.vista === "nave") {
    mostrarFichas(cuerposCercanos());
  } else {
    const bajoRaton = cuerpoBajoRaton();
    mostrarFichas(bajoRaton ? [bajoRaton] : []);
  }
  if (params.vista !== "general" && frame++ % 5 === 0) actualizarHud();
}

init();
animar();
