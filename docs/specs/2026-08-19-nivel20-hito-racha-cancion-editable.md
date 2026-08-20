Status: Approved

# Nivel 20 — Hito de racha y canción del día editable

## Review summary

Dos piezas, ambas ya estaban en el ledger de Deferred aspects de niveles
anteriores (Nivel 17/19 para el hito de racha, Nivel 19 para la canción
editable), ahora confirmadas por el usuario:

1. **Hito de racha**: celebración visual (confetti + banner + anuncio)
   cuando la racha de rutina cruza un número de la lista 5/10/30/60/100
   días. Reusa exactamente el patrón de "Celebración de bloque" del
   Nivel 19 (`celebrateBlockComplete()`), no agrega nada nuevo.
2. **Canción del día editable**: `DAILY_SONGS` deja de ser un array
   hardcodeado en `app.js` y pasa a `localStorage`, editable desde la UI
   con el mismo form de agregar/editar/borrar que ya existe para la
   Biblioteca (`libraryItems`).

**[decidido con el usuario, esta ronda]** El hito de racha es 100% local,
sin push. La idea original combinaba "cron combinado" (arreglar el
presupuesto de 5/5 Cron Triggers) con el hito de racha, asumiendo que el
hito iba a ser una notificación push del Worker — lo cual habría exigido
sincronizar el número de racha al Worker (reabriendo la línea de
privacidad de Nivel 16: el checklist nunca sale del dispositivo) y
resolver el presupuesto de crons agotado. Con el hito resuelto como
celebración local, ninguna de las dos cosas hace falta. **`cron
combinado` queda fuera de este nivel** — el riesgo de presupuesto de
crons sigue anotado como Deferred desde Nivel 18, sin cambios, hasta que
una feature futura necesite de verdad un horario nuevo.

Nivel 20 no toca `cloudflare/src/worker.js`, `wrangler.toml`, la KV, ni
el modelo de privacidad. Es 100% frontend (`app.js` + `logic.js` +
`index.html`/`styles.css` si hace falta un contenedor nuevo).

**No hace falta tocar**: `computeStreak()` (el algoritmo de racha no
cambia, solo se lee su resultado para decidir cuándo celebrar), el resto
de la Biblioteca (`QUICK_LINKS`, el CRUD de `libraryItems`), ni
`songOfTheDay(list, now)` en `logic.js` (sigue siendo una función pura,
solo cambia de dónde viene `list`).

## Decisions and assumptions requiring review

### Hito de racha (confirmado con el usuario)
- **Local, sin push**: ver resumen arriba — decisión de esta ronda.
- **Milestones**: lista curada `[5, 10, 30, 60, 100]` — confirmado con
  el usuario (alternativa descartada: cada 5 días indefinidamente, más
  repetitivo).

### Canción del día editable (confirmado con el usuario)
- **Mismo patrón CRUD que la Biblioteca**: confirmado. Detalle de campos
  del form, abajo en "Ya decididas".

### Ya decididas (agent decisions)
- **Campos del form de canción editable**: título + link únicamente
  (sin selector de "tipo" como en la Biblioteca, porque acá siempre es
  una canción). El ícono y los colores del gradiente (`icon`/`c1`/`c2`,
  que sí tiene el shape de `DAILY_SONGS`) se asignan automáticamente
  ciclando por la misma paleta de 5 combinaciones ya usada en
  `QUICK_LINKS`/`DAILY_SONGS` actuales — no se le pide al usuario elegir
  colores, sería fricción extra para un dato chico. Es un detalle visual
  de bajo costo y reversible.
- **Guard de "ya celebrado"**: `celebrateStreakMilestone()` necesita
  saber si ya celebró el milestone actual para no repetir el confetti
  en cada `renderDay()`/`renderStreakBadge()` (se llaman varias veces
  por sesión, no solo al tildar el último ítem del día). Se guarda el
  último milestone celebrado en `localStorage`
  (`veronica-last-streak-milestone`); solo celebra cuando la racha
  cruza un valor de la lista mayor al guardado. Si la racha se corta y
  vuelve a subir, el valor guardado se resetea a 0 cuando la racha cae
  por debajo de él, para que los milestones se puedan volver a celebrar
  en una racha nueva.
