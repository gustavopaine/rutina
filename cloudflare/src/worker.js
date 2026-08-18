import webpush from 'web-push';

// Único dato que este Worker guarda: la suscripción push (endpoint +
// claves públicas del navegador). Nunca recibe ni guarda contenido de la
// rutina (tareas, tildado, etc.) — ver docs/specs/2026-08-18-recordatorios-push.md.
const SUBSCRIPTION_KEY = 'veronica';

// event.cron -> texto de la notificación. Debe coincidir exactamente con
// los crons definidos en wrangler.toml.
const BLOCK_MESSAGES = {
  '0 9 * * 1-5':   { title: '🌅 Arrancó la Mañana',  body: 'Revisá tu rutina de hoy.' },
  '30 15 * * 1-5': { title: '☀️ Arrancó la Tarde',   body: 'Revisá tu rutina de hoy.' },
  '0 22 * * 1-5':  { title: '🌙 Arrancó la Noche',   body: 'Revisá tu rutina de hoy.' },
};

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

async function handleSubscribe(request, env){
  let sub;
  try {
    sub = await request.json();
  } catch {
    return new Response('JSON inválido', { status: 400, headers: corsHeaders(env) });
  }
  if (!isValidSubscription(sub)){
    return new Response('Suscripción con forma inválida', { status: 400, headers: corsHeaders(env) });
  }
  await env.SUBSCRIPTIONS.put(SUBSCRIPTION_KEY, JSON.stringify(sub));
  return new Response(null, { status: 204, headers: corsHeaders(env) });
}

async function handleUnsubscribe(request, env){
  await env.SUBSCRIPTIONS.delete(SUBSCRIPTION_KEY);
  return new Response(null, { status: 204, headers: corsHeaders(env) });
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
    return new Response('Not found', { status: 404, headers: corsHeaders(env) });
  },

  async scheduled(event, env){
    const message = BLOCK_MESSAGES[event.cron];
    if (!message) return; // cron desconocido, no debería pasar

    const raw = await env.SUBSCRIPTIONS.get(SUBSCRIPTION_KEY);
    if (!raw) return; // nadie suscripto, nada para mandar

    const subscription = JSON.parse(raw);
    webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);

    try {
      await webpush.sendNotification(subscription, JSON.stringify(message));
    } catch (err){
      // 404/410: el navegador invalidó la suscripción (reinstaló la app,
      // borró datos, etc.) — la limpiamos para no seguir reintentando algo
      // que nunca va a funcionar.
      if (err && (err.statusCode === 404 || err.statusCode === 410)){
        await env.SUBSCRIPTIONS.delete(SUBSCRIPTION_KEY);
      } else {
        throw err;
      }
    }
  },
};
