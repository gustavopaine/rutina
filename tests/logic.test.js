const test = require('node:test');
const assert = require('node:assert/strict');
const {
  haversine,
  formatDuration,
  daysUntilInfo,
  sortBirthdaysByNextOccurrence,
  todayKey,
  isoDate,
  geolocationErrorMessage,
  escapeHtml,
  urlBase64ToUint8Array,
  computeStreak,
  totalWalkDistanceKm,
  bestWalkDistanceKm,
  walkDistanceThisWeek,
  walkDistanceThisMonth,
  walkStreakDays,
} = require('../logic.js');

function toBase64Url(str){
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

test('haversine: mismo punto es distancia cero', () => {
  const p = { lat: -40.8135, lng: -62.9967 };
  assert.equal(haversine(p, p), 0);
});

test('haversine: 1 grado de latitud es ~111.2km', () => {
  const a = { lat: 0, lng: 0 };
  const b = { lat: 1, lng: 0 };
  const d = haversine(a, b);
  assert.ok(Math.abs(d - 111195) < 500, `esperaba ~111195m, dio ${d}`);
});

test('formatDuration: formatea minutos y segundos con padding', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(5000), '0:05');
  assert.equal(formatDuration(65000), '1:05');
  assert.equal(formatDuration(3600000), '60:00');
});

test('daysUntilInfo: cumpleaños más adelante este año', () => {
  const now = new Date(2026, 7, 17); // 17 de agosto de 2026
  const info = daysUntilInfo(8, 19, now); // 19 de agosto
  assert.equal(info.diff, 2);
});

test('daysUntilInfo: cumpleaños hoy da diff 0', () => {
  const now = new Date(2026, 7, 19);
  const info = daysUntilInfo(8, 19, now);
  assert.equal(info.diff, 0);
});

test('daysUntilInfo: cumpleaños ya pasado este año pasa al año que viene', () => {
  const now = new Date(2026, 7, 20); // un día después del cumpleaños
  const info = daysUntilInfo(8, 19, now);
  assert.equal(info.target.getFullYear(), 2027);
  assert.ok(info.diff > 300);
});

test('sortBirthdaysByNextOccurrence: ordena por fecha más próxima', () => {
  const now = new Date(2026, 7, 17);
  const list = [
    { name: 'A', day: 25, month: 12 },
    { name: 'B', day: 19, month: 8 },
    { name: 'C', day: 1, month: 1 },
  ];
  const sorted = sortBirthdaysByNextOccurrence(list, now);
  // B (19 ago) es lo más próximo; luego A (25 dic, este año); C (1 ene) recién
  // llega el año que viene, así que queda última.
  assert.deepEqual(sorted.map(b => b.name), ['B', 'A', 'C']);
});

test('todayKey: mapea getDay() de JS al orden de la semana de la app (arranca lunes)', () => {
  const order = ['lunes','martes','miercoles','jueves','viernes','sabado','domingo'];
  assert.equal(todayKey(new Date(2026, 7, 17), order), 'lunes');   // 17 ago 2026 es lunes
  assert.equal(todayKey(new Date(2026, 7, 23), order), 'domingo'); // 23 ago 2026 es domingo
});

test('isoDate: formatea como YYYY-MM-DD con ceros a la izquierda', () => {
  assert.equal(isoDate(new Date(2026, 7, 17)), '2026-08-17');
  assert.equal(isoDate(new Date(2026, 0, 5)), '2026-01-05');
});

