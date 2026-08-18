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
} = require('../logic.js');

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
