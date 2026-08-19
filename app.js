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

const DEFAULT_DATA = {
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
const { haversine, formatDuration, daysUntilInfo, sortBirthdaysByNextOccurrence, todayKey, isoDate, geolocationErrorMessage, escapeHtml, urlBase64ToUint8Array, computeStreak, weeklyForgivesRemaining, totalWalkDistanceKm, bestWalkDistanceKm, walkDistanceThisWeek, walkDistanceThisMonth, walkStreakDays } = window.RutinaLogic;
// Perdones de racha de rutina (Nivel 18): 1 por semana calendario, fijo,
// sin configuración en la UI — ver docs/specs/2026-08-19-nivel18-*.md.
const STREAK_FORGIVE_PER_WEEK = 1;

// ---- Anuncios puntuales para lectores de pantalla (no releer todo el panel) ----
function announce(message){
  const el = document.getElementById('srAnnouncer');
  if (el) el.textContent = message;
}

// ---- Aviso visible si falla un guardado (antes quedaba solo en la consola) ----
let saveErrorTimeout = null;
function showSaveError(message){
  let banner = document.getElementById('saveErrorBanner');
  if (!banner){
    banner = document.createElement('div');
    banner.id = 'saveErrorBanner';
    banner.setAttribute('role', 'alert');
    document.body.appendChild(banner);
  }
  banner.textContent = '⚠️ ' + message;
  banner.classList.add('visible');
  clearTimeout(saveErrorTimeout);
  saveErrorTimeout = setTimeout(() => banner.classList.remove('visible'), 6000);
}
const CHECK_STORAGE_KEY = 'veronica-checklist-state';
const CHECK_LAST_ACTIVE_KEY = 'veronica-checklist-last-active';
const STREAK_STORAGE_KEY = 'veronica-routine-history';

// Instantánea de antes de que loadCheckState() detecte el cambio de día y
// resetee el checklist de hoy — la necesitamos intacta para poder evaluar
// más abajo (una vez cargada `routine`) si el día que se está dejando atrás
// quedó 100% completo, y así cerrarlo en el historial de racha.
const previousLastActive = (() => {
  try{ return localStorage.getItem(CHECK_LAST_ACTIVE_KEY); }catch(e){ return null; }
})();
const previousCheckSnapshot = (() => {
  try{ const raw = localStorage.getItem(CHECK_STORAGE_KEY); return raw ? JSON.parse(raw) : {}; }catch(e){ return {}; }
})();

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

  // La rutina es diaria: si cambió el día calendario desde la última vez
  // que se abrió la app, el checklist de HOY tiene que arrancar en blanco
  // (si no, quedaría tildado para siempre cada vez que vuelva a ser ese
  // mismo día de la semana). Los demás días quedan como estaban, para
  // poder mirar hacia atrás qué se hizo un día anterior.
  try{
    const today = isoDate(new Date());
    const lastActive = localStorage.getItem(CHECK_LAST_ACTIVE_KEY);
    if (lastActive !== today){
      const todaysKey = todayKey(new Date(), ORDER);
      state[todaysKey] = new Set();
      const plain = {};
      ORDER.forEach(k => plain[k] = [...state[k]]);
      localStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(plain));
      localStorage.setItem(CHECK_LAST_ACTIVE_KEY, today);
    }
  }catch(e){ console.error('No se pudo verificar la fecha del checklist', e); }

  return state;
}
function saveCheckState(){
  try{
    const plain = {};
    ORDER.forEach(k => plain[k] = [...state[k]]);
    localStorage.setItem(CHECK_STORAGE_KEY, JSON.stringify(plain));
  }catch(e){ console.error('No se pudo guardar el estado del checklist', e); showSaveError('No se pudo guardar el checklist. Revisá el espacio disponible o si estás en modo privado.'); }
}

const state = loadCheckState();

// ---- Rutina semanal editable desde la app (persiste en localStorage) ----
const ROUTINE_STORAGE_KEY = 'veronica-routine';

function seedRoutine(){
  const seeded = {};
  ORDER.forEach(dayKey => {
    const day = DEFAULT_DATA[dayKey];
    seeded[dayKey] = {
      label: day.label,
      tag: day.tag,
      weekend: day.weekend,
      blocks: day.blocks.map((block, bIdx) => ({
        title: block.title,
        emoji: block.emoji,
        time: block.time,
        items: block.items.map((item, iIdx) => ({ ...item, id: `seed-${dayKey}-${bIdx}-${iIdx}` })),
      })),
    };
  });
  return seeded;
}

function loadRoutine(){
  try{
    const raw = localStorage.getItem(ROUTINE_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  }catch(e){ console.error('No se pudo leer la rutina guardada', e); }
  const seeded = seedRoutine();
  try{ localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(seeded)); }catch(e){ /* seguimos igual aunque no se pueda guardar */ }
  return seeded;
}
function saveRoutine(){
  try{ localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(routine)); }
  catch(e){ console.error('No se pudo guardar la rutina', e); showSaveError('No se pudo guardar el cambio en la rutina.'); }
}

const routine = loadRoutine();
let addingToBlock = null; // índice de bloque del día actual con el mini-formulario abierto, o null
let editingItemId = null; // id del item que se está editando en el día actual, o null

