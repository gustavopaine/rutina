Status: Approved

# Nivel 19 — Celebración de bloque, canción del día, resumen semanal y sugerencia de vestimenta

## Review summary

Cuatro funcionalidades independientes agrupadas en un mismo nivel, a
pedido del usuario (mismo patrón que Niveles 16-18): (1) una celebración
especial al completar un bloque entero de la rutina, más allá del
confetti chico que ya salta por cada tarea; (2) una "canción del día" en
la pestaña Biblioteca; (3) un resumen semanal de lo hecho, visible al
abrir la app; (4) una sugerencia de qué ropa llevar según el clima real
del día.

**[decidido con el usuario]**
- Resumen semanal: **solo en la app** (no push) — sin sincronizar nada
  nuevo al Worker, sin usar cupo de cron (ya está en 5/5 desde Nivel 18).
- Canción del día: **lista semilla editable** en `app.js`.
- Clima: **Open-Meteo** (gratis, sin API key) con la **ubicación fija de
  Viedma** (`DEFAULT_CENTER`, la misma que ya usa el mapa de Caminata).

**[added]** Canción del día reutiliza las URLs ya verificadas de
`QUICK_LINKS` (canal de YouTube, Spotify, búsquedas de cuarteto) en vez
de inventar URLs de temas puntuales de Euge Quevedo que no puedo
confirmar que existan o funcionen — evita el riesgo de un link roto o
fabricado. El usuario puede reemplazar las entradas por temas puntuales
reales más adelante, mismo patrón editable que el resto de `DATOS
EDITABLES`.

**No hace falta tocar**: el modelo de privacidad no cambia (el resumen
semanal es 100% local); no se agrega reproducción de audio embebido; no
se pide geolocalización nueva.

## Decisions and assumptions requiring review

Todas las decisiones de producto reales ya se resolvieron con el usuario
(arriba). Quedan estas decisiones técnicas menores, de bajo impacto y
fáciles de revertir, que resuelvo yo:

- **Dónde aparece cada cosa en la UI**:
  - Celebración de bloque: en el momento de tildar el último ítem del
    bloque (no en un lugar fijo, es un efecto momentáneo).
  - Canción del día: card nueva arriba de "Accesos rápidos" en la
    pestaña Biblioteca (mismo lugar temático).
  - Resumen semanal: arriba del todo en `dayContent`, **solo cuando la
    pestaña activa es domingo** — así no hace falta trackear si "ya se
    mostró esta semana" (aparece cada vez que se mira el domingo, no una
    sola vez), y no compite por espacio en el header con lo demás.
  - Clima/vestimenta: card chica en el header, debajo del indicador de
    perdón de racha — es información del día, relevante todos los días,
    no solo domingo.
- **Formato de `DAILY_SONGS`**: mismo shape que `QUICK_LINKS`
  (`title`, `url`, `icon`, `c1`/`c2`), un array nuevo separado (no
  reutiliza el array de `QUICK_LINKS` en memoria, aunque arranca con las
  mismas URLs) para que se pueda curar independientemente después.
- **Selección determinística por fecha**: mismo criterio que ya usa el
  resto de la app (nada al azar) — índice = día del año módulo cantidad
  de canciones, misma canción todo el día, distinta al día siguiente.
- **Reglas de vestimenta** (función pura `clothingSuggestion(tempC,
  precipMm, windKmh)` en `logic.js`):
  - `< 10°C`: "Abrigate bien 🧥"
  - `10-18°C`: "Llevá campera 🧥"
  - `18-25°C`: "Ropa liviana, puede refrescar a la noche 👕"
  - `> 25°C`: "Ropa fresca y mucha agua 🥤"
  - Si `precipMm > 0`: agrega "☔ Llevá paraguas"
  - Si `windKmh > 30`: agrega "💨 Hace viento, algo que no vuele"
  - Umbrales elegidos a criterio propio (clima templado de la Patagonia
    Norte) — triviales de ajustar si no calzan con la realidad, son
    constantes en una sola función.