test('geolocationErrorMessage: distingue los códigos de error conocidos', () => {
  const denied = { code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
  const unavailable = { code: 2, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
  const timeout = { code: 3, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
  assert.match(geolocationErrorMessage(denied), /permiso/i);
  assert.match(geolocationErrorMessage(unavailable), /GPS/i);
  assert.match(geolocationErrorMessage(timeout), /Tard/i);
});

test('escapeHtml: neutraliza etiquetas y comillas (evita romper el HTML de vuelta)', () => {
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(escapeHtml('Nombre "raro" & cía'), 'Nombre &quot;raro&quot; &amp; cía');
  assert.equal(escapeHtml(`" onmouseover="alert(1)`), '&quot; onmouseover=&quot;alert(1)');
});

test('escapeHtml: no toca texto normal (sin caracteres especiales)', () => {
  assert.equal(escapeHtml('Café / mate y desayuno'), 'Café / mate y desayuno');
  assert.equal(escapeHtml('🚗'), '🚗');
});

test('urlBase64ToUint8Array: decodifica bytes correctos ida y vuelta', () => {
  const original = 'hello';
  const bytes = urlBase64ToUint8Array(toBase64Url(original));
  assert.deepEqual(Array.from(bytes), Array.from(Buffer.from(original)));
});

test('urlBase64ToUint8Array: maneja distintos largos de padding (0-3 caracteres de relleno)', () => {
  for (const original of ['a', 'ab', 'abc', 'abcd']){
    const bytes = urlBase64ToUint8Array(toBase64Url(original));
    assert.equal(Buffer.from(bytes).toString(), original, `falló con "${original}"`);
  }
});

test('urlBase64ToUint8Array: acepta los caracteres URL-safe "-" y "_"', () => {
  // Bytes elegidos para que la codificación base64 estándar use "+" y "/",
  // así el test cubre el reemplazo a variante URL-safe.
  const rawBytes = Uint8Array.from([251, 255, 191]);
  const standardBase64 = Buffer.from(rawBytes).toString('base64'); // "+/+/"-ish
  assert.ok(standardBase64.includes('+') || standardBase64.includes('/'), 'el fixture no ejercita +/ como se esperaba');
  const urlSafe = standardBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const bytes = urlBase64ToUint8Array(urlSafe);
  assert.deepEqual(Array.from(bytes), Array.from(rawBytes));
});

test('computeStreak: racha vacía da 0', () => {
  assert.equal(computeStreak([], '2026-08-17', false), 0);
});

test('computeStreak: racha consecutiva hasta ayer, hoy sin completar', () => {
  const history = ['2026-08-14', '2026-08-15', '2026-08-16'];
  assert.equal(computeStreak(history, '2026-08-17', false), 3);
});

test('computeStreak: hoy completo suma uno más sobre la racha de ayer', () => {
  const history = ['2026-08-14', '2026-08-15', '2026-08-16'];
  assert.equal(computeStreak(history, '2026-08-17', true), 4);
});

test('computeStreak: un hueco corta la racha', () => {
  const history = ['2026-08-10', '2026-08-15', '2026-08-16']; // falta el 14
  assert.equal(computeStreak(history, '2026-08-17', false), 2);
});

test('computeStreak: solo hoy completo, sin historial previo', () => {
  assert.equal(computeStreak([], '2026-08-17', true), 1);
});

test('totalWalkDistanceKm: suma todas las sesiones, con o sin timestamp', () => {
  const history = [{ distanceKm: '2.50' }, { distanceKm: '1.25', timestamp: 1 }, { distanceKm: '0.75' }];
  assert.equal(totalWalkDistanceKm(history), 4.5);
});

test('totalWalkDistanceKm: historial vacío da 0', () => {
  assert.equal(totalWalkDistanceKm([]), 0);
});

test('bestWalkDistanceKm: la mayor distancia de todo el historial', () => {
  const history = [{ distanceKm: '2.50' }, { distanceKm: '5.10' }, { distanceKm: '0.75' }];
  assert.equal(bestWalkDistanceKm(history), 5.1);
});

test('bestWalkDistanceKm: historial vacío da 0', () => {
  assert.equal(bestWalkDistanceKm([]), 0);
});

test('walkDistanceThisWeek: solo cuenta sesiones con timestamp desde el lunes', () => {
  const now = new Date(2026, 7, 17); // lunes 17 de agosto de 2026
  const history = [
    { distanceKm: '1.00', timestamp: new Date(2026, 7, 16).getTime() }, // domingo, semana anterior
    { distanceKm: '2.00', timestamp: new Date(2026, 7, 17, 8).getTime() }, // hoy, lunes
    { distanceKm: '3.00' }, // sin timestamp, caminata vieja
  ];
  assert.equal(walkDistanceThisWeek(history, now), 2);
});

test('walkDistanceThisMonth: solo cuenta sesiones con timestamp del mes actual', () => {
  const now = new Date(2026, 7, 17);
  const history = [
    { distanceKm: '1.00', timestamp: new Date(2026, 6, 31).getTime() }, // julio
    { distanceKm: '4.00', timestamp: new Date(2026, 7, 1).getTime() }, // agosto
  ];
  assert.equal(walkDistanceThisMonth(history, now), 4);
});

test('walkStreakDays: cuenta días consecutivos con caminata, hoy incluido', () => {
  const history = [
    { distanceKm: '1', timestamp: new Date(2026, 7, 15).getTime() },
    { distanceKm: '1', timestamp: new Date(2026, 7, 16).getTime() },
    { distanceKm: '1', timestamp: new Date(2026, 7, 17).getTime() },
  ];
  assert.equal(walkStreakDays(history, '2026-08-17'), 3);
});

test('walkStreakDays: sin caminata hoy, la racha es la de hasta ayer', () => {
  const history = [
    { distanceKm: '1', timestamp: new Date(2026, 7, 15).getTime() },
    { distanceKm: '1', timestamp: new Date(2026, 7, 16).getTime() },
  ];
  assert.equal(walkStreakDays(history, '2026-08-17'), 2);
});

test('walkStreakDays: sin ninguna caminata da 0', () => {
  assert.equal(walkStreakDays([], '2026-08-17'), 0);
});