// ---- Racha de rutina: historial persistente de días 100% completos ----
function loadRoutineHistory(){
  try{
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
function saveRoutineHistory(history){
  try{ localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(history)); }
  catch(e){ console.error('No se pudo guardar el historial de racha', e); showSaveError('No se pudo guardar tu racha de rutina.'); }
}

// Si cambió el día calendario desde la última vez que se abrió la app (ver
// previousLastActive/previousCheckSnapshot arriba), evalúa si el día que se
// deja atrás quedó 100% completo contra la rutina editable actual y, si es
// así, lo agrega al historial persistente. Corre una sola vez por apertura
// en un día distinto — mismo punto donde loadCheckState() ya detecta el
// cambio de día.
// Decisión de spec (docs/specs/2026-08-18-nivel17-racha-cumples-caminata.md):
// se mide contra la rutina tal cual está AHORA, no una foto del día en
// cuestión — así un día con tareas agregadas/borradas se mide contra la
// versión editada. Trade-off aceptado: si se agrega o borra un ítem de ese
// día después de completarlo pero antes de que cambie la fecha, el conteo
// puede no reflejar lo que realmente se tildó en su momento.
function closeRoutineHistoryIfDayChanged(){
  const today = isoDate(new Date());
  if (!previousLastActive || previousLastActive === today) return;
  const [y, m, d] = previousLastActive.split('-').map(Number);
  const prevWeekday = todayKey(new Date(y, m - 1, d), ORDER);
  const day = routine[prevWeekday];
  if (!day) return;
  const currentItemIds = new Set();
  day.blocks.forEach(b => b.items.forEach(i => currentItemIds.add(i.id)));
  const doneIds = Array.isArray(previousCheckSnapshot[prevWeekday]) ? previousCheckSnapshot[prevWeekday] : [];
  const doneCount = doneIds.filter(id => currentItemIds.has(id)).length;
  const total = totalItems(day);
  if (total > 0 && doneCount === total){
    const history = loadRoutineHistory();
    if (!history.includes(previousLastActive)){
      history.push(previousLastActive);
      saveRoutineHistory(history);
    }
  }
}
closeRoutineHistoryIfDayChanged();

// Cuántos ítems tiene el día `dayKey` y cuántos están tildados — compartido
// por renderDay() (progreso del día que se está viendo) y renderStreakBadge()
// (siempre sobre el día de hoy, sea o no el que se está viendo).
function countDone(dayKey){
  const day = routine[dayKey];
  const total = totalItems(day);
  const done = day.blocks.reduce((s, b) => s + b.items.filter(i => state[dayKey].has(i.id)).length, 0);
  return { total, done };
}

function renderStreakBadge(){
  const el = document.getElementById('streakBadge');
  if (!el) return;
  const today = isoDate(new Date());
  const todaysKey = todayKey(new Date(), ORDER);
  const { total, done } = countDone(todaysKey);
  const todayCompleted = total > 0 && done === total;
  const history = loadRoutineHistory().filter(d => d !== today);
  const streak = computeStreak(history, today, todayCompleted, STREAK_FORGIVE_PER_WEEK);
  const forgiveEl = document.getElementById('streakForgiveHint');
  if (streak > 0){
    el.hidden = false;
    el.textContent = `🔥 ${streak} día${streak === 1 ? '' : 's'} seguido${streak === 1 ? '' : 's'}`;
    if (forgiveEl){
      forgiveEl.hidden = false;
      const remaining = weeklyForgivesRemaining(history, today, STREAK_FORGIVE_PER_WEEK);
      forgiveEl.textContent = remaining > 0 ? '❄️ 1 perdón disponible esta semana' : '❄️ Perdón usado esta semana';
    }
  } else {
    el.hidden = true;
    if (forgiveEl) forgiveEl.hidden = true;
  }
}

function addRoutineItem(dayKey, blockIdx, text, emoji){
  const item = { id: Date.now().toString(), t: text, e: emoji || '📌' };
  routine[dayKey].blocks[blockIdx].items.push(item);
  saveRoutine();
}
function updateRoutineItem(dayKey, blockIdx, itemId, text, emoji){
  const item = routine[dayKey].blocks[blockIdx].items.find(i => i.id === itemId);
  if (item){ item.t = text; item.e = emoji || item.e; }
  saveRoutine();
}
function deleteRoutineItem(dayKey, blockIdx, itemId){
  const block = routine[dayKey].blocks[blockIdx];
  block.items = block.items.filter(i => i.id !== itemId);
  state[dayKey].delete(itemId);
  saveCheckState();
  saveRoutine();
}

let current = todayKey(new Date(), ORDER);

// ---- Cumpleaños (mismos datos que la rutina de Lara) ----
// Versiones oscurecidas de los colores de categoría: los tonos pastel
// originales no llegan al contraste mínimo (WCAG AA 4.5:1) con texto
// blanco encima en los tags chicos. Mismo tono, más oscuro.
const CAT_COLOR = {
  "Familia":"#E40068",
  "Hermano/a":"#D64300",
  "Sobrino/a":"#16836F",
  "Bisabuela":"#7B57FF",
  "Abuela":"#7B57FF",
  "Tío/a":"#A16B00",
  "Primo/a":"#16836F",
};
const DEFAULT_BIRTHDAYS = [
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

function getSortedBirthdays(){
  return sortBirthdaysByNextOccurrence(birthdays, new Date());
}

// ---- Cumpleaños editables desde la app (persisten en localStorage) ----
const BIRTHDAYS_STORAGE_KEY = 'veronica-birthdays';
let birthdays = [];
let editingBirthdayId = null;

async function loadBirthdays(){
  try{
    const raw = localStorage.getItem(BIRTHDAYS_STORAGE_KEY);
    if (raw){
      birthdays = JSON.parse(raw);
      return;
    }
  }catch(e){ console.error('No se pudo leer la lista de cumpleaños', e); }
  birthdays = DEFAULT_BIRTHDAYS.map((b, i) => ({ ...b, id: 'seed-' + i }));
  await saveBirthdays();
}
async function saveBirthdays(){
  try{ localStorage.setItem(BIRTHDAYS_STORAGE_KEY, JSON.stringify(birthdays)); }
  catch(e){ console.error('No se pudo guardar la lista de cumpleaños', e); showSaveError('No se pudo guardar el cumpleaños.'); }
  // Sin await a propósito: es un best-effort en segundo plano (tiene su
  // propio try/catch), no queremos que agregar/editar/borrar un cumpleaños
  // se sienta colgado esperando una respuesta de red.
  syncBirthdaysToWorker();
}

async function submitBirthdayForm(){
  const nameEl = document.getElementById('bdayNameInput');
  const dayEl = document.getElementById('bdayDayInput');
  const monthEl = document.getElementById('bdayMonthInput');
  const catEl = document.getElementById('bdayCatInput');
  const name = nameEl.value.trim();
  const day = parseInt(dayEl.value, 10);
  const month = parseInt(monthEl.value, 10);
  const cat = catEl.value;
  if (!name || !day || day < 1 || day > 31 || !month){
    alert('Completá el nombre, el día (1-31) y el mes.');
    return;
  }
  if (editingBirthdayId){
    const entry = birthdays.find(b => b.id === editingBirthdayId);
    if (entry){ entry.name = name; entry.day = day; entry.month = month; entry.cat = cat; }
    editingBirthdayId = null;
  } else {
    birthdays.push({ id: Date.now().toString(), name, day, month, cat });
  }
  await saveBirthdays();
  renderBirthdays();
}

function fillBirthdayForm(b){
  editingBirthdayId = b.id;
  document.getElementById('bdayNameInput').value = b.name;
  document.getElementById('bdayDayInput').value = b.day;
  document.getElementById('bdayMonthInput').value = b.month;
  document.getElementById('bdayCatInput').value = b.cat;
  document.getElementById('bdayFormSubmit').textContent = '💾 Guardar cambios';
  document.getElementById('bdayNameInput').focus();
}

async function deleteBirthday(id){
  birthdays = birthdays.filter(b => b.id !== id);
  if (editingBirthdayId === id) editingBirthdayId = null;
  await saveBirthdays();
  renderBirthdays();
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
    // Roving tabindex: Tab entra una sola vez al grupo (en la pestaña
    // activa); dentro del grupo se navega con las flechas.
    btn.tabIndex = key===current ? 0 : -1;
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
      const d = DEFAULT_DATA[key];
      btn.className = 'tab' + (key===current?' active':'');
      btn.textContent = d.label.slice(0,3);
    }
    if (key===current){
      // Cortina oscura semitransparente para que el texto blanco llegue al
      // contraste mínimo (WCAG 4.5:1) sin cambiar el color propio del día
      // en el resto de la app (banner, barra de progreso, bordes, etc.).
      btn.style.background = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), linear-gradient(135deg, ${c1}, ${c2})`;
      btn.style.color = '#fff';
    }
    btn.onclick = () => {
      current = key; renderTabs();
      addingToBlock = null; editingItemId = null;
      if (current==='cumples') renderBirthdays();
      else if (current==='caminata') renderWalk();
      else if (current==='biblioteca') renderLibrary();
      else renderDay();
    };
    tabs.appendChild(btn);
  });
}

// Navegación por teclado del grupo de pestañas (patrón ARIA de tabs):
// flechas izq/der mueven y activan, Home/End van al extremo. El listener
// se agrega una sola vez sobre el contenedor, que no se recrea entre
// renders (solo se reemplaza su innerHTML).
document.getElementById('tabs').addEventListener('keydown', (ev) => {
  const KEYS = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
  if (!KEYS.includes(ev.key)) return;
  const tabButtons = [...document.querySelectorAll('#tabs [role="tab"]')];
  const idx = tabButtons.indexOf(document.activeElement);
  if (idx === -1) return;
  ev.preventDefault();
  let newIdx = idx;
  if (ev.key === 'ArrowRight') newIdx = (idx + 1) % tabButtons.length;
  else if (ev.key === 'ArrowLeft') newIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
  else if (ev.key === 'Home') newIdx = 0;
  else if (ev.key === 'End') newIdx = tabButtons.length - 1;
  tabButtons[newIdx].click();
  document.querySelector('#tabs [role="tab"][aria-selected="true"]')?.focus();
});

async function renderBirthdays(){
  await loadBirthdays();
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = '';

  if (birthdays.length){
    const sorted = getSortedBirthdays();
    const next = sorted[0];
    const hero = document.createElement('div');
    hero.className = 'bday-hero';
    // Misma cortina oscura que en las pestañas/banner del día (ver ahí el porqué).
    hero.style.background = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), linear-gradient(120deg, #8B6BFF, #FF4FA0, #8B6BFF)`;
    const whenTxt = next.diff === 0 ? '¡Es hoy! 🎉' : (next.diff === 1 ? 'Es mañana' : `${MONTH_NAMES[next.targetMonth]} ${next.day}`);
    const countdownTxt = next.diff === 0 ? '¡No te olvides de saludar!' : (next.diff === 1 ? 'Faltan 1 día' : `Faltan ${next.diff} días`);
    hero.innerHTML = `
      <div class="eyebrow">Próximo cumpleaños</div>
      <div class="who">${escapeHtml(next.name)}</div>
      <div class="when">${whenTxt} · ${escapeHtml(next.cat)}</div>
      <div class="countdown">⏰ ${countdownTxt}</div>
    `;
    wrap.appendChild(hero);
  }

  const formTitle = document.createElement('div');
  formTitle.className = 'lib-section-title';
  formTitle.textContent = editingBirthdayId ? 'Editar cumpleaños' : 'Agregar cumpleaños';
  wrap.appendChild(formTitle);

  const form = document.createElement('div');
  form.className = 'bday-form';
  const catOptions = Object.keys(CAT_COLOR).map(c => `<option value="${c}">${c}</option>`).join('');
  form.innerHTML = `
    <label for="bdayNameInput">Nombre</label>
    <input type="text" id="bdayNameInput" placeholder="Nombre">
    <div class="bday-form-row">
      <div>
        <label for="bdayDayInput">Día</label>
        <input type="number" id="bdayDayInput" min="1" max="31" placeholder="Día">
      </div>
      <div>
        <label for="bdayMonthInput">Mes</label>
        <select id="bdayMonthInput">
          <option value="">Mes</option>
          ${MONTH_NAMES.map((m, i) => `<option value="${i+1}">${m}</option>`).join('')}
        </select>
      </div>
    </div>
    <label for="bdayCatInput">Categoría</label>
    <select id="bdayCatInput">${catOptions}</select>
    <button class="bday-add-btn" id="bdayFormSubmit">${editingBirthdayId ? '💾 Guardar cambios' : '+ Agregar cumpleaños'}</button>
    ${editingBirthdayId ? '<button class="bday-cancel-btn" id="bdayFormCancel" type="button">Cancelar edición</button>' : ''}
  `;
  wrap.appendChild(form);
  document.getElementById('bdayFormSubmit').onclick = submitBirthdayForm;
  if (editingBirthdayId){
    document.getElementById('bdayFormCancel').onclick = () => { editingBirthdayId = null; renderBirthdays(); };
  }
  if (editingBirthdayId){
    const entry = birthdays.find(b => b.id === editingBirthdayId);
    if (entry){
      document.getElementById('bdayNameInput').value = entry.name;
      document.getElementById('bdayDayInput').value = entry.day;
      document.getElementById('bdayMonthInput').value = entry.month;
      document.getElementById('bdayCatInput').value = entry.cat;
    }
  }

  if (!birthdays.length){
    const empty = document.createElement('div');
    empty.className = 'lib-empty';
    empty.textContent = 'Todavía no hay cumpleaños cargados 🎂';
    wrap.appendChild(empty);
    return;
  }

  const listTitle = document.createElement('div');
  listTitle.className = 'lib-section-title';
  listTitle.textContent = 'Todos los cumpleaños';
  wrap.appendChild(listTitle);

  const sorted = getSortedBirthdays();
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
        <div class="bday-name">${escapeHtml(b.name)}</div>
        <span class="bday-tag" style="background:${color}">${escapeHtml(b.cat)}</span>
      </div>
      <div class="bday-days">${daysTxt}</div>
      <div class="bday-actions">
        <button class="bday-edit" aria-label="Editar ${escapeHtml(b.name)}">✏️</button>
        <button class="bday-del" aria-label="Borrar ${escapeHtml(b.name)}">✕</button>
      </div>
    `;
    row.querySelector('.bday-edit').onclick = () => fillBirthdayForm(b);
    row.querySelector('.bday-del').onclick = () => {
      if (confirm(`¿Borrar el cumpleaños de ${b.name}?`)) deleteBirthday(b.id);
    };
    wrap.appendChild(row);
  });
}

function totalItems(day){ return day.blocks.reduce((s,b)=>s+b.items.length,0); }

// ---- Caminata en vivo (GPS + mapa gratuito OpenStreetMap/Leaflet) ----
const STRIDE_M = 0.75; // largo de paso promedio para estimar pasos
const VEHICLE_SPEED_KMH = 8; // por encima de esto, se asume vehículo
const DEFAULT_CENTER = [-40.8135, -62.9967]; // Viedma, Río Negro (punto de partida por defecto)
const STORAGE_KEY = 'veronica-walks-history';
const WALK_INPROGRESS_KEY = 'veronica-walk-inprogress';

let walkMap = null, walkPolyline = null, walkMarker = null;
let walkWatchId = null, walkTracking = false;
let walkPath = [], walkStartTime = null, walkTimerInterval = null;
let walkHistory = [];
let walkCurrentMode = 'walking'; // 'walking' | 'vehicle'
let wakeLock = null;

async function requestWakeLock(){
  if (!('wakeLock' in navigator)) return;
  try{
    wakeLock = await navigator.wakeLock.request('screen');
    wakeLock.addEventListener('release', () => { wakeLock = null; });
  }catch(e){ console.error('No se pudo mantener la pantalla encendida', e); }
}
async function releaseWakeLock(){
  if (!wakeLock) return;
  try{ await wakeLock.release(); }catch(e){ /* ya liberado */ }
  wakeLock = null;
}
document.addEventListener('visibilitychange', () => {
  if (walkTracking && document.visibilityState === 'visible' && !wakeLock){
    requestWakeLock();
  }
});

async function loadWalkHistory(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    walkHistory = raw ? JSON.parse(raw) : [];
  }catch(e){ walkHistory = []; }
}

async function saveWalkHistory(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(walkHistory)); }
  catch(e){ console.error('No se pudo guardar el historial', e); showSaveError('No se pudo guardar el historial de caminatas.'); }
}

// ---- Recuperar una caminata si se cierra la app sin apretar "Detener" ----
function saveInProgressWalk(){
  try{
    localStorage.setItem(WALK_INPROGRESS_KEY, JSON.stringify({
      startTime: walkStartTime,
      path: walkPath,
      mode: walkCurrentMode,
    }));
  }catch(e){ console.error('No se pudo guardar el progreso de la caminata', e); }
}
function clearInProgressWalk(){
  try{ localStorage.removeItem(WALK_INPROGRESS_KEY); }catch(e){ /* nada que hacer */ }
}
function loadInProgressWalk(){
  try{
    const raw = localStorage.getItem(WALK_INPROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(e){ return null; }
}
function walkStatsFromPath(path, startTime){
  const dist = path.reduce((sum, p, i) => i===0 ? 0 : sum + haversine(path[i-1], p), 0);
  const distKm = (dist/1000).toFixed(2);
  const lastT = path.length ? path[path.length-1].t : startTime;
  const elapsed = startTime ? lastT - startTime : 0;
  const steps = Math.round(dist / STRIDE_M);
  return { distKm, elapsed, steps };
}

function renderWalkSummary(){
  const el = document.getElementById('walkSummaryStats');
  if (!el) return;
  const now = new Date();
  const totalKm = totalWalkDistanceKm(walkHistory);
  const weekKm = walkDistanceThisWeek(walkHistory, now);
  const monthKm = walkDistanceThisMonth(walkHistory, now);
  const streakDays = walkStreakDays(walkHistory, isoDate(now));
  const bestKm = bestWalkDistanceKm(walkHistory);
  el.innerHTML = `
    <div class="walk-stat"><div class="label">Distancia total</div><div class="value">${totalKm.toFixed(2)} km</div></div>
    <div class="walk-stat"><div class="label">Esta semana</div><div class="value">${weekKm.toFixed(2)} km</div></div>
    <div class="walk-stat"><div class="label">Este mes</div><div class="value">${monthKm.toFixed(2)} km</div></div>
    <div class="walk-stat"><div class="label">Racha de caminata</div><div class="value">🔥 ${streakDays}</div></div>
    <div class="walk-stat"><div class="label">Mejor caminata</div><div class="value">${bestKm.toFixed(2)} km</div></div>
  `;
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
  requestWakeLock();
  saveInProgressWalk();

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
    saveInProgressWalk();
  }, (err) => {
    console.error(err);
    alert(geolocationErrorMessage(err));
    if (walkPath.length === 0){
      // Nunca llegó a trackear ni un punto: cancelamos, no dejamos el botón "Detener" colgado.
      if (walkWatchId !== null) navigator.geolocation.clearWatch(walkWatchId);
      if (walkTimerInterval) clearInterval(walkTimerInterval);
      walkTracking = false;
      walkWatchId = null;
      releaseWakeLock();
      clearInProgressWalk();
      renderWalkControls();
    }
  }, { enableHighAccuracy:true, maximumAge:2000, timeout:10000 });

  walkTimerInterval = setInterval(updateWalkStatsUI, 1000);
  renderWalkControls();
}

async function stopWalk(){
  if (walkWatchId !== null) navigator.geolocation.clearWatch(walkWatchId);
  if (walkTimerInterval) clearInterval(walkTimerInterval);
  walkTracking = false;
  walkWatchId = null;
  await releaseWakeLock();
  clearInProgressWalk();

  const { distKm, elapsed, steps } = updateWalkStatsUI();
  if (parseFloat(distKm) > 0.01){
    const session = {
      dateLabel: new Date().toLocaleDateString('es-AR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
      distanceKm: distKm,
      durationLabel: formatDuration(elapsed),
      steps: steps.toLocaleString('es-AR'),
      mode: walkCurrentMode,
      timestamp: Date.now(),
    };
    walkHistory.push(session);
    await saveWalkHistory();
    renderWalkHistory();
    renderWalkSummary();
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
      <div class="banner-note">Usa el GPS del celular y un mapa gratuito (OpenStreetMap). Necesitás dar permiso de ubicación y mantener esta pantalla abierta mientras caminás — no funciona en segundo plano.</div>
    </div>
    <div id="walkRecoverWrap"></div>
    <div id="walkMap"></div>
    <div class="walk-mode" id="walkModeBadge">🚶‍♀️ Esperando inicio…</div>
    <div class="walk-stats">
      <div class="walk-stat"><div class="label">Distancia</div><div class="value" id="walkDistance">0.00 km</div></div>
      <div class="walk-stat"><div class="label">Tiempo</div><div class="value" id="walkTime">0:00</div></div>
      <div class="walk-stat"><div class="label">Pasos aprox.</div><div class="value" id="walkSteps">0</div></div>
      <div class="walk-stat"><div class="label">Ritmo</div><div class="value" id="walkPace">--</div></div>
    </div>
    <div id="walkBtnWrap"></div>
    <div class="walk-history-title">Tus números</div>
    <div class="walk-summary-stats" id="walkSummaryStats"></div>
    <div class="walk-stats-note">Esta semana / Este mes / Racha cuentan solo caminatas guardadas desde este nivel en adelante.</div>
    <div class="walk-history-title">Historial de caminatas</div>
    <div id="walkHistoryList"></div>
  `;
  initWalkMap();
  renderWalkControls();
  await loadWalkHistory();
  renderWalkHistory();
  renderWalkSummary();

  if (!walkTracking){
    const abandoned = loadInProgressWalk();
    if (abandoned && Array.isArray(abandoned.path) && abandoned.path.length >= 2){
      const stats = walkStatsFromPath(abandoned.path, abandoned.startTime);
      if (parseFloat(stats.distKm) > 0.01){
        const recoverWrap = document.getElementById('walkRecoverWrap');
        recoverWrap.innerHTML = `
          <div class="walk-recover-banner">
            <div class="walk-recover-text">Se cortó una caminata sin guardar: ${stats.distKm} km · ${formatDuration(stats.elapsed)}. ¿Qué hacemos?</div>
            <div class="walk-recover-actions">
              <button type="button" id="walkRecoverSaveBtn">💾 Guardar en el historial</button>
              <button type="button" id="walkRecoverDiscardBtn">🗑️ Descartar</button>
            </div>
          </div>
        `;
        document.getElementById('walkRecoverSaveBtn').onclick = async () => {
          const session = {
            dateLabel: new Date(abandoned.startTime).toLocaleDateString('es-AR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }),
            distanceKm: stats.distKm,
            durationLabel: formatDuration(stats.elapsed),
            steps: stats.steps.toLocaleString('es-AR'),
            mode: abandoned.mode || 'walking',
            timestamp: abandoned.startTime || Date.now(),
          };
          walkHistory.push(session);
          await saveWalkHistory();
          clearInProgressWalk();
          renderWalk();
        };
        document.getElementById('walkRecoverDiscardBtn').onclick = () => {
          clearInProgressWalk();
          renderWalk();
        };
      } else {
        clearInProgressWalk();
      }
    }
  }
}

// ---- Biblioteca de música/audios/videos para el camino ----
const LIB_STORAGE_KEY = 'veronica-media-library';
let libraryItems = [];
let editingLibraryId = null;

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
  catch(e){ console.error('No se pudo guardar la biblioteca', e); showSaveError('No se pudo guardar el cambio en la biblioteca.'); }
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
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
        <div class="lib-item-icon">${LIB_TYPE_ICON[item.type] || '🎵'}</div>
        <div class="lib-item-info">
          <div class="lib-item-title">${escapeHtml(item.title)}</div>
          <div class="lib-item-type">${LIB_TYPE_LABEL[item.type] || 'Música'}</div>
        </div>
      </a>
      <button class="lib-edit" data-id="${item.id}" aria-label="Editar ${escapeHtml(item.title)}">✏️</button>
      <button class="lib-del" data-id="${item.id}" aria-label="Borrar ${escapeHtml(item.title)} de la biblioteca">✕</button>
    `;
    row.querySelector('.lib-edit').onclick = () => {
      editingLibraryId = item.id;
      renderLibrary();
    };
    row.querySelector('.lib-del').onclick = async () => {
      if (!confirm(`¿Borrar "${item.title}" de tu biblioteca?`)) return;
      libraryItems = libraryItems.filter(i => i.id !== item.id);
      if (editingLibraryId === item.id) editingLibraryId = null;
      await saveLibrary();
      renderLibraryItems();
    };
    el.appendChild(row);
  });
}

async function submitLibraryForm(){
  const titleEl = document.getElementById('libTitleInput');
  const urlEl = document.getElementById('libUrlInput');
  const typeEl = document.getElementById('libTypeInput');
  const title = titleEl.value.trim();
  let url = urlEl.value.trim();
  if (!title || !url) { alert('Completá el nombre y el link.'); return; }
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  if (editingLibraryId){
    const entry = libraryItems.find(i => i.id === editingLibraryId);
    if (entry){ entry.title = title; entry.url = url; entry.type = typeEl.value; }
    editingLibraryId = null;
  } else {
    libraryItems.push({ id: Date.now().toString(), title, url, type: typeEl.value });
  }
  await saveLibrary();
  renderLibrary();
}

async function renderLibrary(){
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = `
    <div class="lib-banner">
      <div class="name">🎵 Biblioteca para el camino</div>
      <div class="banner-note">Accesos directos a cuarteto y espacio para guardar tus propios temas, audios o videos. Se abren en YouTube, Spotify o la app que tengas instalada.</div>
    </div>

    <div class="lib-section-title">Accesos rápidos</div>
    <div class="lib-grid" id="libQuickGrid"></div>

    <div class="lib-section-title">${editingLibraryId ? 'Editar item' : 'Agregar a tu biblioteca'}</div>
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
      <button class="lib-add-btn" id="libAddBtn">${editingLibraryId ? '💾 Guardar cambios' : '+ Guardar en mi biblioteca'}</button>
      ${editingLibraryId ? '<button class="bday-cancel-btn" id="libCancelBtn" type="button">Cancelar edición</button>' : ''}
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

  document.getElementById('libAddBtn').onclick = submitLibraryForm;
  if (editingLibraryId){
    document.getElementById('libCancelBtn').onclick = () => { editingLibraryId = null; renderLibrary(); };
  }

  await loadLibrary();

  if (editingLibraryId){
    const entry = libraryItems.find(i => i.id === editingLibraryId);
    if (entry){
      document.getElementById('libTitleInput').value = entry.title;
      document.getElementById('libUrlInput').value = entry.url;
      document.getElementById('libTypeInput').value = entry.type;
    }
  }
  renderLibraryItems();
}

