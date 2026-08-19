import webpush from 'web-push';

// Datos que este Worker guarda: la suscripción push (endpoint + claves
// públicas del navegador) y, desde el Nivel 17, la lista de cumpleaños a
// avisar (solo nombre/día/mes — nunca año de nacimiento ni categoría).
// Nunca recibe ni guarda contenido de la rutina (tareas, tildado, etc.) —
// ver docs/specs/2026-08-18-recordatorios-push.md y
// docs/specs/2026-08-18-nivel17-racha-cumples-caminata.md.
const SUBSCRIPTION_KEY = 'veronica';
const BIRTHDAYS_KEY = 'birthdays';
// Días de anticipación del aviso de cumpleaños (Nivel 18) — configurable
// desde la UI, 1 si nunca se guardó ninguno (mismo comportamiento que
// antes de este nivel).
const NOTICE_DAYS_KEY = 'notice-days';
const DEFAULT_NOTICE_DAYS = 1;

// event.cron -> texto de la notificación. Debe coincidir CARÁCTER A
// CARÁCTER con los crons definidos en wrangler.toml (Cloudflare no
// normaliza el string). Cloudflare numera el día de semana 1=domingo..
// 7=sábado (distinto del estándar 0=domingo..6=sábado) — se usan
// abreviaturas de 3 letras en vez de números para no pisarla de nuevo.
const BLOCK_MESSAGES = {
  '0 9 * * MON-FRI':   { title: '🌅 Arrancó la Mañana',  body: 'Revisá tu rutina de hoy.' },
  '30 15 * * MON-FRI': { title: '☀️ Arrancó la Tarde',   body: 'Revisá tu rutina de hoy.' },
  '0 22 * * MON-FRI':  { title: '🌙 Arrancó la Noche',   body: 'Revisá tu rutina de hoy.' },
};
// Cron diario del aviso de cumpleaños (8:00 ART = 11:00 UTC, ver wrangler.toml).
const BIRTHDAY_CRON = '0 11 * * *';

// Fin de semana (Nivel 18): el plan free de Cloudflare permite 5 Cron
// Triggers por cuenta, así que los 3 bloques de sábado/domingo comparten
// UN cron combinado ("0 0,12,17 * * SAT,SUN,MON", ver wrangler.toml) en
// vez de uno cada uno. Ese cron dispara en 9 combinaciones hora×día; solo
// 6 corresponden a un horario ART real (9/14/21 hs sábado y domingo), las
// otras 3 son subproducto del cruce y no hacen nada. Se identifica el
// horario real con la hora/día ART (no con event.cron, que es el mismo
// string para las 9) — mismo truco de -3h que argentinaPlusDays().
const WEEKEND_CRON = '0 0,12,17 * * SAT,SUN,MON';
// Sábado y domingo mandan el mismo texto, así que la clave es solo la hora
// ART — el chequeo de "es sábado o domingo" va aparte en weekendMessageFor().
const WEEKEND_MESSAGES = {
  9:  { title: '🌅 Arrancó la Mañana', body: 'Revisá tu rutina de hoy.' },
  14: { title: '☀️ Arrancó la Tarde',  body: 'Revisá tu rutina de hoy.' },
  21: { title: '🌙 Arrancó la Noche',  body: 'Revisá tu rutina de hoy.' },
};
function weekendMessageFor(now){
  const art = new Date(now.getTime() - 3 * 3600 * 1000);
  const weekday = art.getUTCDay(); // 0=domingo..6=sábado
  if (weekday !== 0 && weekday !== 6) return null; // lunes espurio del cruce hora×día
  return WEEKEND_MESSAGES[art.getUTCHours()] || null;
}

function corsHeaders(env){
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function isValidSubscription(sub){
  return sub
    && typeof sub.endpoint === 'string'
    && sub.keys
    && typeof sub.keys.p256dh === 'string'
    && typeof sub.keys.auth === 'string';
}

function isValidBirthdayList(list){
  return Array.isArray(list) && list.every(b =>
    b && typeof b.name === 'string' && b.name.trim().length > 0
    && Number.isInteger(b.day) && b.day >= 1 && b.day <= 31
    && Number.isInteger(b.month) && b.month >= 1 && b.month <= 12
  );
}

// Comparte el envío + la limpieza de suscripciones muertas entre el aviso
// de bloque de rutina y el de cumpleaños (antes duplicado en scheduled()).
async function sendPush(env, subscription, message){
  webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  try {
    await webpush.sendNotification(subscription, JSON.stringify(message));
  } catch (err){
    // 404/410: el navegador invalidó la suscripción (reinstaló la app,
    // borró datos, etc.) — la limpiamos, y con ella los cumpleaños (no
    // tiene dueño a quién avisarle), para no seguir reintentando algo que
    // nunca va a funcionar.
    if (err && (err.statusCode === 404 || err.statusCode === 410)){
      await env.SUBSCRIPTIONS.delete(SUBSCRIPTION_KEY);
      await env.SUBSCRIPTIONS.delete(BIRTHDAYS_KEY);
      await env.SUBSCRIPTIONS.delete(NOTICE_DAYS_KEY);
    } else {
      throw err;
    }
  }
}

// Parsea el body como JSON; { ok:false, response } con un 400 ya armado si
// falla, o { ok:true, data }. Compartido entre /subscribe y /birthdays.
async function parseJsonBody(request, env){
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: new Response('JSON inválido', { status: 400, headers: corsHeaders(env) }) };
  }
}

