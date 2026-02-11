// Impostor — Palabras Personalizadas
// Prototipo web (1 dispositivo). Sin backend.

const $ = (id) => document.getElementById(id);


function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

const screens = {
  home: $("screenHome"),
  words: $("screenWords"),
  setup: $("screenSetup"),
  reveal: $("screenReveal"),
  end: $("screenEnd"),
};

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
  window.scrollTo({top:0, behavior:"smooth"});
}

// ----- Storage: listas con categorías -----
// Estructura v2: [{ id, name, category, words, custom }]
const LS_KEY_V2 = "impostor_word_lists_v2";
const LS_KEY_V1 = "impostor_word_lists_v1";
const LS_AI_WEBHOOK = "impostor_ai_webhook_url";
const LS_HINT_MODE_PREFIX = "impostor_hint_mode_"; // + listId
// Nota: no pre-rellenamos un webhook por defecto. El usuario lo pega si lo necesita.
// Webhook de producción (no se muestra en la interfaz)
// Puedes cambiarlo editando este valor o pasando ?webhook=URL en la URL (se guardará en este navegador).
const DEFAULT_AI_WEBHOOK = "https://n8n-8n8n-3saur.easypanel.host/webhook/generar-pistas";

const PRESETS = [
  { name: "Comida rápida", category: "Comida", words: ["pizza","hamburguesa","tacos","kebab","burrito","nachos","hot dog","sushi","ramen","arepa","empanada","donut","helado","croissant","paella"] },
  { name: "Animales", category: "Animales", words: ["perro","gato","caballo","vaca","oveja","león","tigre","jirafa","elefante","mono","delfín","tiburón","águila","pingüino","cocodrilo"] },
  { name: "Países", category: "Lugares", words: ["España","Francia","Italia","Portugal","Alemania","México","Argentina","Colombia","Japón","China","Brasil","Chile","Canadá","Australia","Marruecos"] },
  { name: "Deportes", category: "Deportes", words: ["fútbol","baloncesto","tenis","voleibol","natación","atletismo","ciclismo","gimnasia","boxeo","golf","rugby","esquí","surf","pádel","hockey"] },
  { name: "Profesiones", category: "Profesiones", words: ["médico","profesor","ingeniero","abogado","bombero","policía","cocinero","actor","músico","periodista","enfermero","arquitecto","piloto","fotógrafo","programador"] },
{ name: "Videojuegos", category: "Juegos", words: ["Minecraft","Fortnite","FIFA","Call of Duty","Among Us","Mario Kart","Roblox","Zelda","GTA","Clash Royale","Pokémon","Valorant","Brawl Stars","League of Legends","Tetris","Animal Crossing","Rocket League","Fall Guys","The Sims","Overwatch"] },
{ name: "Cine y series", category: "Cine/Series", words: ["Harry Potter","Star Wars","Marvel","Stranger Things","La Casa de Papel","Breaking Bad","The Simpsons","Friends","The Witcher","Juego de Tronos","Shrek","Frozen","Toy Story","Avatar","Titanic","Batman","Spiderman","Sherlock","One Piece","Narcos"] },
{ name: "Objetos cotidianos", category: "Objetos", words: ["cepillo de dientes","mando","cargador","llaves","auriculares","botella","mochila","reloj","gafas","paraguas","sartén","cuchillo","silla","mesa","almohada","linterna","calculadora","pelota","cuaderno","bolígrafo"] },
{ name: "Tecnología", category: "Tecnología", words: ["wifi","bluetooth","ratón","teclado","pantalla","app","nube","robot","dron","cámara","GPS","USB","batería","chip","servidor","router","streaming","IA","código","memoria"] },
{ name: "Música", category: "Música", words: ["guitarra","piano","batería","concierto","rap","rock","reggaetón","pop","DJ","micrófono","altavoz","auriculares","playlist","estribillo","ritmo","melodía","acorde","karaoke","festival","vinilo"] }

];

