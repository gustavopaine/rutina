/* Lógica pura, sin DOM, para poder testearla con Node (ver /tests).
   Se carga como <script> global en el navegador (window.RutinaLogic) y
   como módulo CommonJS en los tests (require('../logic.js')). */
(function (root) {

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

  function todayKey(now, order){
    const jsDay = now.getDay(); // 0=domingo..6=sabado
    return order[(jsDay + 6) % 7];
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

  // Cuenta hacia atrás desde hoy mientras haya fechas calendario consecutivas
  // en historyDates (cualquier hueco corta la racha). historyDates son días ya
  // "cerrados" (persistidos); todayCompleted cubre el día de hoy aparte, que
  // todavía no se guardó en el historial pero ya puede estar completo.
  // Reusado tanto por la racha de rutina como por la racha de caminata.
  function computeStreak(historyDates, todayIso, todayCompleted){
    const dates = historyDates instanceof Set ? historyDates : new Set(historyDates);
    const [y, m, d] = todayIso.split('-').map(Number);
    let streak = todayCompleted ? 1 : 0;
    const cursor = new Date(y, m - 1, d - 1); // día anterior a hoy
    while (dates.has(isoDate(cursor))){
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
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
    const offset = (now.getDay() + 6) % 7;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset).getTime();
    return sumWalkDistanceSince(history, start);
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

  const api = { haversine, formatDuration, daysUntilInfo, sortBirthdaysByNextOccurrence, todayKey, isoDate, geolocationErrorMessage, escapeHtml, urlBase64ToUint8Array, computeStreak, totalWalkDistanceKm, bestWalkDistanceKm, walkDistanceThisWeek, walkDistanceThisMonth, walkStreakDays };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RutinaLogic = api;

})(typeof window !== 'undefined' ? window : globalThis);