function renderDay(){
  const dayKey = current;
  const day = routine[dayKey];
  const wrap = document.getElementById('dayContent');
  wrap.innerHTML = '';
  const [c1, c2] = DAY_COLORS[dayKey];

  const banner = document.createElement('div');
  banner.className = 'day-banner';
  // Misma cortina oscura que en las pestañas (ver ahí el porqué).
  banner.style.background = `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), linear-gradient(120deg, ${c1}, ${c2}, ${c1})`;
  banner.innerHTML = `<div class="name">${day.label}</div><div class="tag">${day.tag}</div>`;
  wrap.appendChild(banner);

  const progWrap = document.createElement('div');
  progWrap.className = 'progress-wrap';
  progWrap.innerHTML = `<div class="progress-track"><div class="progress-fill" id="progFill" style="background:linear-gradient(90deg, ${c1}, ${c2}, ${c1});"></div></div><div class="progress-label" id="progLabel">0/0</div>`;
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
    block.items.forEach((item) => {
      if (editingItemId === item.id){
        const editRow = document.createElement('div');
        editRow.className = 'item-edit-form';
        editRow.innerHTML = `
          <input type="text" class="item-edit-emoji" value="${escapeHtml(item.e)}" maxlength="4" aria-label="Emoji de la tarea">
          <input type="text" class="item-edit-text" value="${escapeHtml(item.t)}" aria-label="Texto de la tarea">
          <button type="button" class="item-edit-save">💾</button>
          <button type="button" class="item-edit-cancel">✕</button>
        `;
        editRow.querySelector('.item-edit-save').onclick = () => {
          const text = editRow.querySelector('.item-edit-text').value.trim();
          const emoji = editRow.querySelector('.item-edit-emoji').value.trim();
          if (!text) { alert('La tarea necesita un texto.'); return; }
          updateRoutineItem(dayKey, bIdx, item.id, text, emoji);
          editingItemId = null;
          renderDay();
        };
        editRow.querySelector('.item-edit-cancel').onclick = () => { editingItemId = null; renderDay(); };
        el.appendChild(editRow);
        return;
      }

      const isDone = state[dayKey].has(item.id);
      const row = document.createElement('label');
      row.className = 'item' + (item.special?' special':'') + (item.walk?' walk':'') + (item.wa?' wa':'') + (isDone?' done':'');
      row.innerHTML = `
        <input type="checkbox" class="item-checkbox" ${isDone ? 'checked' : ''}>
        <span class="checkbox" aria-hidden="true" style="${isDone ? `background:linear-gradient(135deg, ${c1}, ${c2}); border-color:${c1};` : `border-color:${c1};`}"><svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
        <span class="item-emoji" aria-hidden="true">${escapeHtml(item.e)}</span>
        <span class="item-text">${escapeHtml(item.t)}</span>
        <button type="button" class="item-edit-btn" aria-label="Editar ${escapeHtml(item.t)}">✏️</button>
        <button type="button" class="item-del-btn" aria-label="Borrar ${escapeHtml(item.t)}">✕</button>`;
      row.querySelector('.item-checkbox').addEventListener('click', (ev) => {
        const checked = ev.target.checked;
        if (checked) { state[dayKey].add(item.id); burstConfetti(ev.clientX, ev.clientY); }
        else { state[dayKey].delete(item.id); }
        saveCheckState();
        renderDay();
        const progressText = document.getElementById('progLabel')?.textContent || '';
        announce(`${checked ? 'Tarea marcada como hecha' : 'Tarea desmarcada'}: ${item.t}. Progreso ${progressText}.`);
      });
      row.querySelector('.item-edit-btn').addEventListener('click', (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        editingItemId = item.id; addingToBlock = null;
        renderDay();
      });
      row.querySelector('.item-del-btn').addEventListener('click', (ev) => {
        ev.preventDefault(); ev.stopPropagation();
        if (confirm(`¿Borrar la tarea "${item.t}"?`)) deleteRoutineItem(dayKey, bIdx, item.id);
        renderDay();
      });
      el.appendChild(row);
    });

    if (addingToBlock === bIdx){
      const addRow = document.createElement('div');
      addRow.className = 'item-edit-form';
      addRow.innerHTML = `
        <input type="text" class="item-add-emoji" placeholder="📌" maxlength="4" aria-label="Emoji de la nueva tarea">
        <input type="text" class="item-add-text" placeholder="Nueva tarea" aria-label="Texto de la nueva tarea">
        <button type="button" class="item-edit-save">+</button>
        <button type="button" class="item-edit-cancel">✕</button>
      `;
      addRow.querySelector('.item-edit-save').onclick = () => {
        const text = addRow.querySelector('.item-add-text').value.trim();
        const emoji = addRow.querySelector('.item-add-emoji').value.trim();
        if (!text) { alert('La tarea necesita un texto.'); return; }
        addRoutineItem(dayKey, bIdx, text, emoji);
        addingToBlock = null;
        renderDay();
      };
      addRow.querySelector('.item-edit-cancel').onclick = () => { addingToBlock = null; renderDay(); };
      el.appendChild(addRow);
    } else {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'block-add-btn';
      addBtn.textContent = '+ Agregar tarea';
      addBtn.onclick = () => { addingToBlock = bIdx; editingItemId = null; renderDay(); };
      el.appendChild(addBtn);
    }

    wrap.appendChild(el);
  });

  const { total, done } = countDone(dayKey);
  document.getElementById('progFill').style.width = (total? (done/total*100):0) + '%';
  document.getElementById('progLabel').textContent = done + '/' + total;
  renderStreakBadge();
}