- **Endpoint de Open-Meteo**: `https://api.open-meteo.com/v1/forecast
  ?latitude=-40.8135&longitude=-62.9967&current=temperature_2m,precipitation,wind_speed_10m`.
  Se verifica la forma real de la respuesta recién al implementar (no se
  asume a ciegas) — Open-Meteo es gratis y sin key, pero si el shape
  exacto de la respuesta difiere de lo esperado, se ajusta el parseo sin
  que eso cambie el diseño.

## Scope boundary

### This iteration
1. **Celebración de bloque**: al tildar el último ítem de un bloque
   (Mañana/Tarde/Noche), además del confetti chico de siempre: una
   ráfaga de confetti más grande (varios `burstConfetti()` en distintas
   posiciones), un banner breve tipo toast ("¡Mañana completa! 🎉", se
   desvanece solo) y un anuncio para lectores de pantalla (`announce()`,
   ya existe). Dispara solo en la transición de "incompleto" a
   "completo" al tildar (no al desmarcar, no en cada render).
2. **Canción del día**: card arriba de "Accesos rápidos" en Biblioteca,
   mismo tema fijo todo el día, elegido por fecha desde `DAILY_SONGS`
   (semilla = URLs de `QUICK_LINKS`, editable después).
3. **Resumen semanal**: arriba de `dayContent` cuando la pestaña activa
   es domingo — días completos esta semana (X/7, reusa
   `veronica-routine-history`), distancia total caminada esta semana y
   cantidad de caminatas (reusa `walkDistanceThisWeek()` de
   `logic.js`, Nivel 17).
4. **Sugerencia de vestimenta**: card en el header con temperatura +
   sugerencia de ropa (Viedma, Open-Meteo), cacheada una vez por día en
   `localStorage` (mismo criterio que "una vez por día" ya usado en
   otras partes de la app) para no repetir el fetch en cada render.

### Explicit non-goals
- No cambia el modelo de privacidad del checklist (nunca sale del
  dispositivo) — el resumen semanal es 100% local, no se sincroniza nada.
- No agrega selección de ciudad ni geolocalización para el clima —
  ubicación fija (Viedma).
- La canción del día no reproduce audio embebido — es un link, como los
  accesos rápidos que ya existen.
- No es un rediseño de Biblioteca ni del header — son agregados chicos
  sobre lo que ya hay, mismo estilo visual.

## Risks and failure modes

- **Clima sin conexión o API caída**: la card de vestimenta
  simplemente no aparece (mismo criterio de degradación que
  Leaflet/fuentes externas) — no bloquea el resto de la app, no hay
  mensaje de error visible (no es información crítica).
- **Caché de clima cruzando la medianoche**: si se abre la app antes de
  medianoche y de nuevo después, el caché "de hoy" tiene que invalidarse
  con el mismo criterio de cambio de día calendario que ya usa el
  checklist (`isoDate()`), no con un timestamp relativo.
- **Celebración de bloque y el hook de cierre de día (Nivel 17)**: son
  independientes — completar un bloque no afecta el cálculo de "día
  completo" para la racha (eso ya lo hace `closeRoutineHistoryIfDayChanged()`
  al día siguiente, sin relación con esta celebración momentánea).
- **Resumen semanal con historial parcial**: si la app se instaló a
  mitad de semana, el resumen solo cuenta desde que hay datos — no hace
  falta lógica especial, `veronica-routine-history` y `walkHistory`
  simplemente no tienen entradas de antes.

## Acceptance criteria and high-level workflow

1. Al tildar el último ítem de un bloque, aparece la celebración grande
   (confetti + banner + anuncio); tildar ítems de un bloque ya completo
   (si se destildó y se vuelve a tildar) la dispara de nuevo; tildar un
   ítem que no completa el bloque no la dispara.
2. La pestaña Biblioteca muestra la canción del día arriba de "Accesos
   rápidos"; recargar la página el mismo día muestra la misma canción.
3. Abrir la app un domingo muestra el resumen semanal arriba del
   checklist del día; abrir cualquier otro día no lo muestra.
