/* =========================================================================
   DATOS EDITABLES — rutina semanal, cumpleaños y accesos de biblioteca.
   Para cambiar un horario, agregar un cumpleaños o un link, editá acá abajo.
   No hace falta tocar nada debajo del bloque "LÓGICA" más adelante.
   ========================================================================= */
const DAY_COLORS = {
  lunes:    ['#FF7A3D', '#E8551C'],
  martes:   ['#3ADEC0', '#1FB39A'],
  miercoles:['#FFC145', '#E8A320'],
  jueves:   ['#3ADEC0', '#1FB39A'],
  viernes:  ['#8B6BFF', '#6A46E0'],
  sabado:   ['#FF4FA0', '#D6317F'],
  domingo:  ['#FF7A3D', '#8B6BFF'],
  cumples:  ['#FF4FA0', '#8B6BFF'],
  caminata: ['#2FD9C4', '#14B39E'],
  biblioteca: ['#A487F5', '#8360E8'],
};

const DATA = {
  lunes: { label:"Lunes", tag:"Escuela + caminata", weekend:false, blocks:[
    { title:"Mañana", emoji:"🌅", time:"6:00 – 12:30", items:[
      {t:"Despertar", e:"⏰"},
      {t:"Café / mate y desayuno", e:"☕"},
      {t:"Escuchar cuarteto de Euge Quevedo", e:"🎶"},
      {t:"Llevar a Lara a la escuela (8:00)", e:"🚗", special:true},
      {t:"Actividades / changas de la mañana", e:"🛠️"},
      {t:"Buscar a Lara (12:00)", e:"🚗", special:true},
    ]},
    { title:"Tarde", emoji:"☀️", time:"12:30 – 19:00", items:[
      {t:"Almorzar", e:"🍽️"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
      {t:"Tiempo libre / descanso", e:"😌"},
      {t:"Caminata (45 min)", e:"🚶‍♂️", special:true, walk:true},
    ]},
    { title:"Noche", emoji:"🌙", time:"19:00 – 23:00", items:[
      {t:"Ducharse", e:"🚿"},
      {t:"Cenar en familia", e:"🍲"},
      {t:"Escuchar cuarteto a la noche", e:"🎵"},
      {t:"Organizar el día siguiente", e:"📝"},
      {t:"Dormir", e:"🥱"},
    ]},
  ]},
  martes: { label:"Martes", tag:"Escuela", weekend:false, blocks:[
    { title:"Mañana", emoji:"🌅", time:"6:00 – 12:30", items:[
      {t:"Despertar", e:"⏰"},
      {t:"Café / mate y desayuno", e:"☕"},
      {t:"Llevar a Lara a la escuela (8:00)", e:"🚗", special:true},
      {t:"Actividades / changas de la mañana", e:"🛠️"},
      {t:"Buscar a Lara (12:00)", e:"🚗", special:true},
    ]},
    { title:"Tarde", emoji:"☀️", time:"12:30 – 19:00", items:[
      {t:"Almorzar", e:"🍽️"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
      {t:"Tiempo libre", e:"😌"},
    ]},
    { title:"Noche", emoji:"🌙", time:"19:00 – 23:00", items:[
      {t:"Ducharse", e:"🚿"},
      {t:"Cenar en familia", e:"🍲"},
      {t:"Escuchar música tranquilo", e:"🎧"},
      {t:"Dormir", e:"🥱"},
    ]},
  ]},
  miercoles: { label:"Miércoles", tag:"Escuela + caminata", weekend:false, blocks:[
    { title:"Mañana", emoji:"🌅", time:"6:00 – 12:30", items:[
      {t:"Despertar", e:"⏰"},
      {t:"Café / mate y desayuno", e:"☕"},
      {t:"Escuchar cuarteto de Euge Quevedo", e:"🎶"},
      {t:"Llevar a Lara a la escuela (8:00)", e:"🚗", special:true},
      {t:"Actividades / changas de la mañana", e:"🛠️"},
      {t:"Buscar a Lara (12:00)", e:"🚗", special:true},
    ]},
    { title:"Tarde", emoji:"☀️", time:"12:30 – 19:00", items:[
      {t:"Almorzar", e:"🍽️"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
      {t:"Tiempo libre / descanso", e:"😌"},
      {t:"Caminata (45 min)", e:"🚶‍♂️", special:true, walk:true},
    ]},
    { title:"Noche", emoji:"🌙", time:"19:00 – 23:00", items:[
      {t:"Ducharse", e:"🚿"},
      {t:"Cenar en familia", e:"🍲"},
      {t:"Escuchar cuarteto a la noche", e:"🎵"},
      {t:"Dormir", e:"🥱"},
    ]},
  ]},
  jueves: { label:"Jueves", tag:"Escuela", weekend:false, blocks:[
    { title:"Mañana", emoji:"🌅", time:"6:00 – 12:30", items:[
      {t:"Despertar", e:"⏰"},
      {t:"Café / mate y desayuno", e:"☕"},
      {t:"Llevar a Lara a la escuela (8:00)", e:"🚗", special:true},
      {t:"Actividades / changas de la mañana", e:"🛠️"},
      {t:"Buscar a Lara (12:00)", e:"🚗", special:true},
    ]},
    { title:"Tarde", emoji:"☀️", time:"12:30 – 19:00", items:[
      {t:"Almorzar", e:"🍽️"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
      {t:"Tiempo libre", e:"😌"},
    ]},
    { title:"Noche", emoji:"🌙", time:"19:00 – 23:00", items:[
      {t:"Ducharse", e:"🚿"},
      {t:"Cenar en familia", e:"🍲"},
      {t:"Escuchar música tranquilo", e:"🎧"},
      {t:"Dormir", e:"🥱"},
    ]},
  ]},
  viernes: { label:"Viernes", tag:"Escuela + caminata", weekend:false, blocks:[
    { title:"Mañana", emoji:"🌅", time:"6:00 – 12:30", items:[
      {t:"Despertar", e:"⏰"},
      {t:"Café / mate y desayuno", e:"☕"},
      {t:"Escuchar cuarteto de Euge Quevedo", e:"🎶"},
      {t:"Llevar a Lara a la escuela (8:00)", e:"🚗", special:true},
      {t:"Actividades / changas de la mañana", e:"🛠️"},
      {t:"Buscar a Lara (12:00)", e:"🚗", special:true},
    ]},
    { title:"Tarde", emoji:"☀️", time:"12:30 – 19:00", items:[
      {t:"Almorzar", e:"🍽️"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
      {t:"Caminata (45 min)", e:"🚶‍♂️", special:true, walk:true},
    ]},
    { title:"Noche", emoji:"🌙", time:"19:00 – 23:30", items:[
      {t:"Ducharse", e:"🚿"},
      {t:"Cenar en familia", e:"🍲"},
      {t:"Escuchar cuarteto a la noche", e:"🎵"},
      {t:"Arrancar el finde con buena onda", e:"🎉"},
      {t:"Dormir", e:"🥱"},
    ]},
  ]},
  sabado: { label:"Sábado", tag:"Fin de semana", weekend:true, blocks:[
    { title:"Mañana", emoji:"🌤️", time:"Libre", items:[
      {t:"Despertar sin apuro", e:"😴"},
      {t:"Desayuno tranquilo", e:"☕"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
      {t:"Mandados / changas", e:"🛠️"},
    ]},
    { title:"Tarde", emoji:"☀️", time:"Libre", items:[
      {t:"Almorzar", e:"🍽️"},
      {t:"Tiempo con la familia", e:"👨‍👧"},
      {t:"Escuchar cuarteto", e:"🎶"},
    ]},
    { title:"Noche", emoji:"🌙", time:"Libre", items:[
      {t:"Cenar", e:"🍲"},
      {t:"Salida o música en casa", e:"🎉"},
      {t:"Dormir", e:"🥱"},
    ]},
  ]},
  domingo: { label:"Domingo", tag:"Fin de semana", weekend:true, blocks:[
    { title:"Mañana", emoji:"🌤️", time:"Libre", items:[
      {t:"Despertar sin apuro", e:"😴"},
      {t:"Desayuno tranquilo", e:"☕"},
      {t:"Grupo de WhatsApp compra/venta (1h)", e:"💬", special:true, wa:true},
    ]},
    { title:"Tarde", emoji:"☀️", time:"Libre", items:[
      {t:"Almuerzo familiar", e:"🍽️"},
      {t:"Descanso", e:"😌"},
      {t:"Preparar la semana", e:"📝"},
    ]},
    { title:"Noche", emoji:"🌙", time:"Libre", items:[
      {t:"Cenar liviano", e:"🍲"},
      {t:"Dejar todo listo para el lunes", e:"🎒"},
      {t:"Dormir temprano", e:"🥱"},
    ]},
  ]},
};

const ORDER = ["lunes","martes","miercoles","jueves","viernes","sabado","domingo"];
const CHECK_STORAGE_KEY = 'veronica-checklist-state';

function loadCheckState(){
  const state = {};
  ORDER.forEach(k => state[k] = new Set());
  try{
    const raw = localStorage.getItem(CHECK_STORAGE_KEY);
    if (raw){
      const parsed = JSON.parse(raw);
      ORDER.forEach(k => { if (Array.isArray(parsed[k])) state[k] = new Set(parsed[k]); });
    }
  }catch(e){ console.error('No se pudo leer el estado del checklist', e); }
  return state;
}
function saveCheckState(){
  try{
    const plain = {};
    ORDER.forEach(k => plain[k] = [...state[k]]);
    localStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(plain));
  }catch(e){ console.error('No se pudo guardar el estado del checklist', e); }
}

const state = loadCheckState();

function todayKey(){
  const jsDay = new Date().getDay(); // 0=domingo..6=sabado
  return ORDER[(jsDay + 6) % 7];
}
let current = todayKey();

// ---- Cumpleaños (mismos datos que la rutina de Lara) ----
const CAT_COLOR = {
  "Familia":"#FF4FA0",
  "Hermano/a":"#FF7A3D",
  "Sobrino/a":"#3ADEC0",
  "Bisabuela":"#8B6BFF",
  "Abuela":"#8B6BFF",
  "Tío/a":"#FFC145",
  "Primo/a":"#3ADEC0",
};
const BIRTHDAYS = [
  {name:"Verónica", day:19, month:8, cat:"Familia"},
  {name:"Lara", day:21, month:8, cat:"Familia"},
  {name:"Papá", day:23, month:4, cat:"Familia"},
  {name:"Ton", day:12, month:5, cat:"Hermano/a"},
  {name:"Luján", day:8, month:12, cat:"Hermano/a"},
  {name:"Luz", day:1, month:12, cat:"Hermano/a"},
  {name:"Malena", day:2, month:8, cat:"Hermano/a"},
  {name:"Meli", day:25, month:11, cat:"Hermano/a"},
  {name:"Delfina", day:3, month:11, cat:"Hermano/a"},
  {name:"Yamila", day:30, month:12, cat:"Hermano/a"},
  {name:"Ignacio", day:11, month:2, cat:"Hermano/a"},
  {name:"Manu", day:1, month:4, cat:"Hermano/a"},
  {name:"Juliano", day:2, month:9, cat:"Hermano/a"},
  {name:"Mía", day:9, month:6, cat:"Sobrino/a"},
  {name:"Lucio", day:28, month:7, cat:"Sobrino/a"},
  {name:"Ema", day:10, month:7, cat:"Sobrino/a"},
  {name:"Julián", day:30, month:10, cat:"Sobrino/a"},
  {name:"Tomás", day:2, month:2, cat:"Sobrino/a"},
  {name:"Rafa", day:19, month:9, cat:"Sobrino/a"},
  {name:"Julieta", day:20, month:7, cat:"Sobrino/a"},
  {name:"Agustina", day:30, month:12, cat:"Sobrino/a"},
  {name:"María Lu", day:23, month:8, cat:"Sobrino/a"},
  {name:"Bisabuela Marta", day:25, month:11, cat:"Bisabuela"},
  {name:"Abuela Cristina", day:7, month:6, cat:"Abuela"},
  {name:"Mario", day:19, month:2, cat:"Tío/a"},
  {name:"Susana", day:17, month:10, cat:"Tío/a"},
  {name:"Esteban", day:17, month:2, cat:"Tío/a"},
  {name:"Noelia", day:27, month:6, cat:"Tío/a"},
  {name:"Betiana", day:31, month:1, cat:"Tío/a"},
  {name:"Cristian", day:3, month:7, cat:"Tío/a"},
  {name:"Mariana", day:27, month:10, cat:"Tío/a"},
  {name:"Ariel", day:14, month:8, cat:"Tío/a"},
  {name:"Manuel", day:22, month:9, cat:"Tío/a"},
  {name:"Daniela", day:5, month:8, cat:"Tío/a"},
  {name:"Natali", day:7, month:9, cat:"Tío/a"},
  {name:"Claudio", day:24, month:5, cat:"Tío/a"},
  {name:"Juan Cruz", day:18, month:3, cat:"Tío/a"},
  {name:"Luis", day:5, month:5, cat:"Tío/a"},
  {name:"Laura", day:21, month:4, cat:"Tío/a"},
  {name:"Maca", day:14, month:4, cat:"Tío/a"},
  {name:"Miguel", day:10, month:10, cat:"Tío/a"},
  {name:"Cande", day:17, month:10, cat:"Tío/a"},
  {name:"Facu", day:3, month:3, cat:"Primo/a"},
  {name:"Anita", day:28, month:8, cat:"Primo/a"},
  {name:"Camila", day:19, month:10, cat:"Primo/a"},
  {name:"Tati", day:14, month:6, cat:"Primo/a"},
  {name:"Matías", day:22, month:11, cat:"Primo/a"},
  {name:"Ignacio Cortez", day:8, month:5, cat:"Primo/a"},
  {name:"Mateo", day:29, month:1, cat:"Primo/a"},
  {name:"Yanet", day:1, month:8, cat:"Primo/a"},
  {name:"Francisco", day:8, month:1, cat:"Primo/a"},
  {name:"Lucrecia", day:1, month:9, cat:"Primo/a"},
  {name:"Lurdes", day:1, month:10, cat:"Primo/a"},
  {name:"Agustín", day:2, month:7, cat:"Primo/a"},
  {name:"Facundo", day:26, month:9, cat:"Primo/a"},
  {name:"Olivia", day:16, month:9, cat:"Primo/a"},
  {name:"Magalí", day:18, month:7, cat:"Primo/a"},
  {name:"Ingrí", day:14, month:5, cat:"Primo/a"},
  {name:"Emi", day:11, month:9, cat:"Primo/a"},
  {name:"Melina", day:3, month:3, cat:"Primo/a"},
  {name:"Thiago", day:17, month:12, cat:"Primo/a"},
  {name:"Felipe", day:22, month:9, cat:"Primo/a"},
  {name:"Valentín", day:30, month:5, cat:"Primo/a"},
  {name:"Gema", day:6, month:6, cat:"Primo/a"},
  {name:"Genaro", day:30, month:5, cat:"Primo/a"},
  {name:"Yobani", day:22, month:3, cat:"Primo/a"},
];
const MONTH_NAMES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
/* ========================== FIN DE DATOS EDITABLES =====================
   (La lista de accesos rápidos QUICK_LINKS de la Biblioteca también es
   editable y está más abajo, cerca de la sección "Biblioteca".)
   LÓGICA a partir de acá — no hace falta tocarla para editar contenido.
   ========================================================================= */

function daysUntilInfo(month, day){
  const today = new Date(); today.setHours(0,0,0,0);
  let year = today.getFullYear();
  let target = new Date(year, month-1, day); target.setHours(0,0,0,0);
  if (target < today) target = new Date(year+1, month-1, day);
  const diff = Math.round((target - today) / 86400000);
  return { diff, target };
}
function getSortedBirthdays(){
  return BIRTHDAYS.map(b => {
    const info = daysUntilInfo(b.month, b.day);
    return { ...b, diff: info.diff, targetMonth: info.target.getMonth() };
  }).sort((a,b) => a.diff - b.diff);
}

const TABS = [...ORDER, "caminata", "biblioteca", "cumples"];

function renderTabs(){
  const tabs = document.getElementById('tabs');
  tabs.innerHTML = '';
  TABS.forEach(key => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', key===current ? 'true' : 'false');
    btn.setAttribute('aria-controls', 'dayContent');
    const [c1, c2] = DAY_COLORS[key];
    if (key === 'cumples'){
      btn.className = 'tab bdaytab' + (key===current?' active':'');
      btn.textContent = '🎂 Cumples';
    } else if (key === 'caminata'){
      btn.className = 'tab walktab' + (key===current?' active':'');
      btn.textContent = '📍 Caminata';
    } else if (key === 'biblioteca'){
      btn.className = 'tab libtab' + (key===current?' active':'');
      btn.textContent = '🎵 Biblioteca';
    } else {
      const d = DATA[key];
      btn.className = 'tab' + (key===current?' active':'');
      btn.textContent = d.label.slice(0,3);
    }
    if (key===current){
      btn.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
      btn.style.color = '#fff';
    }
    btn.onclick = () => {
      current = key; renderTabs();
      if (current==='cumples') renderBirthdays();
      else if (current==='caminata') renderWalk();
      else if (current==='biblioteca') renderLibrary();
      else renderDay();
    };
    tabs.appendChild(btn);
  });
}

function renderBirthdays(){
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = '';
  const sorted = getSortedBirthdays();
  const next = sorted[0];
  const hero = document.createElement('div');
  hero.className = 'bday-hero';
  hero.style.background = `linear-gradient(120deg, #8B6BFF, #FF4FA0, #8B6BFF)`;
  const whenTxt = next.diff === 0 ? '¡Es hoy! 🎉' : (next.diff === 1 ? 'Es mañana' : `${MONTH_NAMES[next.targetMonth]} ${next.day}`);
  const countdownTxt = next.diff === 0 ? '¡No te olvides de saludar!' : (next.diff === 1 ? 'Faltan 1 día' : `Faltan ${next.diff} días`);
  hero.innerHTML = `
    <div class="eyebrow">Próximo cumpleaños</div>
    <div class="who">${next.name}</div>
    <div class="when">${whenTxt} · ${next.cat}</div>
    <div class="countdown">⏰ ${countdownTxt}</div>
  `;
  wrap.appendChild(hero);

  let lastMonth = null;
  sorted.forEach((b, i) => {
    if (b.targetMonth !== lastMonth){
      lastMonth = b.targetMonth;
      const mh = document.createElement('div');
      mh.className = 'month-header';
      mh.textContent = MONTH_NAMES[lastMonth];
      wrap.appendChild(mh);
    }
    const row = document.createElement('div');
    row.className = 'bday-item' + (b.diff===0?' today':'');
    row.style.animation = 'popIn .3s ease backwards';
    row.style.animationDelay = Math.min(i*0.02, 0.4) + 's';
    const color = CAT_COLOR[b.cat] || '#999';
    const daysTxt = b.diff===0 ? '¡Hoy! 🎂' : (b.diff===1 ? 'Mañana' : `en ${b.diff} días`);
    row.innerHTML = `
      <div class="bday-date">${b.day}</div>
      <div class="bday-info">
        <div class="bday-name">${b.name}</div>
        <span class="bday-tag" style="background:${color}">${b.cat}</span>
      </div>
      <div class="bday-days">${daysTxt}</div>
    `;
    wrap.appendChild(row);
  });
}

function totalItems(day){ return day.blocks.reduce((s,b)=>s+b.items.length,0); }

// ---- Caminata en vivo (GPS + mapa gratuito OpenStreetMap/Leaflet) ----
const STRIDE_M = 0.75; // largo de paso promedio para estimar pasos
const VEHICLE_SPEED_KMH = 8; // por encima de esto, se asume vehículo
const DEFAULT_CENTER = [-40.8135, -62.9967]; // Viedma, Río Negro (punto de partida por defecto)
const STORAGE_KEY = 'veronica-walks-history';

let walkMap = null, walkPolyline = null, walkMarker = null;
let walkWatchId = null, walkTracking = false;
let walkPath = [], walkStartTime = null, walkTimerInterval = null;
let walkHistory = [];
let walkCurrentMode = 'walking'; // 'walking' | 'vehicle'

function haversine(a, b){
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLng = (b.lng - a.lng) * Math.PI/180;
  const la1 = a.lat * Math.PI/180, la2 = b.lat * Math.PI/180;
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function formatDuration(ms){
  const totalSec = Math.floor(ms/1000);
  const m = Math.floor(totalSec/60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

async function loadWalkHistory(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    walkHistory = raw ? JSON.parse(raw) : [];
  }catch(e){ walkHistory = []; }
}

async function saveWalkHistory(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(walkHistory)); }
  catch(e){ console.error('No se pudo guardar el historial', e); }
}

function renderWalkHistory(){
  const histEl = document.getElementById('walkHistoryList');
  if (!histEl) return;
  if (!walkHistory.length){
    histEl.innerHTML = '<div class="walk-empty">Todavía no registraste ninguna caminata 🚶‍♀️</div>';
    return;
  }
  histEl.innerHTML = '';
  [...walkHistory].reverse().slice(0, 15).forEach(sess => {
    const row = document.createElement('div');
    row.className = 'walk-session' + (sess.mode==='vehicle' ? ' vehicle' : '');
    row.innerHTML = `
      <div class="icon">${sess.mode==='vehicle' ? '🚗' : '🚶‍♀️'}</div>
      <div class="info">
        <div class="date">${sess.dateLabel}</div>
        <div class="detail">${sess.distanceKm} km · ${sess.durationLabel} · ${sess.steps} pasos aprox.</div>
      </div>
    `;
    histEl.appendChild(row);
  });
}

function initWalkMap(){
  const el = document.getElementById('walkMap');
  if (!el || typeof L === 'undefined') return;
  walkMap = L.map(el, { zoomControl:true, attributionControl:true }).setView(DEFAULT_CENTER, 15);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(walkMap);
  walkPolyline = L.polyline([], { color:'#14B39E', weight:5 }).addTo(walkMap);
}

function updateWalkStatsUI(){
  const dist = walkPath.reduce((sum, p, i) => i===0 ? 0 : sum + haversine(walkPath[i-1], p), 0);
  const distKm = (dist/1000).toFixed(2);
  const elapsed = walkStartTime ? Date.now() - walkStartTime : 0;
  const steps = Math.round(dist / STRIDE_M);
  const paceMinPerKm = dist > 0 ? (elapsed/60000) / (dist/1000) : 0;

  const distEl = document.getElementById('walkDistance');
  const timeEl = document.getElementById('walkTime');
  const stepsEl = document.getElementById('walkSteps');
  const paceEl = document.getElementById('walkPace');
  if (distEl) distEl.textContent = distKm + ' km';
  if (timeEl) timeEl.textContent = formatDuration(elapsed);
  if (stepsEl) stepsEl.textContent = steps.toLocaleString('es-AR');
  if (paceEl) paceEl.textContent = (dist>0 && paceMinPerKm>0 && paceMinPerKm<60) ? paceMinPerKm.toFixed(1)+' min/km' : '--';

  // Detección de modo por velocidad sostenida (últimos puntos)
  const recent = walkPath.slice(-4);
  if (recent.length >= 2){
    const recentDist = haversine(recent[0], recent[recent.length-1]);
    const recentTimeH = (recent[recent.length-1].t - recent[0].t) / 3600000;
    const speedKmh = recentTimeH > 0 ? recentDist/1000/recentTimeH : 0;
    walkCurrentMode = speedKmh > VEHICLE_SPEED_KMH ? 'vehicle' : 'walking';
  }
  const modeEl = document.getElementById('walkModeBadge');
  if (modeEl){
    modeEl.className = 'walk-mode' + (walkCurrentMode==='vehicle' ? ' vehicle' : '');
    modeEl.textContent = walkCurrentMode==='vehicle' ? '🚗 Se detectó movimiento en vehículo' : '🚶‍♀️ Caminando';
  }

  return { distKm, elapsed, steps };
}

function startWalk(){
  if (!navigator.geolocation){
    alert('Este navegador no tiene acceso a GPS/ubicación.');
    return;
  }
  walkPath = [];
  walkStartTime = Date.now();
  walkTracking = true;
  if (walkPolyline) walkPolyline.setLatLngs([]);

  walkWatchId = navigator.geolocation.watchPosition((pos) => {
    const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, t: Date.now() };
    walkPath.push(p);
    if (walkMap){
      walkMap.setView([p.lat, p.lng], walkMap.getZoom() < 14 ? 16 : walkMap.getZoom());
      walkPolyline.addLatLng([p.lat, p.lng]);
      if (!walkMarker){
        walkMarker = L.circleMarker([p.lat, p.lng], { radius:7, color:'#fff', weight:2, fillColor:'#FF5FA8', fillOpacity:1 }).addTo(walkMap);
      } else {
        walkMarker.setLatLng([p.lat, p.lng]);
      }
    }
    updateWalkStatsUI();
  }, (err) => {
    console.error(err);
    alert('No pude acceder a la ubicación. Revisá los permisos del navegador.');
  }, { enableHighAccuracy:true, maximumAge:2000, timeout:10000 });

  walkTimerInterval = setInterval(updateWalkStatsUI, 1000);
  renderWalkControls();
}

async function stopWalk(){
  if (walkWatchId !== null) navigator.geolocation.clearWatch(walkWatchId);
  if (walkTimerInterval) clearInterval(walkTimerInterval);
  walkTracking = false;
  walkWatchId = null;

  const { distKm, elapsed, steps } = updateWalkStatsUI();
  if (parseFloat(distKm) > 0.01){
    const session = {
      dateLabel: new Date().toLocaleDateString('es-AR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
      distanceKm: distKm,
      durationLabel: formatDuration(elapsed),
      steps: steps.toLocaleString('es-AR'),
      mode: walkCurrentMode,
    };
    walkHistory.push(session);
    await saveWalkHistory();
    renderWalkHistory();
  }
  walkMarker = null;
  renderWalkControls();
}

function renderWalkControls(){
  const btnWrap = document.getElementById('walkBtnWrap');
  if (!btnWrap) return;
  if (walkTracking){
    btnWrap.innerHTML = `<button class="walk-btn stop" id="walkStopBtn">⏹ Detener caminata</button>`;
    document.getElementById('walkStopBtn').onclick = stopWalk;
  } else {
    btnWrap.innerHTML = `<button class="walk-btn" id="walkStartBtn">▶ Iniciar caminata</button>`;
    document.getElementById('walkStartBtn').onclick = startWalk;
  }
}

async function renderWalk(){
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = `
    <div class="walk-banner">
      <div class="name">📍 Caminata en vivo</div>
      <div class="note">Usa el GPS del celular y un mapa gratuito (OpenStreetMap). Necesitás dar permiso de ubicación y mantener esta pantalla abierta mientras caminás — no funciona en segundo plano.</div>
    </div>
    <div id="walkMap"></div>
    <div class="walk-mode" id="walkModeBadge">🚶‍♀️ Esperando inicio…</div>
    <div class="walk-stats">
      <div class="walk-stat"><div class="label">Distancia</div><div class="value" id="walkDistance">0.00 km</div></div>
      <div class="walk-stat"><div class="label">Tiempo</div><div class="value" id="walkTime">0:00</div></div>
      <div class="walk-stat"><div class="label">Pasos aprox.</div><div class="value" id="walkSteps">0</div></div>
      <div class="walk-stat"><div class="label">Ritmo</div><div class="value" id="walkPace">--</div></div>
    </div>
    <div id="walkBtnWrap"></div>
    <div class="walk-history-title">Historial de caminatas</div>
    <div id="walkHistoryList"></div>
  `;
  initWalkMap();
  renderWalkControls();
  await loadWalkHistory();
  renderWalkHistory();
}

// ---- Biblioteca de música/audios/videos para el camino ----
const LIB_STORAGE_KEY = 'veronica-media-library';
let libraryItems = [];

// Accesos rápidos verificados (canal y perfil oficiales de Euge Quevedo + búsquedas de cuarteto)
const QUICK_LINKS = [
  { title:"Euge Quevedo · YouTube oficial", url:"https://www.youtube.com/channel/UC2fMc29XAwRkf3w57GRGMlg/videos", icon:"▶️", c1:"#FF5FA8", c2:"#E83D8C" },
  { title:"Euge Quevedo · Spotify", url:"http://smarturl.it/eugeniaquevedosp", icon:"🎧", c1:"#2FD9C4", c2:"#14B39E" },
  { title:"Más cuarteto en YouTube Music", url:"https://music.youtube.com/search?q=cuarteto", icon:"🪗", c1:"#FFC145", c2:"#FFA53D" },
  { title:"Más cuarteto en Spotify", url:"https://open.spotify.com/search/cuarteto", icon:"🎵", c1:"#A487F5", c2:"#8360E8" },
  { title:"Cuarteto en vivo (videos)", url:"https://www.youtube.com/results?search_query=cuarteto+en+vivo", icon:"📺", c1:"#FF8A3D", c2:"#F26A1B" },
  { title:"Podcasts / audios en Spotify", url:"https://open.spotify.com/search/podcasts", icon:"🎙️", c1:"#14B39E", c2:"#0E9483" },
];

const LIB_TYPE_ICON = { musica:"🎵", audio:"🎙️", video:"📺" };
const LIB_TYPE_LABEL = { musica:"Música", audio:"Audio / podcast", video:"Video" };

async function loadLibrary(){
  try{
    const raw = localStorage.getItem(LIB_STORAGE_KEY);
    libraryItems = raw ? JSON.parse(raw) : [];
  }catch(e){ libraryItems = []; }
}
async function saveLibrary(){
  try{ localStorage.setItem(LIB_STORAGE_KEY, JSON.stringify(libraryItems)); }
  catch(e){ console.error('No se pudo guardar la biblioteca', e); }
}

function renderLibraryItems(){
  const el = document.getElementById('libItemsList');
  if (!el) return;
  if (!libraryItems.length){
    el.innerHTML = '<div class="lib-empty">Todavía no agregaste nada a tu biblioteca 🎧</div>';
    return;
  }
  el.innerHTML = '';
  [...libraryItems].reverse().forEach(item => {
    const row = document.createElement('div');
    row.className = 'lib-item';
    row.innerHTML = `
      <a href="${item.url}" target="_blank" rel="noopener">
        <div class="lib-item-icon">${LIB_TYPE_ICON[item.type] || '🎵'}</div>
        <div class="lib-item-info">
          <div class="lib-item-title">${item.title}</div>
          <div class="lib-item-type">${LIB_TYPE_LABEL[item.type] || 'Música'}</div>
        </div>
      </a>
      <button class="lib-del" data-id="${item.id}" aria-label="Borrar ${item.title} de la biblioteca">✕</button>
    `;
    row.querySelector('.lib-del').onclick = async () => {
      libraryItems = libraryItems.filter(i => i.id !== item.id);
      await saveLibrary();
      renderLibraryItems();
    };
    el.appendChild(row);
  });
}

async function addLibraryItem(){
  const titleEl = document.getElementById('libTitleInput');
  const urlEl = document.getElementById('libUrlInput');
  const typeEl = document.getElementById('libTypeInput');
  const title = titleEl.value.trim();
  let url = urlEl.value.trim();
  if (!title || !url) { alert('Completá el nombre y el link.'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  libraryItems.push({ id: Date.now().toString(), title, url, type: typeEl.value });
  await saveLibrary();
  titleEl.value = ''; urlEl.value = '';
  renderLibraryItems();
}

async function renderLibrary(){
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = `
    <div class="lib-banner">
      <div class="name">🎵 Biblioteca para el camino</div>
      <div class="note">Accesos directos a cuarteto y espacio para guardar tus propios temas, audios o videos. Se abren en YouTube, Spotify o la app que tengas instalada.</div>
    </div>

    <div class="lib-section-title">Accesos rápidos</div>
    <div class="lib-grid" id="libQuickGrid"></div>

    <div class="lib-section-title">Agregar a tu biblioteca</div>
    <div class="lib-form">
      <label for="libTitleInput">Nombre</label>
      <input type="text" id="libTitleInput" placeholder="Nombre (ej: Playlist para caminar)">
      <label for="libUrlInput">Link</label>
      <input type="text" id="libUrlInput" placeholder="Link (YouTube, Spotify, etc.)">
      <label for="libTypeInput">Tipo</label>
      <select id="libTypeInput">
        <option value="musica">🎵 Música</option>
        <option value="audio">🎙️ Audio / podcast</option>
        <option value="video">📺 Video</option>
      </select>
      <button class="lib-add-btn" id="libAddBtn">+ Guardar en mi biblioteca</button>
    </div>

    <div class="lib-section-title">Tu biblioteca</div>
    <div id="libItemsList"></div>
  `;

  const grid = document.getElementById('libQuickGrid');
  QUICK_LINKS.forEach(l => {
    const a = document.createElement('a');
    a.className = 'lib-card';
    a.href = l.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `<div class="lib-icon" style="background:linear-gradient(135deg, ${l.c1}, ${l.c2})">${l.icon}</div><div class="lib-title">${l.title}</div>`;
    grid.appendChild(a);
  });

  document.getElementById('libAddBtn').onclick = addLibraryItem;

  await loadLibrary();
  renderLibraryItems();
}

function renderDay(){
  const day = DATA[current];
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = '';
  const [c1, c2] = DAY_COLORS[current];

  const banner = document.createElement('div');
  banner.className = 'day-banner';
  banner.style.background = `linear-gradient(120deg, ${c1}, ${c2}, ${c1})`;
  banner.innerHTML = `<div class="name">${day.label}</div><div class="tag">${day.tag}</div>`;
  wrap.appendChild(banner);

  const progWrap = document.createElement('div');
  progWrap.className = 'progress-wrap';
  progWrap.innerHTML = `<div class="progress-track"><div class="progress-fill" id="progFill" style="background:linear-gradient(90deg, ${c1}, ${c2}, ${c1});"></div></div><div class="progress-label" id="progLabel" style="color:${c1}">0/0</div>`;
  wrap.appendChild(progWrap);

  day.blocks.forEach((block, bIdx) => {
    const el = document.createElement('div');
    el.className = 'block';
    el.style.borderLeft = `4px solid ${c1}`;
    el.innerHTML = `<div class="block-head">
        <span class="emoji" aria-hidden="true">${block.emoji}</span>
        <h2>${block.title}</h2>
        <span class="time" style="background:linear-gradient(120deg, ${c1}, ${c2})">${block.time}</span>
      </div>`;
    block.items.forEach((item, iIdx) => {
      const key = bIdx+'-'+iIdx;
      const isDone = state[current].has(key);
      const row = document.createElement('label');
      row.className = 'item' + (item.special?' special':'') + (item.walk?' walk':'') + (item.wa?' wa':'') + (isDone?' done':'');
      row.innerHTML = `
        <input type="checkbox" class="item-checkbox" ${isDone ? 'checked' : ''}>
        <span class="checkbox" aria-hidden="true" style="${isDone ? `background:linear-gradient(135deg, ${c1}, ${c2}); border-color:${c1};` : `border-color:${c1};`}"><svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="item-emoji" aria-hidden="true">${item.e}</span>
        <span class="item-text">${item.t}</span>`;
      row.querySelector('.item-checkbox').addEventListener('click', (ev) => {
        const checked = ev.target.checked;
        if (checked) { state[current].add(key); burstConfetti(ev.clientX, ev.clientY); }
        else { state[current].delete(key); }
        saveCheckState();
        renderDay();
      });
      el.appendChild(row);
    });
    wrap.appendChild(el);
  });

  const total = totalItems(day);
  const done = state[current].size;
  document.getElementById('progFill').style.width = (total? (done/total*100):0) + '%';
  document.getElementById('progLabel').textContent = done + '/' + total;
}

renderTabs();
renderDay();

// Notas musicales flotando de fondo
const NOTE_EMOJIS = ['🎵','🎶','🎸','🥁','✨'];
function spawnNotes(){
  const n = window.innerWidth < 480 ? 12 : 20;
  for (let i=0; i<n; i++){
    const s = document.createElement('div');
    s.className = 'note';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = NOTE_EMOJIS[Math.floor(Math.random()*NOTE_EMOJIS.length)];
    s.style.left = Math.random()*100 + 'vw';
    s.style.top = Math.random()*100 + 'vh';
    s.style.animationDuration = (4 + Math.random()*4) + 's';
    s.style.animationDelay = (Math.random()*4) + 's';
    s.style.fontSize = (14 + Math.random()*14) + 'px';
    document.body.appendChild(s);
  }
}
spawnNotes();

// Confeti cayendo de forma continua desde arriba
const FALL_COLORS = ['#FF5FA8','#FFC145','#2FD9C4','#A487F5','#FF8A3D'];
const FALL_SHAPES = ['🎊','🎉','●','▮'];
function spawnFallingConfetti(){
  const field = document.getElementById('confettiField');
  const n = window.innerWidth < 480 ? 14 : 22;
  for (let i=0; i<n; i++){
    const c = document.createElement('div');
    c.className = 'confetti-fall';
    const shape = FALL_SHAPES[Math.floor(Math.random()*FALL_SHAPES.length)];
    if (shape === '●' || shape === '▮'){
      c.textContent = shape;
      c.style.color = FALL_COLORS[Math.floor(Math.random()*FALL_COLORS.length)];
      c.style.fontSize = (8 + Math.random()*8) + 'px';
    } else {
      c.textContent = shape;
      c.style.fontSize = (12 + Math.random()*10) + 'px';
    }
    c.style.left = Math.random()*100 + 'vw';
    c.style.animationDuration = (9 + Math.random()*8) + 's';
    c.style.animationDelay = (Math.random()*10) + 's';
    c.style.opacity = 0.5 + Math.random()*0.4;
    field.appendChild(c);
  }
}
spawnFallingConfetti();

const CONFETTI_EMOJIS = ['🎉','🎶','✨','🔥'];
function burstConfetti(x, y){
  for (let i=0; i<10; i++){
    const c = document.createElement('div');
    c.textContent = CONFETTI_EMOJIS[Math.floor(Math.random()*CONFETTI_EMOJIS.length)];
    c.style.position = 'fixed';
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.fontSize = (12 + Math.random()*10) + 'px';
    c.style.pointerEvents = 'none';
    c.style.zIndex = 999;
    const angle = Math.random()*Math.PI*2;
    const dist = 40 + Math.random()*50;
    const dx = Math.cos(angle)*dist;
    const dy = Math.sin(angle)*dist - 20;
    c.animate([
      { transform:'translate(0,0) scale(1)', opacity:1 },
      { transform:`translate(${dx}px, ${dy}px) scale(0.4)`, opacity:0 }
    ], { duration: 650 + Math.random()*300, easing:'cubic-bezier(.22,.61,.36,1)' });
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }
}

// ---- PWA: registrar service worker (instalable + funciona offline) ----
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((e) => {
      console.error('No se pudo registrar el service worker', e);
    });
  });
}
