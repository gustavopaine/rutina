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

  const api = { haversine, formatDuration, daysUntilInfo, sortBirthdaysByNextOccurrence, todayKey, geolocationErrorMessage };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RutinaLogic = api;

})(typeof window !== 'undefined' ? window : globalThis);