const OFFICIAL_HINTS = {
  easy: {
  "pizza": "horno",
  "hamburguesa": "dos panes",
  "tacos": "tortilla",
  "kebab": "pan pita",
  "burrito": "enrollado",
  "nachos": "crujiente",
  "hot dog": "salchicha",
  "sushi": "arroz frío",
  "ramen": "caldo",
  "arepa": "maíz",
  "empanada": "relleno",
  "donut": "anillo",
  "helado": "congelado",
  "croissant": "hojaldre",
  "paella": "sartén grande",
  "perro": "lealtad",
  "gato": "silencio",
  "caballo": "fuerza",
  "vaca": "leche",
  "oveja": "lana",
  "león": "rey",
  "tigre": "rayas",
  "jirafa": "cuello",
  "elefante": "memoria",
  "mono": "imitación",
  "delfín": "inteligencia",
  "tiburón": "aleta",
  "águila": "altura",
  "pingüino": "frío",
  "cocodrilo": "río",
  "españa": "siesta",
  "francia": "croissant",
  "italia": "pasta",
  "portugal": "azulejos",
  "alemania": "cerveza",
  "méxico": "picante",
  "argentina": "mate",
  "colombia": "café",
  "japón": "isla",
  "china": "muralla",
  "brasil": "carnaval",
  "chile": "andés",
  "canadá": "frío",
  "australia": "canguro",
  "marruecos": "desierto",
  "fútbol": "equipo",
  "baloncesto": "rebote",
  "tenis": "raqueta",
  "voleibol": "red",
  "natación": "piscina",
  "atletismo": "pista",
  "ciclismo": "bicicleta",
  "gimnasia": "flexibilidad",
  "boxeo": "guantes",
  "golf": "hoyo",
  "rugby": "placaje",
  "esquí": "nieve",
  "surf": "ola",
  "pádel": "pared",
  "hockey": "puck",
  "médico": "diagnóstico",
  "profesor": "pizarra",
  "ingeniero": "planos",
  "abogado": "juicio",
  "bombero": "fuego",
  "policía": "patrulla",
  "cocinero": "cuchillo",
  "actor": "escena",
  "músico": "ritmo",
  "periodista": "preguntas",
  "enfermero": "cuidado",
  "arquitecto": "diseño",
  "piloto": "cabina",
  "fotógrafo": "lente",
  "programador": "código",
  "minecraft": "bloques",
  "fortnite": "battle",
  "fifa": "balón",
  "call of duty": "disparos",
  "among us": "traidor",
  "mario kart": "carreras",
  "roblox": "minijuegos",
  "zelda": "aventura",
  "gta": "ciudad",
  "clash royale": "cartas",
  "pokémon": "criaturas",
  "valorant": "táctico",
  "brawl stars": "brawler",
  "league of legends": "equipo",
  "tetris": "piezas",
  "animal crossing": "isla",
  "rocket league": "coche",
  "fall guys": "caídas",
  "the sims": "vida",
  "overwatch": "héroes",
  "harry potter": "magia",
  "star wars": "galaxia",
  "marvel": "héroes",
  "stranger things": "80s",
  "la casa de papel": "máscaras",
  "breaking bad": "química",
  "the simpsons": "familia",
  "friends": "sofá",
  "the witcher": "monstruos",
  "juego de tronos": "reinos",
  "shrek": "ogro",
  "frozen": "hielo",
  "toy story": "juguetes",
  "avatar": "azul",
  "titanic": "barco",
  "batman": "murciélago",
  "spiderman": "telaraña",
  "sherlock": "detective",
  "one piece": "piratas",
  "narcos": "cartel",
  "cepillo de dientes": "baño",
  "mando": "tele",
  "cargador": "batería",
  "llaves": "cerradura",
  "auriculares": "música",
  "botella": "agua",
  "mochila": "espalda",
  "reloj": "hora",
  "gafas": "ver",
  "paraguas": "lluvia",
  "sartén": "metal",
  "cuchillo": "corte",
  "silla": "sentarse",
  "mesa": "superficie",
  "almohada": "dormir",
  "linterna": "oscuro",
  "calculadora": "números",
  "pelota": "rebote",
  "cuaderno": "páginas",
  "bolígrafo": "tinta",
  "wifi": "red",
  "bluetooth": "sin cables",
  "ratón": "click",
  "teclado": "teclas",
  "pantalla": "brillo",
  "app": "icono",
  "nube": "internet",
  "robot": "máquina",
  "dron": "vuelo",
  "cámara": "foto",
  "gps": "mapa",
  "usb": "pincho",
  "batería": "ritmo",
  "chip": "circuito",
  "servidor": "datos",
  "router": "casa",
  "streaming": "directo",
  "ia": "aprende",
  "código": "símbolos",
  "memoria": "guardar",
  "guitarra": "cuerdas",
  "piano": "teclas",
  "concierto": "escenario",
  "rap": "rimas",
  "rock": "guitarras",
  "reggaetón": "baile",
  "pop": "radio",
  "dj": "mezcla",
  "micrófono": "voz",
  "altavoz": "volumen",
  "playlist": "lista",
  "estribillo": "repetir",
  "ritmo": "pulso",
  "melodía": "tararear",
  "acorde": "sonido",
  "karaoke": "cantar",
  "festival": "multitud",
  "vinilo": "disco"
} ,
  hard: {
  "pizza": "mesa",
  "hamburguesa": "manos",
  "tacos": "doblar",
  "kebab": "noche",
  "burrito": "envolver",
  "nachos": "compartir",
  "hot dog": "rápido",
  "sushi": "palillos",
  "ramen": "vapor",
  "arepa": "plancha",
  "empanada": "morder",
  "donut": "agujero",
  "helado": "verano",
  "croissant": "mañana",
  "paella": "reunión",
  "perro": "casa",
  "gato": "sofá",
  "caballo": "campo",
  "vaca": "prado",
  "oveja": "grupo",
  "león": "mirada",
  "tigre": "pasos",
  "jirafa": "arriba",
  "elefante": "grande",
  "mono": "ruido",
  "delfín": "salto",
  "tiburón": "profundo",
  "águila": "viento",
  "pingüino": "negro",
  "cocodrilo": "largo",
  "españa": "sol",
  "francia": "elegante",
  "italia": "ruinas",
  "portugal": "atlántico",
  "alemania": "orden",
  "méxico": "color",
  "argentina": "sur",
  "colombia": "montaña",
  "japón": "tren",
  "china": "rojo",
  "brasil": "playa",
  "chile": "largo",
  "canadá": "hoja",
  "australia": "lejos",
  "marruecos": "mercado",
  "fútbol": "gritos",
  "baloncesto": "alto",
  "tenis": "silencio",
  "voleibol": "arriba",
  "natación": "largo",
  "atletismo": "salida",
  "ciclismo": "ruta",
  "gimnasia": "equilibrio",
  "boxeo": "cara",
  "golf": "lejos",
  "rugby": "barro",
  "esquí": "frío",
  "surf": "esperar",
  "pádel": "dobles",
  "hockey": "veloz",
  "médico": "turno",
  "profesor": "tarea",
  "ingeniero": "medir",
  "abogado": "palabras",
  "bombero": "alarma",
  "policía": "calle",
  "cocinero": "prisa",
  "actor": "miradas",
  "músico": "sonido",
  "periodista": "nota",
  "enfermero": "guantes",
  "arquitecto": "líneas",
  "piloto": "altitud",
  "fotógrafo": "flash",
  "programador": "pantalla",
  "minecraft": "pico",
  "fortnite": "tormenta",
  "fifa": "martes",
  "call of duty": "ruido",
  "among us": "mirar",
  "mario kart": "plátano",
  "roblox": "crear",
  "zelda": "verde",
  "gta": "escapar",
  "clash royale": "torre",
  "pokémon": "capturar",
  "valorant": "ángulo",
  "brawl stars": "rápido",
  "league of legends": "línea",
  "tetris": "encajar",
  "animal crossing": "relax",
  "rocket league": "rebote",
  "fall guys": "color",
  "the sims": "casa",
  "overwatch": "carga",
  "harry potter": "cicatriz",
  "star wars": "zumbido",
  "marvel": "traje",
  "stranger things": "bicis",
  "la casa de papel": "rojo",
  "breaking bad": "caravana",
  "the simpsons": "amarillo",
  "friends": "café",
  "the witcher": "medallón",
  "juego de tronos": "invierno",
  "shrek": "pantano",
  "frozen": "cantar",
  "toy story": "cuerda",
  "avatar": "selva",
  "titanic": "frío",
  "batman": "noche",
  "spiderman": "pared",
  "sherlock": "pipa",
  "one piece": "sombrero",
  "narcos": "lluvia",
  "cepillo de dientes": "mañana",
  "mando": "botón",
  "cargador": "cable",
  "llaves": "bolsillo",
  "auriculares": "cerca",
  "botella": "tapar",
  "mochila": "llevar",
  "reloj": "tarde",
  "gafas": "limpiar",
  "paraguas": "abrir",
  "sartén": "caliente",
  "cuchillo": "cocina",
  "silla": "pausa",
  "mesa": "debajo",
  "almohada": "blando",
  "linterna": "buscar",
  "calculadora": "igual",
  "pelota": "correr",
  "cuaderno": "apuntar",
  "bolígrafo": "firmar",
  "wifi": "aire",
  "bluetooth": "corto",
  "ratón": "mano",
  "teclado": "ruido",
  "pantalla": "mirar",
  "app": "toque",
  "nube": "subir",
  "robot": "solo",
  "dron": "alto",
  "cámara": "ojo",
  "gps": "ruta",
  "usb": "puerto",
  "batería": "golpe",
  "chip": "pequeño",
  "servidor": "sala",
  "router": "luces",
  "streaming": "ver",
  "ia": "preguntar",
  "código": "error",
  "memoria": "antes",
  "guitarra": "madera",
  "piano": "blanco",
  "concierto": "luces",
  "rap": "rápido",
  "rock": "fuerte",
  "reggaetón": "calor",
  "pop": "pegarse",
  "dj": "noche",
  "micrófono": "cerca",
  "altavoz": "vibrar",
  "playlist": "seguir",
  "estribillo": "otra vez",
  "ritmo": "pasos",
  "melodía": "recuerdo",
  "acorde": "juntos",
  "karaoke": "pantalla",
  "festival": "verano",
  "vinilo": "girar"
}
};