renderTabs();
renderDay();
window.__appBooted = true;

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

// ---- Exportar / importar datos (respaldo manual, todo vive en localStorage) ----
function exportData(){
  const payload = {
    app: 'rutina-veronica',
    exportedAt: new Date().toISOString(),
    checklist: localStorage.getItem(CHECK_STORAGE_KEY),
    walks: localStorage.getItem(STORAGE_KEY),
    library: localStorage.getItem(LIB_STORAGE_KEY),
    birthdays: localStorage.getItem(BIRTHDAYS_STORAGE_KEY),
    routine: localStorage.getItem(ROUTINE_STORAGE_KEY),
    routineHistory: localStorage.getItem(STREAK_STORAGE_KEY),
    noticeDays: localStorage.getItem(NOTICE_DAYS_STORAGE_KEY),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rutina-veronica-backup-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function importData(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const payload = JSON.parse(reader.result);
      if (payload.app !== 'rutina-veronica') throw new Error('formato desconocido');
      if (!confirm('Esto va a reemplazar todos los datos actuales (rutina, cumpleaños, caminatas, biblioteca) con los del archivo. ¿Continuar?')) return;
      if (payload.checklist) localStorage.setItem(CHECK_STORAGE_KEY, payload.checklist);
      if (payload.walks) localStorage.setItem(STORAGE_KEY, payload.walks);
      if (payload.library) localStorage.setItem(LIB_STORAGE_KEY, payload.library);
      if (payload.birthdays) localStorage.setItem(BIRTHDAYS_STORAGE_KEY, payload.birthdays);
      if (payload.routine) localStorage.setItem(ROUTINE_STORAGE_KEY, payload.routine);
      if (payload.routineHistory) localStorage.setItem(STREAK_STORAGE_KEY, payload.routineHistory);
      if (payload.noticeDays) localStorage.setItem(NOTICE_DAYS_STORAGE_KEY, payload.noticeDays);
      alert('Datos importados correctamente. La página se va a recargar.');
      location.reload();
    }catch(e){
      console.error('No se pudo importar el archivo', e);
      alert('No se pudo leer el archivo. ¿Es un backup válido de esta app?');
    }
  };
  reader.readAsText(file);
}