- **Storage key de canciones**: `veronica-daily-songs` (mismo prefijo
  `veronica-` que el resto de las claves de la app —
  `veronica-media-library`, `veronica-routine-history`, etc.).
- **Semilla**: al no encontrar la clave en `localStorage` (primera vez
  que corre este nivel), se siembra con las 5 entradas actuales de
  `DAILY_SONGS` (las URLs de `QUICK_LINKS` ya usadas) — mismo criterio
  que ya se documentó en Nivel 19 para no perder la rotación existente
  ni obligar a poblar la lista desde cero.

## Scope boundary

### This iteration
1. **Hito de racha**: nueva función `celebrateStreakMilestone(streak)`
   en `app.js`, llamada desde `renderStreakBadge()` cuando la racha
   recién calculada cruza un valor de `[5, 10, 30, 60, 100]` no
   celebrado todavía. Reusa el banner (`#blockCelebration` o uno nuevo
   equivalente) y `burstConfetti()`/`announce()` ya existentes de la
   celebración de bloque (Nivel 19), con su propio texto ("🔥 ¡5 días
   seguidos! 🔥").
2. **Canción del día editable**: `DAILY_SONGS` pasa de `const` a
   variable cargada/guardada en `localStorage`
   (`loadDailySongs()`/`saveDailySongs()`, mismo patrón que
   `loadLibrary()`/`saveLibrary()`). Nuevo form de agregar/editar/borrar
   en la sección "Canción del día" de la Biblioteca (`renderLibrary()`),
   con la misma UX que el form de `libraryItems` (editar precarga el
   form, borrar pide confirmación).

### Explicit non-goals
- No hay push ni cambios en `cloudflare/src/worker.js` / KV / privacidad
  (ver Review summary).
- No resuelve el presupuesto de Cron Triggers (sigue en Deferred desde
  Nivel 18, sin cambios).
- No cambia el algoritmo de `computeStreak()` ni el badge de racha
  existente — el hito es un agregado sobre lo que ya se muestra.
- No agrega selección de colores/ícono por canción en la UI (asignación
  automática, ver "Ya decididas").
- No es un rediseño de la Biblioteca — el form de canciones es un
  agregado, mismo estilo visual que el de `libraryItems`.

## Risks and failure modes

- **Doble celebración en la misma sesión**: sin el guard de "último
  milestone celebrado" en `localStorage`, cualquier re-render
  (`renderDay()` se llama seguido) dispararía el confetti repetidas
  veces. Mitigado con el guard descrito arriba — mismo tipo de cuidado
  que ya tuvo `celebrateBlockComplete()` (dispara solo al tildar el
  último ítem, nunca en un render).
- **Migración de canciones existentes**: si la siembra desde
  `DAILY_SONGS` hardcodeado no corre antes del primer `renderLibrary()`
  después de este nivel, el usuario vería la Biblioteca sin canción del
  día la primera vez. Mitigado sembrando en `loadDailySongs()` (mismo
  momento que `loadLibrary()`, llamado al bootear la app).
- **Migración de racha en curso**: un usuario que ya tiene una racha
  larga hoy (ej. 12 días) al actualizar el service worker no debería
  disparar de golpe los milestones 5 y 10 juntos la primera vez que
  abre la app con este nivel. Mitigación: en la primera carga después
  de este nivel, si no existe todavía `veronica-last-streak-milestone`
  en `localStorage`, se inicializa con el milestone más alto que la
  racha actual ya superó (sin celebrar retroactivamente), no con 0.

## Acceptance criteria and high-level workflow

1. Con una racha que llega a 5, 10, 30, 60 o 100 días, al abrir/recargar
   la app se ve el confetti grande + banner ("🔥 ¡N días seguidos! 🔥")
   + anuncio para lectores de pantalla, una sola vez por milestone.
2. Recargar la página sin que la racha haya cambiado NO vuelve a
   disparar la celebración del mismo milestone.
3. Si la racha se corta y vuelve a construirse desde cero, los
   milestones se pueden volver a celebrar en la racha nueva.
4. En la Biblioteca, la canción del día se puede editar (título + link)
   y borrar con el mismo form/confirmación que ya usa `libraryItems`;
   los cambios persisten en `localStorage` entre sesiones.
5. Un usuario que actualiza desde un nivel anterior sigue viendo una
   canción del día (semilla automática) sin tener que cargar nada a
   mano.
6. `npm run test:all` en verde, local y en CI.

## Implementation detail

### Archivos modificados
```
app.js                    + celebrateStreakMilestone(streak) llamada
                           desde renderStreakBadge(), reusa
                           burstConfetti()/announce() y el patrón de
                           banner de celebrateBlockComplete() (Nivel 19)
                           + DAILY_SONGS pasa de const a
                           loadDailySongs()/saveDailySongs()
                           (localStorage, key veronica-daily-songs,
                           semilla = valores actuales)
                           + form de agregar/editar/borrar canción en
                           renderLibrary() (mismo patrón que
                           submitLibraryForm()/renderLibraryItems())
index.html                + contenedor del form de canción editable en
                          la sección Biblioteca, si hace falta uno
                          nuevo separado del de libraryItems
styles.css                + estilos del form de canción (probablemente
                          reusa clases .lib-form/.lib-edit/.lib-del
                          existentes, sin necesidad de clases nuevas)
tests/ui/nivel19.spec.js  ó tests/ui/streak.spec.js — tests Playwright
                          del hito de racha y de la canción editable
README.md                + roadmap Nivel 20
```

### Testing
Mismo patrón que niveles anteriores: `celebrateStreakMilestone()` y el
guard de "último milestone celebrado" verificados con Playwright
(forzando historial de racha vía `localStorage`, mismo método que ya
usan `tests/ui/streak.spec.js`); el form de canción editable, con
Playwright igual que el resto de los forms CRUD ya cubiertos
(`tests/ui/library.spec.js` como referencia directa). No hace falta
tocar `logic.js` — `computeStreak()` y `songOfTheDay()` no cambian de
firma ni de comportamiento, TDD no aplica acá.

## Deferred aspects

- **Presupuesto de Cron Triggers agotado (5/5)**: sin cambios desde
  Nivel 18 — sigue deferido, se retoma cuando una feature futura
  necesite de verdad un horario nuevo (resumen semanal por push, hito
  de racha por push si se pide más adelante, etc.).
- **Hito de racha por push**: quedó descartado para este nivel (ver
  Review summary) — si se pide más adelante, encaja reabriendo la
  decisión de privacidad de Nivel 16 (sincronizar el número de racha,
  no el checklist) y resolviendo el presupuesto de crons de arriba.
- **Canción del día con temas puntuales reales curados**: ya deferido
  desde Nivel 19 — ahora que es editable desde la UI, el usuario puede
  resolverlo él mismo sin depender de otro nivel.
- **Colores/ícono personalizables por canción**: asignación automática
  por ahora (ver "Ya decididas") — si se pide, es un campo más en el
  form, mismo patrón que agregar el selector de tipo en la Biblioteca.

## Implementation guidance
- TDD: apagado — ninguna de las dos piezas toca `logic.js`.
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por
  terminada; verificación manual del hito de racha (forzando historial
  en `localStorage`, sin necesidad de mover ningún cron — es 100%
  local) antes de cerrar el nivel.
- Review: `/code-review` al final del nivel, después de que todas las
  tareas estén hechas y la verificación pase — mismo gate que Niveles
  15-19.
- Scope: construir solo las 2 partes de este spec — no agregar push,
  cambios en el Worker, ni resolver el presupuesto de crons sin volver
  a pedir aprobación.
- Deferred aspects: ledger de arriba reconciliado; no hay tracker
  externo para este proyecto, el roadmap vive en el README.
- Build order: 1) canción del día editable (aislado, cero riesgo, reusa
  patrón CRUD ya probado de la Biblioteca) → 2) hito de racha +
  migración del milestone inicial → 3) tests Playwright de ambas → 4)
  `/code-review`.
- Routing: todo en la sesión principal, secuencial — nivel chico, sin
  necesidad de delegar a subagentes por eficiencia de tokens.
- Orchestrator: sesión actual, sin cambio de modelo.