function uid(){
  return Math.random().toString(36).slice(2,10);
}

function migrateV1toV2(v1obj){
  const out = [];
  for(const [name, words] of Object.entries(v1obj || {})){
    out.push({ id: uid(), name, category: "Personal", words: Array.isArray(words)? words : [], custom: true });
  }
  return out;
}

function loadAllLists(){
  // Prefer v2
  try{
    const raw2 = localStorage.getItem(LS_KEY_V2);
    if(raw2){
      const parsed = JSON.parse(raw2);
      if(Array.isArray(parsed) && parsed.length) return parsed;
    }
  }catch(e){}

  // Migrate from v1 if exists
  try{
    const raw1 = localStorage.getItem(LS_KEY_V1);
    if(raw1){
      const parsed1 = JSON.parse(raw1);
      const migrated = migrateV1toV2(parsed1);
      const initial = [...PRESETS.map(p => ({ id: uid(), name: p.name, category: p.category, words: p.words, custom: false })), ...migrated];
      localStorage.setItem(LS_KEY_V2, JSON.stringify(initial));
      return initial;
    }
  }catch(e){}

  // Fresh install: presets
  const initial = PRESETS.map(p => ({ id: uid(), name: p.name, category: p.category, words: p.words, custom: false }));
  localStorage.setItem(LS_KEY_V2, JSON.stringify(initial));
  return initial;
}

function saveAllLists(lists){
  localStorage.setItem(LS_KEY_V2, JSON.stringify(lists));
}

function getCategories(lists){
  const set = new Set(["Todas"]);
  lists.forEach(l => set.add(l.category || "Sin categoría"));
  return Array.from(set);
}

function listLabel(l){
  return `${l.category || "Sin categoría"} · ${l.name}`;
}

function findListById(lists, id){
  return lists.find(l => l.id === id) || null;
}

function filterListsByCategory(lists, cat){
  if(!cat || cat === "Todas") return lists;
  return lists.filter(l => (l.category || "Sin categoría") === cat);
}

function normalizeWords(text){
  return (text || "")
    .split(/\r?\n/)
    .map(w => w.trim())
    .filter(Boolean)
    .map(w => w.replace(/\s+/g," "))
    .slice(0, 500);
}

function wordsToText(words){
  return (words || []).join("\n");
}

