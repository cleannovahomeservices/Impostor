// Impostor — Palabras Personalizadas
// Prototipo web (1 dispositivo). Sin backend.

const $ = (id) => document.getElementById(id);

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
}

function loadListIntoEditor(listId){
  const lists = loadAllLists();
  const customLists = lists.filter(l=>l.custom);
  const l = findListById(customLists, listId) || customLists[0];
  if(!l){
    $("listName").value = "";
    $("listCategory").value = "";
    $("wordsBox").value = "";
    if($("savedLists")) $("savedLists").innerHTML = "";
    return;
  }
  $("listName").value = l.name || "";
  $("listCategory").value = l.category || "";
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
  const el = document.createElement("div");
  el.className = "cardMascot" + (isImpostor ? " imp" : "");
  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = isImpostor ? "IMPOSTOR" : "CIVIL";
  const hat = document.createElement("div");
  hat.className = "hat";
  el.appendChild(badge);
  el.appendChild(hat);

  // subtle wobble
  el.style.animation = `wobble ${1400 + idx*120}ms ease-in-out infinite`;
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

// ----- Timer -----
let timerTotal = 0;
let timerLeft = 0;
let timerInterval = null;


function fmtTime(sec){
  const m = Math.floor(sec/60);
  const s = sec%60;
  return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}
function resetTimer(){
  clearInterval(timerInterval);
  timerInterval = null;
  timerLeft = timerTotal;
  $("timer").textContent = fmtTime(timerLeft);
  $("btnTimer").textContent = "Iniciar";
}
function startStopTimer(){
  if(timerTotal <= 0) return;
  if(timerInterval){
    clearInterval(timerInterval);
    timerInterval = null;
    $("btnTimer").textContent = "Reanudar";
    return;
  }
  $("btnTimer").textContent = "Pausar";
  timerInterval = setInterval(()=>{
    timerLeft -= 1;
    $("timer").textContent = fmtTime(Math.max(0,timerLeft));
    if(timerLeft <= 0){
      clearInterval(timerInterval);
      timerInterval = null;
      $("btnTimer").textContent = "Terminado";
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

  const names = getPlayerNames(players);
const starter = pickRandom(names);

return {
    players,
    names,
    starter,
    impostors,
    secretWord,
    impostorIdxs,
    listId: listObj?.id || "",
    listName: listObj ? listLabel(listObj) : ""
  };
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
  resetTimerUI();
  showRevealForPlayer(currentPlayer);
  showScreen("reveal");
}

function resetTimerUI(){
  const wrap = $("timerWrap");
  if(timerTotal > 0){
    wrap.hidden = false;
    resetTimer();
  }else{
    wrap.hidden = true;
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function showRevealForPlayer(playerNum){
  $("revealHeader").textContent = game?.names?.[playerNum-1] ? `${game.names[playerNum-1]}` : `Jugador ${playerNum}`;
  $("revealSub").textContent = "Pasa el móvil a este jugador. Mantén pulsado para revelar tu carta.";
  if(game?.names?.[playerNum-1]){
    $("revealSub").textContent = `Pasa el móvil a ${game.names[playerNum-1]}. Mantén pulsado para revelar tu carta.`;
  }

  // mascot
  const isImp = game.impostorIdxs.includes(playerNum);
  const holder = $("cardMascot");
  holder.innerHTML = "";
  holder.appendChild(buildMascot(isImp, playerNum));

  // secret box
  $("secretTitle").textContent = isImp ? "Tu rol" : "Tu palabra";
  $("secretValue").textContent = isImp ? "Eres el IMPOSTOR" : game.secretWord;

  // hidden by default
  $("secretBox").classList.add("blurred");
  $("secretBox").classList.remove("unblur");

  // next button
  hasRevealedCurrent = false;
  $("btnNextPlayer").disabled = true;
  $("btnNextPlayer").textContent = (playerNum < game.players) ? "Siguiente jugador" : "Terminar reparto";
}

// Press-and-hold reveal
const secretBox = $("secretBox");
let pressActive = false;
function pressOn(){
  pressActive = true;
  secretBox.classList.remove("blurred");
  secretBox.classList.add("unblur");
  hasRevealedCurrent = true;
  $("btnNextPlayer").disabled = false;
}

function pressOff(){
  pressActive = false;
  secretBox.classList.add("blurred");
  secretBox.classList.remove("unblur");
}
secretBox.addEventListener("pointerdown", (e)=>{
  e.preventDefault();
  secretBox.setPointerCapture(e.pointerId);
  pressOn();
});
secretBox.addEventListener("pointerup", (e)=>{
  e.preventDefault();
  pressOff();
});
secretBox.addEventListener("pointercancel", ()=>{
  pressOff();
});
secretBox.addEventListener("contextmenu", (e)=> e.preventDefault());

// Next player
$("btnNextPlayer").addEventListener("click", ()=>{
  if(!game) return;
  if(currentPlayer < game.players){
    currentPlayer++;
    showRevealForPlayer(currentPlayer);
  }else{
    // end
    $("endWord").textContent = game.secretWord;
    const impNames = game.impostorIdxs.map(n => game.names?.[n-1] || `Jugador ${n}`);
    $("endImpostors").textContent = impNames.join(", ");
    $("startPlayer").textContent = game.starter || (game.names?.[0] || "Jugador 1");
    launchConfetti();
    showScreen("end");
  }
});

// Abort
$("btnAbort").addEventListener("click", ()=>{
  if(confirm("¿Salir de la partida? Se perderá el reparto actual.")){
    game = null;
    showScreen("setup");
  }
});

// Timer
$("btnTimer").addEventListener("click", startStopTimer);

// ----- Navigation buttons -----
$("btnGoSetup").addEventListener("click", ()=>{ refreshListSelectors(); onPlayersChanged(); showScreen("setup"); });
$("btnGoWords").addEventListener("click", ()=>{ refreshListSelectors(); loadListIntoEditor($("savedLists").value); showScreen("words"); });

$("btnBackFromWords").addEventListener("click", ()=> showScreen("setup"));
$("btnBackFromSetup").addEventListener("click", ()=> showScreen("home"));
$("btnGoWordsFromSetup").addEventListener("click", ()=>{
  refreshListSelectors();
  loadListIntoEditor($("savedLists").value);
  showScreen("words");
});

$("btnStart").addEventListener("click", startRevealFlow);
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
  showScreen("setup");
});
$("btnGoHome").addEventListener("click", ()=> showScreen("home"));

// ----- Words editor -----
$("btnFillExample").addEventListener("click", ()=>{
  const p = PRESETS[0];
  $("listName").value = "Mi lista";
  $("listCategory").value = "Personal";
  $("wordsBox").value = wordsToText(p.words);
});

$("btnSaveList").addEventListener("click", ()=>{
  const name = ($("listName").value || "").trim();
  const category = ($("listCategory").value || "").trim() || "Personal";
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
  }else{
    lists.push({ id: uid(), name, category, words, custom: true });
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
    $("listCategory").value = "";
    $("wordsBox").value = "";
  }

  showScreen("home");
})();