const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
if (exportBtn) exportBtn.onclick = exportData;
if (importBtn && importFile){
  importBtn.onclick = () => importFile.click();
  importFile.onchange = (ev) => {
    const file = ev.target.files[0];
    if (file) importData(file);
    ev.target.value = '';
  };
}

// ---- PWA: registrar service worker (instalable + funciona offline) ----
if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((e) => {
      console.error('No se pudo registrar el service worker', e);
    });
  });
}

// ---- Recordatorios push (Nivel 16) + push de cumpleaños (Nivel 17) ----
// Public key VAPID: es pública por diseño (viaja en cualquier cliente que
// se suscriba), no es un secreto. La clave privada vive solo en el Worker.
const VAPID_PUBLIC_KEY = 'BKS7dha6Jk1ijHBI05bfuxaYk_Q_Lh028EfeUSndMCloJzHrfibh0Nmb18hnKru-dBnwhMG5nl9oFsDQt9NrBu0';
const PUSH_SERVER_URL = 'https://rutina-veronica-push.gustavopaine.workers.dev';

// Manda solo nombre/día/mes (sin categoría ni año) al Worker — es lo único
// que necesita para armar el aviso "mañana cumple Fulano". Se llama al
// activar recordatorios y en cada alta/edición/baja de un cumpleaños; si no
// hay suscripción activa no manda nada (el Worker igual la rechazaría, ver
// docs/specs/2026-08-18-nivel17-racha-cumples-caminata.md).
// No relee localStorage acá: usa el `birthdays` en memoria tal cual está
// (el llamador es responsable de que esté al día — ver saveBirthdays() y
// subscribeToReminders()). Releerlo acá pisaría un guardado que acaba de
// fallar con la versión vieja de disco, en vez de sincronizar la nueva.
async function syncBirthdaysToWorker(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try{
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    const payload = birthdays.map(b => ({ name: b.name, day: b.day, month: b.month }));
    const response = await fetch(`${PUSH_SERVER_URL}/birthdays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) console.error('El servidor de recordatorios rechazó la sincronización de cumpleaños', response.status);
  }catch(e){ console.error('No se pudo sincronizar los cumpleaños con el servidor de recordatorios', e); }
}

// ---- Días de anticipación del aviso de cumpleaños (Nivel 18) ----
const NOTICE_DAYS_STORAGE_KEY = 'veronica-birthday-notice-days';
const noticeDaysWrap = document.getElementById('noticeDaysWrap');
const noticeDaysInput = document.getElementById('noticeDaysInput');

function loadNoticeDays(){
  try{
    const raw = localStorage.getItem(NOTICE_DAYS_STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 1;
    return Number.isInteger(n) && n >= 1 && n <= 7 ? n : 1;
  }catch(e){ return 1; }
}
function saveNoticeDays(days){
  try{ localStorage.setItem(NOTICE_DAYS_STORAGE_KEY, String(days)); }
  catch(e){ console.error('No se pudo guardar los días de anticipación del cumpleaños', e); showSaveError('No se pudo guardar la preferencia de aviso de cumpleaños.'); }
}

// Mismo patrón best-effort que syncBirthdaysToWorker(): no hace nada si no
// hay suscripción activa (el Worker igual lo rechazaría).
async function syncNoticeDaysToWorker(){
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
  try{
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;
    const response = await fetch(`${PUSH_SERVER_URL}/notice-days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: loadNoticeDays() }),
    });
    if (!response.ok) console.error('El servidor de recordatorios rechazó los días de anticipación', response.status);
  }catch(e){ console.error('No se pudo sincronizar los días de anticipación con el servidor de recordatorios', e); }
}