// ----- IA (vía webhook n8n) -----
function getAiWebhookUrl(){
  // 1) Permite override por query param: ?webhook=https://...
  try{
    const qp = new URLSearchParams(location.search);
    const fromQuery = (qp.get("webhook") || "").trim();
    if(fromQuery){
      try{ localStorage.setItem(LS_AI_WEBHOOK, fromQuery); }catch{}
      return fromQuery;
    }
  }catch{}

  // 2) Si existe guardado en este navegador, se usa.
  try{
    const u = (localStorage.getItem(LS_AI_WEBHOOK) || "").trim();
    if(u) return u;
  }catch{}

  // 3) Si no, usamos el webhook por defecto (hardcoded, oculto en UI).
  return DEFAULT_AI_WEBHOOK;
}
function setAiWebhookUrl(url){
  try{ localStorage.setItem(LS_AI_WEBHOOK, (url||"").trim()); }catch(e){}
}

async function generateHintsViaWebhook({ words, lang="es", easyCount=5, hardCount=5 }){
  const url = getAiWebhookUrl();
  if(!url) throw new Error("NO_WEBHOOK");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang, words, easyCount, hardCount })
  });
  if(!res.ok){
    const txt = await res.text().catch(()=>"");
    throw new Error(`WEBHOOK_${res.status}:${txt}`);
  }
  return await res.json();
}

// UI: refresca selectores (Mis palabras / Setup)
function refreshListSelectors(){
  const lists = loadAllLists();

  // categories
  const cats = getCategories(lists);
  const pickCat = $("pickCategory");
  if(pickCat){
    const current = pickCat.value || "Todas";
    pickCat.innerHTML = "";
    cats.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      pickCat.appendChild(opt);
    });
    pickCat.value = cats.includes(current) ? current : "Todas";
  }

  const currentCat = ($("pickCategory") && $("pickCategory").value) ? $("pickCategory").value : "Todas";
  const visibleLists = filterListsByCategory(lists, currentCat);

  // datalist hints for categories
  const dl = $("categoryHints");
  if(dl){
    dl.innerHTML = "";
    cats.filter(c=>c!=="Todas").forEach(c=>{
      const opt=document.createElement("option");
      opt.value=c;
      dl.appendChild(opt);
    });
  }

  // Words screen selector
  const selSaved = $("savedLists");
  if(selSaved){
    const prev = selSaved.value;
    selSaved.innerHTML = "";
    lists.filter(l=>l.custom)
      .slice()
      .sort((a,b)=> listLabel(a).localeCompare(listLabel(b), "es"))
      .forEach(l=>{
        const opt=document.createElement("option");
        opt.value = l.id;
        opt.textContent = listLabel(l);
        selSaved.appendChild(opt);
      });
    const customLists = lists.filter(l=>l.custom);
    selSaved.value = (prev && findListById(customLists, prev)) ? prev : (customLists[0]?.id || "");
  }

  // Setup selector (filtered by category)
  const selPick = $("pickList");
  if(selPick){
    const prev = selPick.value;
    selPick.innerHTML = "";
    visibleLists
      .slice()
      .sort((a,b)=> listLabel(a).localeCompare(listLabel(b), "es"))
      .forEach(l=>{
        const opt=document.createElement("option");
        opt.value = l.id;
        opt.textContent = l.name;
        selPick.appendChild(opt);
      });
    // if previous not visible, fall back
    selPick.value = (prev && findListById(visibleLists, prev)) ? prev : (visibleLists[0]?.id || "");
  }

  updateHintVisibility();
  applyHintModeForCurrentList();
}

function isOfficialList(listObj){
  return !!(listObj && listObj.custom === false);
}

function updateHintVisibility(){
  const wrap = $("hintWrap");
  const sel = $("pickList");
  const hintSel = $("impostorHintMode");
  if(!wrap || !sel || !hintSel) return;

  const lists = loadAllLists();
  const listObj = findListById(lists, sel.value) || lists[0];
  const hasCustomHints = !!(listObj && listObj.custom === true && listObj.aiHints && typeof listObj.aiHints === "object" && Object.keys(listObj.aiHints).length);
  const show = isOfficialList(listObj) || hasCustomHints;

  wrap.hidden = !show;
  if(!show){
    hintSel.value = "off";
  }
}



function loadListIntoEditor(listId){
  const lists = loadAllLists();
  const customLists = lists.filter(l=>l.custom);
  const l = findListById(customLists, listId) || customLists[0];
  if(!l){
    $("listName").value = "";
    $("wordsBox").value = "";
    if($("savedLists")) $("savedLists").innerHTML = "";
    return;
  }
  $("listName").value = l.name || "";
  $("wordsBox").value = wordsToText(l.words || []);
  $("savedLists").value = l.id;
}
// ----- Game state -----
let game = null;

