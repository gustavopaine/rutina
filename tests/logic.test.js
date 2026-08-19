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
  weeklyForgivesRemaining,
  totalWalkDistanceKm,
  bestWalkDistanceKm,
  walkDistanceThisWeek,
  walkDistanceThisMonth,
  walkStreakDays,
  songOfTheDay,
  clothingSuggestion,
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

test('computeStreak: sin perdones (parámetro omitido), un hueco corta igual que antes', () => {
  const history = ['2026-08-17']; // lunes
  // martes 18 falta -> sin perdón, corta ahí. Hoy miércoles 19, completo.
  assert.equal(computeStreak(history, '2026-08-19', true), 1);
});

test('computeStreak: con perdón disponible, un hueco en la semana no corta la racha', () => {
  const history = ['2026-08-17']; // lunes de la semana 17-23 ago
  // martes 18 falta (se perdona) -> la racha sigue hasta el lunes.
  // hoy miércoles 19, completo.
  assert.equal(computeStreak(history, '2026-08-19', true, 1), 2);
});

test('computeStreak: dos huecos en la misma semana, el segundo sí corta (no acumulable)', () => {
  const history = ['2026-08-17', '2026-08-21']; // lunes y viernes, semana 17-23 ago
  // hoy lunes 24 (semana siguiente), completo. Camina hacia atrás: domingo 23
  // falta -> se perdona (único cupo de la semana 17-23); sábado 22 también
  // falta -> ya no queda perdón esa semana -> corta ahí, sin llegar a contar
  // el viernes 21 ni el lunes 17 aunque estén en el historial.
  assert.equal(computeStreak(history, '2026-08-24', true, 1), 1);
});

test('computeStreak: el perdón no usado en una semana no se acumula para la siguiente', () => {
  const history = [
    '2026-08-17', '2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', // semana 17-23, completa (perdón sin usar)
    '2026-08-25', '2026-08-28', '2026-08-29', '2026-08-30', // semana 24-30: faltan 24, 26, 27
  ];
  // hoy lunes 31 ago, completo. domingo 30, sábado 29, viernes 28 presentes;
  // jueves 27 falta -> se perdona (1er hueco de la semana 24-30); miércoles 26
  // falta -> ya no queda perdón esa semana -> corta ahí (no llega hasta el 17).
  assert.equal(computeStreak(history, '2026-08-31', true, 1), 4);
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

test('weeklyForgivesRemaining: lunes (sin días transcurridos todavía) da el cupo completo', () => {
  assert.equal(weeklyForgivesRemaining([], '2026-08-17', 1), 1); // 17 ago es lunes
});

test('weeklyForgivesRemaining: sin huecos esta semana, sigue disponible', () => {
  const history = ['2026-08-17', '2026-08-18']; // lunes y martes completos
  assert.equal(weeklyForgivesRemaining(history, '2026-08-19', 1), 1); // hoy miércoles
});

test('weeklyForgivesRemaining: un hueco esta semana ya lo consume', () => {
  const history = ['2026-08-17']; // falta el martes 18
  assert.equal(weeklyForgivesRemaining(history, '2026-08-19', 1), 0); // hoy miércoles
});

test('weeklyForgivesRemaining: no baja de 0 aunque haya más huecos que cupo', () => {
  const history = []; // faltan lunes y martes
  assert.equal(weeklyForgivesRemaining(history, '2026-08-19', 1), 0);
});

test('songOfTheDay: elige el mismo item todo el día, determinístico por fecha', () => {
  const list = ['A', 'B', 'C'];
  // 19 de agosto de 2026 es el día 231 del año; 231 % 3 === 0.
  assert.equal(songOfTheDay(list, new Date(2026, 7, 19)), 'A');
  assert.equal(songOfTheDay(list, new Date(2026, 7, 19, 23, 59)), 'A'); // misma fecha, otra hora
});

test('songOfTheDay: 1° de enero es el día 1 del año', () => {
  const list = ['A', 'B', 'C'];
  assert.equal(songOfTheDay(list, new Date(2026, 0, 1)), 'B'); // 1 % 3 === 1
});

test('songOfTheDay: lista vacía da null', () => {
  assert.equal(songOfTheDay([], new Date(2026, 7, 19)), null);
});

test('clothingSuggestion: frío sugiere abrigo', () => {
  assert.equal(clothingSuggestion(5, 0, 0), 'Abrigate bien 🧥');
});

test('clothingSuggestion: templado sugiere campera', () => {
  assert.equal(clothingSuggestion(15, 0, 0), 'Llevá campera 🧥');
  assert.equal(clothingSuggestion(10, 0, 0), 'Llevá campera 🧥'); // límite inferior
});

test('clothingSuggestion: agradable sugiere ropa liviana', () => {
  assert.equal(clothingSuggestion(20, 0, 0), 'Ropa liviana, puede refrescar a la noche 👕');
  assert.equal(clothingSuggestion(18, 0, 0), 'Ropa liviana, puede refrescar a la noche 👕'); // límite inferior
  assert.equal(clothingSuggestion(25, 0, 0), 'Ropa liviana, puede refrescar a la noche 👕'); // límite superior
});

test('clothingSuggestion: calor sugiere ropa fresca', () => {
  assert.equal(clothingSuggestion(30, 0, 0), 'Ropa fresca y mucha agua 🥤');
});

test('clothingSuggestion: agrega aviso de lluvia si hay precipitación', () => {
  assert.equal(clothingSuggestion(20, 5, 0), 'Ropa liviana, puede refrescar a la noche 👕 · ☔ Llevá paraguas');
});

test('clothingSuggestion: agrega aviso de viento si supera el umbral', () => {
  assert.equal(clothingSuggestion(20, 0, 40), 'Ropa liviana, puede refrescar a la noche 👕 · 💨 Hace viento, algo que no vuele');
});

test('clothingSuggestion: combina lluvia y viento si aplican los dos', () => {
  assert.equal(
    clothingSuggestion(5, 2, 40),
    'Abrigate bien 🧥 · ☔ Llevá paraguas · 💨 Hace viento, algo que no vuele'
  );
});