4. `npm test` cubre `clothingSuggestion()` con casos de cada rango de
   temperatura, con y sin lluvia, con y sin viento.
5. Con conexión, la card de clima muestra una temperatura y sugerencia
   reales (verificable a mano); sin conexión o si la API falla, la app
   sigue funcionando normal sin esa card.
6. `npm run test:all` en verde, local y en CI.

## Implementation detail

### Archivos modificados
```
logic.js                + clothingSuggestion(tempC, precipMm, windKmh)
                         + songOfTheDay(list, now) — índice determinístico
                           por fecha, mismo criterio que daysUntilInfo()
tests/logic.test.js      + tests de clothingSuggestion() y songOfTheDay()
app.js                    + DAILY_SONGS en DATOS EDITABLES (semilla =
                          URLs de QUICK_LINKS)
                          + celebración de bloque en el handler de
                          checkbox de renderDay() (banner + confetti
                          grande + announce())
                          + card de canción del día en renderLibrary()
                          + resumen semanal arriba de dayContent en
                          renderDay(), solo si current === 'domingo'
                          + fetchWeather()/renderWeatherCard() en el
                          header, cacheado por día en localStorage
index.html                + contenedor de la card de clima en el header
                          + contenedor del banner de celebración de bloque
styles.css                + estilos de las 4 piezas nuevas
```

### Testing
Mismo patrón que niveles anteriores: lógica pura nueva
(`clothingSuggestion`, `songOfTheDay`) con tests en `tests/logic.test.js`;
UI verificada a mano y con Playwright donde aplique sin depender de
fechas/clima reales (mockeando `fetch` para el clima, igual que ya se
mockea `Notification`/`pushManager` en `tests/ui/reminders.spec.js`; el
resumen semanal y la canción del día se pueden testear seedeando
localStorage y usando `page.clock`/fechas fijas si hace falta evitar
depender de qué día real corre el test, mismo criterio que
`tests/ui/streak.spec.js`).

## Deferred aspects

- **Resumen semanal por push**: descartado por ahora (ver Decisions) —
  encajaría reusando un cron existente con lógica condicional extra
  (mismo patrón que `WEEKEND_CRON` del Nivel 18) y sincronizando
  estadísticas agregadas, si se pide más adelante.
- **Canción del día con temas puntuales reales**: la semilla usa las
  URLs ya verificadas de `QUICK_LINKS` en vez de temas específicos — el
  usuario puede curar `DAILY_SONGS` a mano después con temas concretos.
- **Selección de ciudad para el clima**: fijo en Viedma por ahora: si
  se necesita para otro hogar/ubicación, es una constante para
  reemplazar o un input nuevo en la UI.
- **Notificación push por hito de racha** (ya deferido desde Nivel 17):
  sigue sin pedirse.

## Implementation guidance
- TDD: apagado, salvo `logic.js` — mismo patrón que niveles anteriores.
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por terminada.
- Review: `/code-review` al final del nivel, después de que todas las
  tareas estén hechas y la verificación pase — mismo gate que Niveles
  15-18.
- Scope: construir solo las 4 partes de este spec — no agregar
  reproducción de audio, geolocalización de clima, ni resumen semanal
  por push sin volver a pedir aprobación.
- Deferred aspects: ledger de arriba reconciliado; no hay tracker
  externo para este proyecto, el roadmap vive en el README.
- Build order: 1) `clothingSuggestion()` + `songOfTheDay()` + tests
  (lógica pura primero) → 2) celebración de bloque (aislado, sin
  dependencias externas) → 3) canción del día en Biblioteca → 4) resumen
  semanal en dayContent → 5) card de clima (Open-Meteo, la única pieza
  con integración externa nueva — última, para no bloquear el resto si
  algo del fetch/shape de la API tarda en afinarse) → 6) `/code-review`.
- Routing: todo en la sesión principal, secuencial — nivel acotado, sin
  necesidad de delegar a subagentes por eficiencia de tokens.
- Orchestrator: sesión actual, sin cambio de modelo.