async function handleSubscribe(request, env){
  const parsed = await parseJsonBody(request, env);
  if (!parsed.ok) return parsed.response;
  const sub = parsed.data;
  if (!isValidSubscription(sub)){
    return new Response('Suscripción con forma inválida', { status: 400, headers: corsHeaders(env) });
  }
  await env.SUBSCRIPTIONS.put(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

async function handleUnsubscribe(request, env){
  await env.SUBSCRIPTIONS.delete(SUBSCRIPTION_KEY);
  await env.SUBSCRIPTIONS.delete(BIRTHDAYS_KEY);
  await env.SUBSCRIPTIONS.delete(NOTICE_DAYS_KEY);
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

async function handleBirthdays(request, env){
  // Sin dueño a quién avisarle no tiene sentido guardar el dato.
  const hasSubscription = await env.SUBSCRIPTIONS.get(SUBSCRIPTION_KEY);
  if (!hasSubscription){
    return new Response('No hay suscripción activa', { status: 400, headers: corsHeaders(env) });
  }
  const parsed = await parseJsonBody(request, env);
  if (!parsed.ok) return parsed.response;
  const list = parsed.data;
  if (!isValidBirthdayList(list)){
    return new Response('Lista de cumpleaños con forma inválida', { status: 400, headers: corsHeaders(env) });
  }
  await env.SUBSCRIPTIONS.put(BIRTHDAYS_KEY, JSON.stringify(list));
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

async function handleNoticeDays(request, env){
  const hasSubscription = await env.SUBSCRIPTIONS.get(SUBSCRIPTION_KEY);
  if (!hasSubscription){
    return new Response('No hay suscripción activa', { status: 400, headers: corsHeaders(env) });
  }
  const parsed = await parseJsonBody(request, env);
  if (!parsed.ok) return parsed.response;
  const days = parsed.data && parsed.data.days;
  if (!Number.isInteger(days) || days < 1 || days > 7){
    return new Response('Días de anticipación inválidos (1-7)', { status: 400, headers: corsHeaders(env) });
  }
  await env.SUBSCRIPTIONS.put(NOTICE_DAYS_KEY, String(days));
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

// Argentina es UTC-3 fijo (sin horario de verano desde 2009) — restar 3h al
// timestamp UTC actual da la hora Argentina sin depender de la zona horaria
// del runtime. Devuelve el día/mes calendario argentino dentro de `days`
// días (Nivel 18: antes fijo en "mañana", ahora configurable).
function argentinaPlusDays(now, days){
  const art = new Date(now.getTime() - 3 * 3600 * 1000);
  const target = new Date(Date.UTC(art.getUTCFullYear(), art.getUTCMonth(), art.getUTCDate() + days));
  return { day: target.getUTCDate(), month: target.getUTCMonth() + 1 };
}

async function handleBirthdayCron(env, now){
  const rawSub = await env.SUBSCRIPTIONS.get(SUBSCRIPTION_KEY);
  if (!rawSub) return; // nadie suscripto, nada para mandar

  const rawBirthdays = await env.SUBSCRIPTIONS.get(BIRTHDAYS_KEY);
  if (!rawBirthdays) return;

  const rawNoticeDays = await env.SUBSCRIPTIONS.get(NOTICE_DAYS_KEY);
  const parsedNoticeDays = rawNoticeDays ? parseInt(rawNoticeDays, 10) : DEFAULT_NOTICE_DAYS;
  const noticeDays = Number.isInteger(parsedNoticeDays) && parsedNoticeDays >= 1 && parsedNoticeDays <= 7
    ? parsedNoticeDays
    : DEFAULT_NOTICE_DAYS;

  const birthdays = JSON.parse(rawBirthdays);
  const { day, month } = argentinaPlusDays(now, noticeDays);
  const matches = birthdays.filter(b => b.day === day && b.month === month);
  if (!matches.length) return;

  const when = noticeDays === 1 ? 'Mañana' : `En ${noticeDays} días`;
  const message = { title: `🎂 ${when} cumple: ` + matches.map(b => b.name).join(', '), body: '¡No te olvides de saludar!' };
  await sendPush(env, JSON.parse(rawSub), message);
}

export default {
  async fetch(request, env){
    const { pathname } = new URL(request.url);

    if (request.method === 'OPTIONS'){
      return new Response(null, { headers: corsHeaders(env) });
    }
    if (request.method === 'POST' && pathname === '/subscribe'){
      return handleSubscribe(request, env);
    }
    if (request.method === 'POST' && pathname === '/unsubscribe'){
      return handleUnsubscribe(request, env);
    }
    if (request.method === 'POST' && pathname === '/birthdays'){
      return handleBirthdays(request, env);
    }
    if (request.method === 'POST' && pathname === '/notice-days'){
      return handleNoticeDays(request, env);
    }
    return new Response('Not found', { status: 404, headers: corsHeaders(env) });
  },

  async scheduled(event, env){
    const now = new Date(event.scheduledTime);

    if (event.cron === BIRTHDAY_CRON){
      await handleBirthdayCron(env, now);
      return;
    }

    const message = event.cron === WEEKEND_CRON
      ? weekendMessageFor(now) // null en los 3 disparos espurios del cruce hora×día
      : BLOCK_MESSAGES[event.cron];
    if (!message) return; // cron desconocido o disparo espurio de fin de semana

    const raw = await env.SUBSCRIPTIONS.get(SUBSCRIPTION_KEY);
    if (!raw) return; // nadie suscripto, nada para mandar

    await sendPush(env, JSON.parse(raw), message);
  },
};