function pickRandom(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

function sampleUnique(n, max){
  // return n unique integers [0,max)
  const set = new Set();
  while(set.size < n){
    set.add(Math.floor(Math.random() * max));
  }
  return [...set];
}

function buildMascot(isImpostor, idx){
  // Mascota decorativa: NUNCA debe revelar el rol.
  const el = document.createElement("div");
  el.className = "cardMascot";
  const hat = document.createElement("div");
  hat.className = "hat";
  el.appendChild(hat);

  // Variación leve para que no sea siempre igual
  el.style.setProperty("--m-rot", `${((idx*17)%11)-5}deg`);
  el.style.setProperty("--m-bounce", `${(idx%4)*0.12}s`);
  return el;
}


// Insert keyframes for wobble (JS to avoid extra CSS)
(function addWobble(){
  const st = document.createElement("style");
  st.textContent = `
    @keyframes wobble{
      0%,100%{transform: rotate(-1deg) translateY(0)}
      50%{transform: rotate(1.2deg) translateY(-4px)}
    }
  `;
  document.head.appendChild(st);
})();

// ----- Confetti -----
const confettiCanvas = $("confetti");
const ctx = confettiCanvas.getContext("2d");
let confetti = [];
let confettiRAF = null;

function resizeConfetti(){
  confettiCanvas.width = window.innerWidth * devicePixelRatio;
  confettiCanvas.height = window.innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

function launchConfetti(){
  const w = window.innerWidth, h = window.innerHeight;
  confetti = [];
  for(let i=0;i<160;i++){
    confetti.push({
      x: Math.random()*w,
      y: -20 - Math.random()*h*0.2,
      vx: (Math.random()-0.5)*2.8,
      vy: 2.2 + Math.random()*3.2,
      r: 2 + Math.random()*4,
      rot: Math.random()*Math.PI*2,
      vr: (Math.random()-0.5)*0.2,
      life: 140 + Math.random()*80
    });
  }
  if(confettiRAF) cancelAnimationFrame(confettiRAF);
  tickConfetti();
}

function tickConfetti(){
  const w = window.innerWidth, h = window.innerHeight;
  ctx.clearRect(0,0,w,h);
  let alive = 0;

  for(const p of confetti){
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vy += 0.02; // gravity
    p.life -= 1;

    if(p.life > 0 && p.y < h + 30){
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      // no fixed colors: use grayscale-ish based on x for variety without specifying named colors
      const shade = 140 + Math.floor((p.x / w) * 80);
      ctx.fillStyle = `rgba(${shade},${shade},${shade},0.85)`;
      ctx.fillRect(-p.r, -p.r, p.r*2.2, p.r*0.9);
      ctx.restore();
    }
  }

  if(alive > 0){
    confettiRAF = requestAnimationFrame(tickConfetti);
  }else{
    ctx.clearRect(0,0,w,h);
    confettiRAF = null;
  }
}

// ----- Timer (auto) -----
let timerTotal = 0;
let timerLeft = 0;
let timerInterval = null;

function fmtTime(sec){
  const m = Math.floor(sec/60);
  const s = sec%60;
  return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}

function stopDebateTimer(){
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function setDebateTimerVisible(isVisible){
  const card = $("debateTimerCard");
  if(card) card.hidden = !isVisible;
}

function renderDebateTimer(sec){
  const el = $("debateTimerValue");
  if(el) el.textContent = fmtTime(Math.max(0, sec));
}

function startDebateTimerAuto(){
  stopDebateTimer();
  if(timerTotal <= 0){
    setDebateTimerVisible(false);
    return;
  }
  timerLeft = timerTotal;
  setDebateTimerVisible(true);
  renderDebateTimer(timerLeft);

  timerInterval = setInterval(()=>{
    timerLeft -= 1;
    renderDebateTimer(timerLeft);
    if(timerLeft <= 0){
      stopDebateTimer();
      launchConfetti();
    }
  }, 1000);
}

// ----- Reveal logic -----

let currentPlayer = 1;
let hasRevealedCurrent = false;

function prepareGame(){
  const lists = loadAllLists();

  const players = clamp(parseInt($("numPlayers").value,10) || 5, 3, 10);
  const impostors = clamp(parseInt($("numImpostors").value,10) || 1, 1, Math.min(3, players-1));

  const listId = $("pickList").value;
  const listObj = findListById(lists, listId) || lists[0];
  const words = (listObj?.words || []).slice();

  if(words.length < 2){
    alert("La lista necesita al menos 2 palabras.");
    return null;
  }

  const secretWord = pickRandom(words);
  const impostorIdxs = sampleUnique(impostors, players).map(x => x + 1).sort((a,b)=>a-b);

  timerTotal = parseInt($("debateTimer").value, 10) || 0;

  const hintMode = $("impostorHintMode") ? $("impostorHintMode").value : "off";
  const official = isOfficialList(listObj);
  const hasCustomHints = !!(listObj && listObj.custom === true && listObj.aiHints && typeof listObj.aiHints === "object" && Object.keys(listObj.aiHints).length);
  const finalHintMode = (official || hasCustomHints) ? hintMode : "off";


  const names = getPlayerNames(players);
  // El que empieza se elige aleatorio entre jugadores
  const starterIdx = Math.floor(Math.random() * names.length);
  const starter = names[starterIdx] || `Jugador ${starterIdx+1}`;

  return {
    players,
    names,
    starter,
    impostors,
    secretWord,
    impostorIdxs,
    listOfficial: official,
    listHasCustomHints: hasCustomHints,
    listAiHints: (hasCustomHints ? listObj.aiHints : null),
    hintMode: finalHintMode,
    listId: listObj?.id || "",
    listName: listObj ? listLabel(listObj) : ""
  };
}



function normWord(w){
  return (w||"").toString().trim().toLowerCase();
}

function getOfficialHint(word, difficulty){
  const key = normWord(word);
  const bank = OFFICIAL_HINTS[difficulty] || null;
  return bank ? (bank[key] || "") : "";
}

function clamp(x, a, b){
  return Math.min(b, Math.max(a, x));
}

function getPlayerNames(players){
  const names = [];
  for(let i=1;i<=players;i++){
    const el = document.getElementById(`playerName_${i}`);
    const v = (el && el.value ? el.value : "").trim();
    names.push(v || `Jugador ${i}`);
  }
  return names;
}

function renderPlayerNameInputs(players){
  const wrap = document.getElementById("namesWrap");
  if(!wrap) return;
  wrap.innerHTML = "";
  for(let i=1;i<=players;i++){
    const div = document.createElement("div");
    div.className = "label";
    div.innerHTML = `
      <span class="miniLabel">Jugador ${i}</span>
      <input id="playerName_${i}" class="input" maxlength="18" placeholder="Nombre" value="Jugador ${i}" />
    `;
    wrap.appendChild(div);
  }
}

function startRevealFlow(){
  game = prepareGame();
  if(!game) return;

  currentPlayer = 1;
  stopDebateTimer();
  setDebateTimerVisible(false);
  showRevealForPlayer(currentPlayer);
  showScreen("reveal");
}

function showRevealForPlayer(playerNum){
  const name = (game?.names?.[playerNum-1] || `Jugador ${playerNum}`);

  // Header + progreso
  $("revealHeader").textContent = `Turno de ${name}`;
  $("revealSub").textContent = "Toca la carta para ver tu rol";

  const pText = $("progressText");
  const pPct = $("progressPct");
  const pFill = $("progressFill");
  const pct = Math.round((playerNum / game.players) * 100);

  if(pText) pText.textContent = `Jugador ${playerNum} de ${game.players}`;
  if(pPct) pPct.textContent = `${pct}%`;
  if(pFill) pFill.style.width = `${pct}%`;

  // Secreto (se rellena SOLO al revelar para evitar spoilers)
  const isImp = game.impostorIdxs.includes(playerNum);
  const hintMode = game.hintMode || "off";
  const title = isImp ? "Tu rol" : "Tu palabra";
  const value = isImp ? "Eres el impostor" : game.secretWord;

  // Pistas (solo para listas oficiales)
  let extraHtml = "";
  if(isImp && hintMode !== "off" && (game.listOfficial || game.listHasCustomHints)){
    let hintText = "";

    // 1) Oficiales (banco incluido)
    if(game.listOfficial){
      hintText = getOfficialHint(game.secretWord, hintMode) || "";
    }

    // 2) Listas personalizadas (pistas guardadas en localStorage)
    if(!hintText && game.listHasCustomHints && game.listAiHints){
      // Buscar por clave normalizada (y mantener fallback por compatibilidad)
      const entry = game.listAiHints[normWord(game.secretWord)] || game.listAiHints[String(game.secretWord||"")] || null;
      const pool = (hintMode === "hard") ? (entry?.hard || []) : (entry?.easy || []);
      if(Array.isArray(pool) && pool.length){
        hintText = String(pool[Math.floor(Math.random()*pool.length)] || "").trim();
      }
    }

    // 3) Fallback (si no hay pistas para esa palabra)
    if(hintText){
      extraHtml = `<strong>Pista:</strong> ${escapeHtml(hintText)}.`;
    }else{
      const w = String(game.secretWord || "");
      const first = w ? w[0].toUpperCase() : "?";
      const len = w ? w.length : 0;
      extraHtml = (hintMode === "easy")
        ? `<strong>Pista:</strong> empieza por <strong>${first}</strong> y tiene <strong>${len}</strong> letras.`
        : `<strong>Pista:</strong> piensa en algo relacionado con <strong>${first}</strong>.`;
    }
  }

  pendingSecret = { title, value, extraHtml, isImpostor: isImp };

  // UI: oculto por defecto
  setRevealBackground();
  hideSecretUI();

  // Botón siguiente
  hasRevealedCurrent = false;
  $("btnNextPlayer").disabled = true;

  if(playerNum < game.players){
    const nextName = (game?.names?.[playerNum] || `Jugador ${playerNum+1}`);
    $("btnNextPlayer").textContent = `Pasar a ${nextName}`;
  }else{
    $("btnNextPlayer").textContent = "Empezar debate";
  }
}


// Reveal click (anti-spoiler)
// El secreto NO aparece hasta que el jugador toca la carta.
const secretBox = $("secretBox");
const revealImg = $("revealImg");

// Fondos aleatorios (sin repetirse hasta agotar la lista)
// (Se mantienen los fondos originales en /assets)
const REVEAL_IMAGES = [
  "assets/reveal_bg.png",
  "assets/reveal_alt1.png",
  "assets/reveal_alt3.png",
  "assets/reveal_alt4.png",
  "assets/reveal_alt5.png",
  "assets/reveal_alt6.png",
  "assets/reveal_alt7.png",
];

// "Bolsa" de imágenes para no repetir hasta agotar
let revealBag = [];

function shuffleArray(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function nextRevealImage(){
  if(revealBag.length === 0){
    revealBag = shuffleArray([...REVEAL_IMAGES]);
  }
  return revealBag.pop();
}

let pendingSecret = { title: "", value: "", extraHtml: "", isImpostor: false };
let isSecretShown = false;

function setRevealBackground(){
  if(!revealImg) return;
  revealImg.src = nextRevealImage();
}

function hideSecretUI(){
  isSecretShown = false;
  if(secretBox) secretBox.classList.add("hidden");
  $("secretTitle").textContent = "";
  $("secretValue").textContent = "";
  $("secretValue").classList.remove("impostor");
  const extra = $("secretExtra");
  if(extra){ extra.hidden = true; extra.innerHTML = ""; }

  const hint = $("tapHint");
  if(hint) hint.classList.remove("hidden");

  const note = $("revealFootNote");
  if(note) note.textContent = "Primero revela tu carta para ver tu rol.";
}

function showSecretUI(){
  isSecretShown = true;
  if(secretBox) secretBox.classList.remove("hidden");
  $("secretTitle").textContent = pendingSecret.title;
  $("secretValue").textContent = pendingSecret.value;

  if(pendingSecret.isImpostor){
    $("secretValue").classList.add("impostor");
  }else{
    $("secretValue").classList.remove("impostor");
  }

  const extra = $("secretExtra");
  if(extra){
    if(pendingSecret.extraHtml){
      extra.hidden = false;
      extra.innerHTML = pendingSecret.extraHtml;
    }else{
      extra.hidden = true;
      extra.innerHTML = "";
    }
  }

  const hint = $("tapHint");
  if(hint) hint.classList.add("hidden");

  hasRevealedCurrent = true;
  $("btnNextPlayer").disabled = false;

  const note = $("revealFootNote");
  if(note) note.textContent = "Listo. Pasa el móvil al siguiente jugador.";
}

// Tocar la carta para revelar
const revealArea = $("revealArea");
if(revealArea){
  const handler = (ev)=>{
    if(!game) return;
    if(!isSecretShown) showSecretUI();
  };
  revealArea.addEventListener("click", handler);
  revealArea.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      handler();
    }
  });
}

// Next player

$("btnNextPlayer").addEventListener("click", ()=>{
  if(!game) return;
  // Oculta el secreto antes de pasar el móvil
  hideSecretUI();
  if(currentPlayer < game.players){
    currentPlayer++;
    showRevealForPlayer(currentPlayer);
  }else{
    // end
    $("endWord").textContent = game.secretWord;
    const impNames = game.impostorIdxs.map(n => game.names?.[n-1] || `Jugador ${n}`);
    $("endImpostors").textContent = impNames.join(", ");
    $("startPlayer").textContent = game.starter || (game.names?.[0] || "Jugador 1");
    showScreen("end");
    startDebateTimerAuto();
  }
});

// Abort
$("btnAbort").addEventListener("click", ()=>{
  if(confirm("¿Salir de la partida? Se perderá el reparto actual.")){
    game = null;
    stopDebateTimer();
    setDebateTimerVisible(false);
    showScreen("setup");
  }
});

// Timer

// ----- Navigation buttons -----
$("btnGoSetup").addEventListener("click", ()=>{ refreshListSelectors(); onPlayersChanged(); showScreen("setup"); });
$("btnGoWords").addEventListener("click", ()=>{ refreshListSelectors(); loadListIntoEditor($("savedLists").value); showScreen("words"); });

$("btnBackFromWords").addEventListener("click", ()=> showScreen("setup"));
$("btnBackFromSetup").addEventListener("click", ()=> showScreen("home"));
$("btnGoWordsFromSetup").addEventListener("click", ()=>{
  refreshListSelectors();
  updateHintVisibility();
  loadListIntoEditor($("savedLists").value);
  showScreen("words");
});

$("btnStart").addEventListener("click", startRevealFlow);
// ----- Pistas: visibilidad y persistencia por lista -----
function getSavedHintMode(listId){
  try{ return localStorage.getItem(LS_HINT_MODE_PREFIX + String(listId||"")) || ""; }
  catch{ return ""; }
}

function setSavedHintMode(listId, mode){
  try{ localStorage.setItem(LS_HINT_MODE_PREFIX + String(listId||""), String(mode||"off")); }
  catch{}
}

function applyHintModeForCurrentList(){
  const sel = $("pickList");
  const hintSel = $("impostorHintMode");
  if(!sel || !hintSel) return;
  const saved = getSavedHintMode(sel.value);
  if(saved){
    hintSel.value = saved;
  }
}

// Mostrar/ocultar selector de pistas según lista
$("pickList").addEventListener("change", ()=>{
  updateHintVisibility();
  applyHintModeForCurrentList();
});

if($("impostorHintMode")){
  $("impostorHintMode").addEventListener("change", ()=>{
    const sel = $("pickList");
    if(!sel) return;
    setSavedHintMode(sel.value, $("impostorHintMode").value);
  });
}

const onPlayersChanged = ()=>{
  const p = clamp(parseInt($("numPlayers").value,10) || 5, 3, 10);
  $("numPlayers").value = String(p);
  // Ajustar máximo de impostores según jugadores
  const impEl = $("numImpostors");
  const maxImp = Math.min(3, p-1);
  impEl.max = String(maxImp);
  const curImp = clamp(parseInt(impEl.value,10) || 1, 1, maxImp);
  impEl.value = String(curImp);
  renderPlayerNameInputs(p);
};

$("numPlayers").addEventListener("change", onPlayersChanged);
$("numPlayers").addEventListener("input", onPlayersChanged);
$("numImpostors").addEventListener("change", onPlayersChanged);

$("btnNewGame").addEventListener("click", ()=>{
  refreshListSelectors();
  stopDebateTimer();
  setDebateTimerVisible(false);
  showScreen("setup");
});
$("btnGoHome").addEventListener("click", ()=> showScreen("home"));

// ----- Words editor -----
// El webhook está oculto (hardcoded o vía ?webhook=...) y no se muestra en la interfaz.

async function onGenerateHintsClick(){
  const st = $("aiStatus");
  const url = getAiWebhookUrl();
  if(!url){
    alert("No hay webhook configurado para generar pistas.");
    return;
  }

  const lists = loadAllLists();
  const listId = $("savedLists").value;
  const listObj = findListById(lists, listId);
  if(!listObj || !listObj.custom){
    alert("Generar pistas solo funciona en tus listas (no en las incluidas).\n\nCrea o guarda una lista tuya primero.");
    return;
  }

  // Usar lo que hay en el textarea (por si está editando)
  const words = normalizeWords($("wordsBox").value || "");
  if(words.length < 2){
    alert("Pon al menos 2 palabras para generar pistas.");
    return;
  }

  if(st) st.textContent = "Generando pistas…";
  $("btnGenHints").disabled = true;

  try{
    const data = await generateHintsViaWebhook({ words, lang: "es", easyCount: 5, hardCount: 5 });
    const items = Array.isArray(data?.items) ? data.items : [];
    // Normalizamos claves para que coincidan aunque el webhook devuelva
    // palabras con distinta capitalización/espacios.
    const map = new Map(
      items
        .filter(Boolean)
        .map(x => [normWord(String(x.word || "")), x])
        .filter(([k]) => !!k)
    );

    // Guardar en la lista (aiHints: { word: {easy:[], hard:[]} })
    listObj.words = words;
    listObj.aiHints = listObj.aiHints && typeof listObj.aiHints === "object" ? listObj.aiHints : {};
    for(const w of words){
      const key = normWord(w);
      const x = map.get(key);
      if(x){
        // Guardamos por clave normalizada para que luego el juego pueda
        // encontrar la pista aunque el usuario escriba "Juan" vs "juan".
        listObj.aiHints[key] = {
          easy: Array.isArray(x.easy) ? x.easy.slice(0,10) : [],
          hard: Array.isArray(x.hard) ? x.hard.slice(0,10) : []
        };
      }
    }
    saveAllLists(lists);
    refreshListSelectors();

    if(st) st.textContent = "Pistas generadas y guardadas ✅";
  }catch(e){
    console.error(e);
    if(String(e?.message||"").includes("NO_WEBHOOK")){
      alert("Falta el webhook de n8n.");
    }else{
      alert("No se pudieron generar las pistas.\n\nAsegúrate de que tu webhook responde con JSON en formato { items: [...] }.");
    }
    if(st) st.textContent = "";
  }finally{
    $("btnGenHints").disabled = false;
  }
}

if($("btnGenHints")) $("btnGenHints").addEventListener("click", onGenerateHintsClick);

$("btnFillExample").addEventListener("click", ()=>{
  const p = PRESETS[0];
  $("listName").value = "Mi lista";
  $("wordsBox").value = wordsToText(p.words);
});

$("btnSaveList").addEventListener("click", ()=>{
  const name = ($("listName").value || "").trim();
  const category = "Mis listas";
  const words = normalizeWords($("wordsBox").value || "");
  if(!name){
    alert("Pon un nombre a la lista.");
    return;
  }
  if(words.length < 2){
    alert("Pon al menos 2 palabras.");
    return;
  }

  const lists = loadAllLists();
  const selectedId = $("savedLists").value;
  const selected = findListById(lists, selectedId);

  // Si estás editando un preset, no lo sobreescribimos: creamos una copia
  if(selected && selected.custom === false){
    const copy = { id: uid(), name, category, words, custom: true };
    lists.push(copy);
    saveAllLists(lists);
    refreshListSelectors();
    $("savedLists").value = copy.id;
    $("pickList").value = copy.id;
    launchConfetti();
    alert("Lista guardada como copia ✅");
    return;
  }

  // Si editas una lista custom seleccionada, la actualizamos; si no hay seleccionada, creamos
  if(selected){
    selected.name = name;
    selected.category = category;
    selected.words = words;
    selected.custom = true;
    // Mantener pistas IA existentes solo para palabras que sigan en la lista
    if(selected.aiHints && typeof selected.aiHints === "object"){
      const keep = {};
      for(const w of words){
        // Las pistas IA pueden estar guardadas con clave normalizada (v3)
        // o con la palabra tal cual (versiones anteriores). Conservamos ambas.
        const k = normWord(w);
        if(selected.aiHints[k]) keep[k] = selected.aiHints[k];
        else if(selected.aiHints[w]) keep[w] = selected.aiHints[w];
      }
      selected.aiHints = keep;
    }
  }else{
    lists.push({ id: uid(), name, category, words, custom: true, aiHints: {} });
  }

  saveAllLists(lists);
  refreshListSelectors();

  // Seleccionar la lista recién guardada
  const latest = selected ? selected.id : lists[lists.length-1].id;
  $("savedLists").value = latest;
  $("pickList").value = latest;

  launchConfetti();
  alert("Lista guardada ✅");
});

$("btnLoadList").addEventListener("click", ()=>{
  const id = $("savedLists").value;
  if(!id) return;
  loadListIntoEditor(id);
});

$("btnDeleteList").addEventListener("click", ()=>{
  const id = $("savedLists").value;
  if(!id) return;
  const lists = loadAllLists();
  const l = findListById(lists, id);
  if(!l) return;

  if(l.custom === false){
    alert("No puedes borrar una lista incluida. (Puedes copiarla y editar la copia).");
    return;
  }
  if(confirm(`¿Borrar la lista “${l.name}”?`)){
    const next = lists.filter(x => x.id !== id);
    saveAllLists(next);
    refreshListSelectors();
    loadListIntoEditor($("savedLists").value);
  }
});

// Update editor when selecting saved list
$("savedLists").addEventListener("change", ()=>{
  loadListIntoEditor($("savedLists").value);
});

// Setup: cambia listas al cambiar categoría

// ----- Help modal -----
const helpModal = $("helpModal");
function openHelp(){ helpModal.showModal(); }
function closeHelp(){ helpModal.close(); }
$("btnHelp").addEventListener("click", openHelp);
$("btnCloseHelp").addEventListener("click", closeHelp);
$("btnCloseHelp2").addEventListener("click", closeHelp);

// ----- Initial boot -----
(function init(){
  // PWA: registrar service worker
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").catch(()=>{});
  }

  refreshListSelectors();

  // Valores iniciales
  $("numPlayers").value = "5";
  $("numImpostors").value = "1";
  onPlayersChanged();

  // En el editor, carga la primera lista personal si existe
  const lists = loadAllLists();
  const customFirst = lists.find(l=>l.custom);
  if(customFirst){
    loadListIntoEditor(customFirst.id);
  }else{
    $("listName").value = "";
    $("wordsBox").value = "";
  }

  showScreen("home");
})();