if (noticeDaysInput){
  noticeDaysInput.value = String(loadNoticeDays());
  noticeDaysInput.onchange = () => {
    const days = parseInt(noticeDaysInput.value, 10);
    saveNoticeDays(days);
    syncNoticeDaysToWorker(); // fire-and-forget, mismo motivo que saveBirthdays()
  };
}

const reminderBtn = document.getElementById('reminderBtn');
const reminderStatus = document.getElementById('reminderStatus');

function setReminderStatus(text){
  if (reminderStatus) reminderStatus.textContent = text;
}

async function updateReminderButton(){
  if (!reminderBtn) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription){
    reminderBtn.textContent = '🔕 Desactivar recordatorios';
    setReminderStatus('Recordatorios activados: avisan todos los días al arrancar cada bloque (Mañana/Tarde/Noche).');
    if (noticeDaysWrap) noticeDaysWrap.hidden = false;
  } else {
    reminderBtn.textContent = '🔔 Activar recordatorios';
    setReminderStatus('');
    if (noticeDaysWrap) noticeDaysWrap.hidden = true;
  }
}

// Devuelve true si quedó realmente suscripto (navegador + Worker). false si
// no (permiso denegado, o el Worker no pudo guardar la suscripción) — en
// ese caso ya dejó su propio mensaje en reminderStatus, no lo pises.
async function subscribeToReminders(){
  const permission = await Notification.requestPermission();
  if (permission !== 'granted'){
    setReminderStatus('No se activaron los recordatorios: falta el permiso de notificaciones del navegador.');
    return false;
  }
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });
  const response = await fetch(`${PUSH_SERVER_URL}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
  if (!response.ok){
    // El navegador quedó suscripto pero el Worker no lo guardó: no sirve de
    // nada, así que la deshacemos en vez de mentir que quedó activado.
    await subscription.unsubscribe();
    setReminderStatus('No se pudo activar: el servidor de recordatorios no respondió. Probá de nuevo en un rato.');
    return false;
  }
  // Si nunca se visitó la pestaña Cumples esta sesión, `birthdays` sigue en
  // su valor inicial ([]) — hay que cargarlo antes de sincronizar.
  await loadBirthdays();
  await syncBirthdaysToWorker();
  await syncNoticeDaysToWorker();
  return true;
}

async function unsubscribeFromReminders(subscription){
  await subscription.unsubscribe();
  await fetch(`${PUSH_SERVER_URL}/unsubscribe`, { method: 'POST' }).catch(() => {});
}

if (reminderBtn && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window){
  reminderBtn.hidden = false;
  reminderBtn.onclick = async () => {
    reminderBtn.disabled = true;
    try{
      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      if (existing){
        await unsubscribeFromReminders(existing);
        await updateReminderButton();
      } else if (await subscribeToReminders()){
        await updateReminderButton();
      }
    }catch(e){
      console.error('No se pudo cambiar el estado de los recordatorios', e);
      setReminderStatus('Algo falló activando los recordatorios. Probá de nuevo.');
    }finally{
      reminderBtn.disabled = false;
    }
  };
  navigator.serviceWorker.ready.then(updateReminderButton).catch(() => {});
}
