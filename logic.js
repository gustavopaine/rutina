/* Lógica pura, sin DOM, para poder testearla con Node (ver /tests).
   Se carga como <script> global en el navegador (window.RutinaLogic) y
   como módulo CommonJS en los tests (require('../logic.js')). */
(function (root) {

  // Perdones de racha de rutina por semana calendario (Nivel 18) — fuente
  // única de verdad, usada por app.js (computeStreak/weeklyForgivesRemaining)
  // y por los tests, para que no puedan quedar desincronizados entre sí.
  const STREAK_FORGIVE_PER_WEEK = 1;

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

  function daysUntilInfo(month, day, now){
    const today = new Date(now || Date.now()); today.setHours(0,0,0,0);
    let year = today.getFullYear();
    let target = new Date(year, month-1, day); target.setHours(0,0,0,0);
    if (target < today) target = new Date(year+1, month-1, day);
    const diff = Math.round((target - today) / 86400000);
    return { diff, target };
  }

  function sortBirthdaysByNextOccurrence(list, now){
    return list.map(b => {
      const info = daysUntilInfo(b.month, b.day, now);
      return { ...b, diff: info.diff, targetMonth: info.target.getMonth() };
    }).sort((a,b) => a.diff - b.diff);
  }

  // Offset lunes=0..domingo=6 a partir de getDay() (0=domingo..6=sabado).
  // Compartido por todayKey() y walkDistanceThisWeek() más abajo — mismo
  // criterio de "la semana arranca el lunes" en todo el archivo.
  function mondayOffset(now){
    return (now.getDay() + 6) % 7;
  }

  function todayKey(now, order){
    return order[mondayOffset(now)];
  }

  function isoDate(now){
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function escapeHtml(str){
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Convierte la VAPID public key (base64 URL-safe) al Uint8Array que pide
  // pushManager.subscribe({ applicationServerKey }).
  function urlBase64ToUint8Array(base64String){
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++){
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  function mondayOfWeek(date){
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset(date));
  }

  // Día del año (1 = 1° de enero) a partir de las fechas UTC-normalizadas de
  // los componentes locales — evita cualquier corrimiento de una hora por
  // DST (Argentina no tiene, pero así no depende de en qué huso corre el
  // navegador/test). Usado por songOfTheDay() para elegir determinísticamente.
  function dayOfYear(now){
    const startUTC = Date.UTC(now.getFullYear(), 0, 1);
    const nowUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((nowUTC - startUTC) / 86400000) + 1;
  }

  // Elige un ítem de `list` de forma determinística por fecha (mismo tema
  // todo el día, distinto al día siguiente) — nada al azar, mismo criterio
  // que el resto de la app (Nivel 19: canción del día).
  function songOfTheDay(list, now){
    if (!list || !list.length) return null;
    return list[dayOfYear(now) % list.length];
  }

  // Sugerencia de vestimenta según temperatura/lluvia/viento (Nivel 19).
  // Umbrales a criterio propio (clima templado de la Patagonia Norte),
  // triviales de ajustar — son constantes en una sola función.
  function clothingSuggestion(tempC, precipMm, windKmh){
    let base;
    if (tempC < 10) base = 'Abrigate bien 🧥';
    else if (tempC < 18) base = 'Llevá campera 🧥';
    else if (tempC <= 25) base = 'Ropa liviana, puede refrescar a la noche 👕';
    else base = 'Ropa fresca y mucha agua 🥤';
    const extras = [];
    if (precipMm > 0) extras.push('☔ Llevá paraguas');
    if (windKmh > 30) extras.push('💨 Hace viento, algo que no vuele');
    return [base, ...extras].join(' · ');
  }

  // Cuenta hacia atrás desde hoy mientras haya fechas calendario consecutivas
  // en historyDates. historyDates son días ya "cerrados" (persistidos);
  // todayCompleted cubre el día de hoy aparte, que todavía no se guardó en el
  // historial pero ya puede estar completo. Reusado por la racha de rutina y
  // la de caminata (walkStreakDays no pasa forgivePerWeek, o sea 0 = sin
  // perdones, cualquier hueco corta — mismo comportamiento de siempre).
  //
  // forgivePerWeek (Nivel 18, default 0): cuántos huecos por semana
  // calendario (lunes a domingo) no cortan la racha. No acumulable: el cupo
  // de una semana no usado no pasa a la semana siguiente. El día perdonado
  // no suma a la racha (no se completó de verdad), pero tampoco la corta.
  function computeStreak(historyDates, todayIso, todayCompleted, forgivePerWeek = 0){
    const dates = historyDates instanceof Set ? historyDates : new Set(historyDates);
    const [y, m, d] = todayIso.split('-').map(Number);
    let streak = todayCompleted ? 1 : 0;
    const cursor = new Date(y, m - 1, d - 1); // día anterior a hoy
    const forgivenPerWeekKey = new Map();
    while (true){
      const iso = isoDate(cursor);
      if (dates.has(iso)){
        streak++;
      } else if (forgivePerWeek > 0){
        const weekKey = isoDate(mondayOfWeek(cursor));
        const used = forgivenPerWeekKey.get(weekKey) || 0;
        if (used >= forgivePerWeek) break;
        forgivenPerWeekKey.set(weekKey, used + 1);
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  // Cuántos perdones quedan disponibles esta semana calendario (lunes a
  // "ayer", hoy no cuenta como día perdido todavía) — para mostrar el
  // indicador junto al badge de racha (Nivel 18). Mismo criterio de semana
  // que computeStreak(); no hace falta caminar hacia atrás más de una
  // semana porque el perdón no se acumula entre semanas.
  function weeklyForgivesRemaining(historyDates, todayIso, forgivePerWeek){
    const dates = historyDates instanceof Set ? historyDates : new Set(historyDates);
    const [y, m, d] = todayIso.split('-').map(Number);
    const today = new Date(y, m - 1, d);
    const cursor = mondayOfWeek(today);
    let missed = 0;
    while (cursor < today){
      if (!dates.has(isoDate(cursor))) missed++;
      cursor.setDate(cursor.getDate() + 1);
    }
    return Math.max(0, forgivePerWeek - missed);
  }

  function totalWalkDistanceKm(history){
    return history.reduce((sum, s) => sum + (parseFloat(s.distanceKm) || 0), 0);
  }

  function bestWalkDistanceKm(history){
    return history.reduce((max, s) => Math.max(max, parseFloat(s.distanceKm) || 0), 0);
  }

  function sumWalkDistanceSince(history, sinceMs){
    return history
      .filter(s => typeof s.timestamp === 'number' && s.timestamp >= sinceMs)
      .reduce((sum, s) => sum + (parseFloat(s.distanceKm) || 0), 0);
  }

  // Semana empieza el lunes (mismo criterio que ORDER/todayKey en el resto de la app).
  function walkDistanceThisWeek(history, now){
    return sumWalkDistanceSince(history, mondayOfWeek(now).getTime());
  }

  function walkDistanceThisMonth(history, now){
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return sumWalkDistanceSince(history, start);
  }

  // Días distintos con al menos una caminata con timestamp, en racha hacia
  // atrás desde hoy — mismo algoritmo que la racha de rutina (computeStreak).
  function walkStreakDays(history, todayIso){
    const dates = new Set();
    history.forEach(s => {
      if (typeof s.timestamp === 'number') dates.add(isoDate(new Date(s.timestamp)));
    });
    const todayCompleted = dates.has(todayIso);
    dates.delete(todayIso);
    return computeStreak(dates, todayIso, todayCompleted);
  }

  // ---- Calendario Menstrual (Nivel 21) ----
  // Ciclo: { id, startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD"|null }.
  // endDate null = período en curso (sin cerrar). Comparación de fechas ISO
  // con operadores de string (<, >=) en vez de convertir a Date: funciona
  // porque el formato YYYY-MM-DD ordena igual lexicográfica y
  // cronológicamente, y evita reintroducir problemas de huso horario/DST
  // que ya se evitaron en el resto del archivo (ver dayOfYear()).
  const CYCLE_DEFAULT_LENGTH_DAYS = 28;
  const PERIOD_DEFAULT_LENGTH_DAYS = 5;
  const LUTEAL_PHASE_DAYS = 14; // días entre ovulación y el próximo período, ~constante
  const FERTILE_WINDOW_BEFORE_OVULATION_DAYS = 5;
  const FERTILE_WINDOW_AFTER_OVULATION_DAYS = 1;

  function parseIsoDate(iso){
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  function addDaysIso(iso, days){
    const d = parseIsoDate(iso);
    d.setDate(d.getDate() + days);
    return isoDate(d);
  }

  function daysBetweenIso(aIso, bIso){
    return Math.round((parseIsoDate(bIso) - parseIsoDate(aIso)) / 86400000);
  }

  // La entrada con el startDate más reciente — no asume que `history` venga
  // ordenado (puede no estarlo si se cargaron ciclos viejos después de los
  // nuevos, ver Risks del spec de Nivel 21).
  function mostRecentCycleEntry(history){
    if (!history || !history.length) return null;
    return [...history].sort((a, b) => (a.startDate < b.startDate ? 1 : -1))[0];
  }

  // Duración derivada de una entrada cerrada (endDate-startDate+1 días,
  // inclusive). null si sigue abierta — se exporta para que app.js no
  // duplique este cálculo al mostrar el historial.
  function periodLengthDays(entry){
    if (!entry.endDate) return null;
    return daysBetweenIso(entry.startDate, entry.endDate) + 1; // inclusive
  }

  // Promedio de duración de período sobre los `maxCycles` ciclos CERRADOS
  // más recientes. Sin ningún ciclo cerrado todavía, usa el default clínico
  // (5 días) en vez de no mostrar nada — decidido con el usuario.
  function averagePeriodLengthDays(history, maxCycles = 6){
    const closed = (history || [])
      .filter(e => e.endDate)
      .sort((a, b) => (a.startDate < b.startDate ? 1 : -1))
      .slice(0, maxCycles);
    if (!closed.length) return PERIOD_DEFAULT_LENGTH_DAYS;
    return closed.reduce((sum, e) => sum + periodLengthDays(e), 0) / closed.length;
  }

  // Promedio de duración de ciclo: diferencia en días entre startDate
  // consecutivos (ordenados cronológicamente), sobre los `maxCycles` gaps
  // más recientes. Con menos de 2 entradas no hay ningún gap que promediar,
  // usa el default clínico (28 días) — mismo criterio que arriba.
  function averageCycleLengthDays(history, maxCycles = 6){
    const sorted = [...(history || [])].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));
    const gaps = [];
    for (let i = 1; i < sorted.length; i++){
      gaps.push(daysBetweenIso(sorted[i - 1].startDate, sorted[i].startDate));
    }
    if (!gaps.length) return CYCLE_DEFAULT_LENGTH_DAYS;
    const recent = gaps.slice(-maxCycles);
    return recent.reduce((sum, g) => sum + g, 0) / recent.length;
  }

  // Día actual del ciclo (1 = el propio día de inicio), contado desde la
  // entrada más reciente. null sin ningún ciclo registrado todavía — no hay
  // fecha ancla de la cual contar.
  function currentCycleDay(history, now){
    const entry = mostRecentCycleEntry(history);
    if (!entry) return null;
    return daysBetweenIso(entry.startDate, isoDate(now)) + 1;
  }

  // Fecha estimada del próximo período: inicio de la entrada más reciente +
  // promedio de duración de ciclo, avanzando de a un ciclo completo hasta
  // llegar a una fecha >= hoy. null sin historial (no hay desde dónde
  // proyectar) — a diferencia de los promedios de arriba, acá SÍ hace falta
  // al menos 1 ciclo cargado (el "0 ciclos" del spec es un caso distinto de
  // "1 ciclo sin promedio propio todavía", que sí devuelve una fecha usando
  // el default de averageCycleLengthDays).
  //
  // Sin el avance por ciclos, un historial desactualizado (nada cargado
  // hace varios meses) proyectaría una única vez desde el último inicio y
  // devolvería una fecha ya pasada, en vez de la próxima ocurrencia real —
  // "próximo período" tiene que ser relativo a `now`, no solo al último
  // dato cargado (mismo criterio que el resto de las funciones de este
  // archivo, que sí usan `now`).
  function predictNextPeriod(history, now){
    const entry = mostRecentCycleEntry(history);
    if (!entry) return null;
    const avgCycle = Math.max(1, Math.round(averageCycleLengthDays(history))); // mínimo 1: evita loop infinito con datos degenerados
    const todayIso = isoDate(now);
    let next = addDaysIso(entry.startDate, avgCycle);
    while (next < todayIso){
      next = addDaysIso(next, avgCycle);
    }
    return next;
  }

  // Ventana fértil estimada del ciclo actual: ovulación ≈ próximo período −
  // 14 días (fase lútea, se mantiene razonablemente constante aunque el
  // ciclo completo varíe); ventana = [ovulación−5, ovulación+1], mismo rango
  // de 6 días que usan Flo/Clue. Estimación de calendario aproximada, no un
  // método anticonceptivo ni de fertilidad clínico.
  function predictFertileWindow(history, now){
    const next = predictNextPeriod(history, now);
    if (!next) return null;
    const ovulation = addDaysIso(next, -LUTEAL_PHASE_DAYS);
    return {
      start: addDaysIso(ovulation, -FERTILE_WINDOW_BEFORE_OVULATION_DAYS),
      end: addDaysIso(ovulation, FERTILE_WINDOW_AFTER_OVULATION_DAYS),
    };
  }

  // Fase actual: 'menstruacion' | 'fertil' | 'otro', o null sin historial.
  // Mientras la entrada más reciente siga abierta (endDate null) se
  // considera que el período sigue en curso indefinidamente, sin importar
  // cuánto tiempo pasó desde que empezó — se cierra recién cuando el
  // usuario le agrega una fecha de fin (ver spec, "Ya decididas").
  function cyclePhase(history, now){
    const entry = mostRecentCycleEntry(history);
    if (!entry) return null;
    const todayIso = isoDate(now);
    const inPeriod = entry.endDate
      ? (todayIso >= entry.startDate && todayIso <= entry.endDate)
      : (todayIso >= entry.startDate);
    if (inPeriod) return 'menstruacion';
    const window = predictFertileWindow(history, now);
    if (window && todayIso >= window.start && todayIso <= window.end) return 'fertil';
    return 'otro';
  }

  // Frase al azar del banco de motivación (Nivel 23) — a diferencia de
  // songOfTheDay() (determinístico por fecha, a propósito), acá cada
  // celebración de bloque sortea una frase distinta. randomFn inyectable
  // (default Math.random) para que el test controle el resultado sin
  // mockear el global — mismo criterio que el resto de logic.js recibe
  // sus variables por parámetro en vez de leerlas del entorno.
  function pickRandomPhrase(phrases, randomFn = Math.random){
    if (!phrases || !phrases.length) return null;
    const idx = Math.min(Math.floor(randomFn() * phrases.length), phrases.length - 1);
    return phrases[idx];
  }

  function geolocationErrorMessage(err){
    if (err.code === err.PERMISSION_DENIED){
      return 'No diste permiso de ubicación. Revisá los permisos de este sitio en la configuración del navegador o del celular y volvé a intentar.';
    }
    if (err.code === err.POSITION_UNAVAILABLE){
      return 'No se pudo obtener tu ubicación. Verificá que el GPS esté activado.';
    }
    if (err.code === err.TIMEOUT){
      return 'Tardó demasiado en encontrar tu ubicación. Probá de nuevo en un lugar más despejado (a cielo abierto).';
    }
    return 'No pude acceder a la ubicación. Revisá los permisos del navegador.';
  }

  const api = { haversine, formatDuration, daysUntilInfo, sortBirthdaysByNextOccurrence, todayKey, isoDate, geolocationErrorMessage, escapeHtml, urlBase64ToUint8Array, computeStreak, weeklyForgivesRemaining, STREAK_FORGIVE_PER_WEEK, totalWalkDistanceKm, bestWalkDistanceKm, walkDistanceThisWeek, walkDistanceThisMonth, walkStreakDays, songOfTheDay, clothingSuggestion, mondayOfWeek, averagePeriodLengthDays, averageCycleLengthDays, currentCycleDay, predictNextPeriod, predictFertileWindow, cyclePhase, periodLengthDays, pickRandomPhrase };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RutinaLogic = api;

})(typeof window !== 'undefined' ? window : globalThis);
