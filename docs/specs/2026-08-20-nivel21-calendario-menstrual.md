Status: Approved

# Nivel 21 — Calendario Menstrual

## Review summary

Nueva pestaña "Ciclo", con el mismo patrón robusto ya usado en
Cumpleaños/Caminata/Biblioteca: su propia sección en `TABS`, CRUD
completo (agregar/editar/borrar) contra un array persistido en
`localStorage`, más un botón de registro rápido ("Inicio del período",
mismo espíritu que "Inicio del período" en apps de seguimiento típicas
y análogo a cómo Caminata tiene su propio botón de inicio/fin).

Cálculos (día de ciclo actual, próxima fecha estimada de período, ventana
fértil estimada, promedios de duración) van como funciones puras nuevas
en `logic.js` — mismo criterio que `computeStreak()`/`daysUntilInfo()`:
testeables con Node, sin DOM, sin fechas mockeadas raras (reciben `now`
como parámetro).

**Dato sensible — 100% local, sin excepción:** a diferencia de
Cumpleaños (que sí sincroniza al Worker para el push de recordatorio) o
de la racha (que Nivel 20 dejó explícitamente local por privacidad),
acá no hay ninguna ambigüedad ni decisión que tomar: este nivel **no
llama a `postToWorkerIfSubscribed()` ni a ningún `syncXToWorker()` bajo
ninguna circunstancia**. `loadCycleHistory()`/`saveCycleHistory()` son
las únicas dos funciones que tocan esta clave de `localStorage`, y
ninguna de las dos hace `fetch`. Se agrega un test de Playwright que lo
verifica activamente (ver Acceptance criteria).

Nivel 21 no toca `cloudflare/src/worker.js`, `wrangler.toml`, ni la KV.
Es 100% frontend (`app.js` + `logic.js` + `index.html`/`styles.css`).

## Decisions and assumptions requiring review

### Confirmadas con el usuario (esta ronda)

- **Visibilidad de la pestaña**: `🩸 Ciclo`, visible en la barra de tabs
  con label e ícono explícitos, igual que Cumpleaños/Caminata/
  Biblioteca — sin ocultar detrás de un menú ni requerir PIN.
- **Valores por defecto sin historial suficiente**: con 0 o 1 ciclo
  cargado, se muestra igual una predicción estimada con promedios
  clínicos estándar como fallback (ciclo: 28 días, período: 5 días),
  etiquetada visualmente como estimación ("estimado, todavía sin
  historial propio") en vez de dejar la pantalla vacía.

### Ya decididas (agent decisions)

- **Modelo de datos por ciclo**: `{ id, startDate, endDate }` en vez de
  `{ id, startDate, periodLength }`. Se registran fechas de calendario
  (igual que Cumpleaños usa día/mes, Caminata usa timestamps), la
  duración del período se **deriva** (`endDate - startDate + 1` días)
  en vez de pedirse como número aparte — evita que fecha de fin y
  "duración" queden inconsistentes entre sí si se edita una sin la
  otra. `endDate: null` significa período en curso (sin cerrar todavía).
- **Botón "Inicio del período"**: crea una entrada nueva con
  `startDate = hoy`, `endDate = null`. Si ya hay una entrada abierta
  (`endDate === null`), el botón queda deshabilitado/oculto y se
  muestra en su lugar "Período en curso, día N" con acceso directo a
  editar esa entrada (completar la fecha de fin) — nunca se permiten
  dos entradas abiertas a la vez, rompería los cálculos de "ciclo
  actual".
- **Cierre del período**: se hace editando la entrada abierta (mismo
  ícono ✏️ que el resto de los CRUD de la app) para agregarle
  `endDate`, no un botón "Fin del período" aparte — menos superficie
  nueva, reusa el form de editar que ya existe para todo lo demás.
- **Ventana fértil**: ovulación estimada = fecha estimada del próximo
  período − 14 días (fase lútea ~14 días, el supuesto estándar que usan
  la mayoría de las apps de seguimiento — se mantiene razonablemente
  constante incluso cuando el ciclo completo varía). Ventana fértil =
  [ovulación − 5, ovulación + 1] (6 días), mismo rango que usan
  Flo/Clue. Es una estimación aproximada de calendario, no un método
  anticonceptivo ni de fertilidad clínico — se aclara en la UI con un
  texto chico ("estimación aproximada, no reemplaza un método médico").
- **Promedios sobre "últimos 6 ciclos"**: media aritmética simple, sin
  descartar outliers ni usar mediana. Si un ciclo salió de 55 días por
  la razón que sea, entra igual al promedio con el mismo peso que el
  resto. Es el comportamiento más simple y predecible; ver Deferred
  aspects si en algún momento se pide manejo de irregularidad.
- **Fase actual**: `'menstruacion'` si hoy cae dentro de la entrada más
  reciente (con `endDate` si ya está cerrada, o simplemente "hoy ≥
  startDate" si sigue abierta — mientras no se cierre se considera que
  sigue el período); si no, `'fertil'` si hoy cae dentro de la ventana
  fértil calculada para el ciclo actual; si no, `'otro'`. Exactamente
  las 3 categorías que pidió el usuario, sin subdividir folicular/lútea.
- **Storage key**: `veronica-cycle-history` (mismo prefijo `veronica-`
  que el resto: `veronica-birthdays`, `veronica-daily-songs`, etc.).
- **Sin categoría/notas por ciclo**: a diferencia de Cumpleaños (que
  tiene `cat`), acá no se pide clasificar nada — el spec del usuario no
  lo pidió y agregar un campo de notas libres es una superficie nueva
  no solicitada (se puede sumar después si se pide).

## Scope boundary

### This iteration

1. **Modelo de datos y storage**: `cycleHistory` (array de
   `{id, startDate, endDate}`), `CYCLE_STORAGE_KEY =
   'veronica-cycle-history'`, `loadCycleHistory()`/`saveCycleHistory()`
   en `app.js` — sin ninguna llamada a sync del Worker.
2. **Funciones puras en `logic.js`** (todas reciben `now`/`history`
   como parámetro, nada de `Date.now()` interno — mismo criterio que
   `computeStreak()`):
   - `averagePeriodLengthDays(history, maxCycles=6)`
   - `averageCycleLengthDays(history, maxCycles=6)`
   - `currentCycleDay(history, now)`
   - `predictNextPeriod(history, now)` → fecha ISO estimada
   - `predictFertileWindow(history, now)` → `{start, end}` ISO
   - `cyclePhase(history, now)` → `'menstruacion' | 'fertil' | 'otro'`
3. **Botón "Inicio del período"**: `startPeriodToday()`, con el guard
   de "no hay ya una entrada abierta" descrito arriba.
4. **CRUD manual** (agregar entradas pasadas para poblar historial,
   editar fecha de fin de la entrada en curso, editar/borrar cualquier
   entrada): mismo patrón que `submitBirthdayForm()`/
   `fillBirthdayForm()`/`deleteBirthday()`, con form de fecha de inicio
   + fecha de fin (opcional).
5. **UI de la pestaña "Ciclo"**:
   - Hero card (mismo patrón visual que "Próximo cumpleaños" en
     Cumpleaños): día actual del ciclo, indicador de fase
     (menstruación 🩸 / fértil 🌱 / otro), próxima fecha estimada de
     período, próxima ventana fértil estimada.
   - Sección "Análisis": promedio de duración de período y de ciclo
     (últimos 6), con aclaración de cuántos ciclos hay cargados (ej.
     "promedio sobre 3 ciclos registrados").
   - Historial de ciclos pasados: lista con fecha de inicio/fin y
     duración derivada, igual formato de fila que Biblioteca/Cumpleaños
     (con ✏️/✕ de editar/borrar).
   - Form de agregar/editar entrada.
6. **`TABS`**: se agrega `"ciclo"` al array, con su render en
   `renderTabs()` (mismo switch que `cumples`/`caminata`/`biblioteca`).
7. **`exportData()`/`importData()`**: se agrega
   `cycleHistory: localStorage.getItem(CYCLE_STORAGE_KEY)` y su
   contraparte de import, mismo patrón que el resto de las claves.

### Explicit non-goals

- **Cero sincronización al Worker, bajo ninguna circunstancia** — no
  hay ninguna versión de este nivel que toque `cloudflare/`. No es una
  decisión a reabrir con el usuario más adelante como pasó con el hito
  de racha en Nivel 20; es una restricción dura del pedido original.
- No es un método anticonceptivo ni una herramienta de diagnóstico
  médico — la ventana fértil es una estimación de calendario, se aclara
  en la UI.
- No hay notificaciones push de "se acerca tu período" (eso sí
  necesitaría sincronizar algo al Worker, que está explícitamente
  descartado arriba).
- No hay campo de síntomas/notas/estado de ánimo por día — no lo pidió
  el usuario, ver Deferred aspects.
- No maneja ciclos irregulares con lógica especial (outliers, mediana,
  ponderación) — promedio simple, ver "Ya decididas".
- No rediseña la barra de tabs — se agrega una pestaña más, mismo
  estilo visual que las 3 existentes (`cumples`/`caminata`/`biblioteca`).

## Risks and failure modes

- **Dos entradas abiertas simultáneas**: si el guard de
  `startPeriodToday()` fallara y se crearan dos entradas con
  `endDate: null`, todos los cálculos de "ciclo actual" (día de ciclo,
  próxima predicción) tomarían la entrada más reciente por
  `startDate`, pero el historial quedaría con una entrada "fantasma"
  sin cerrar nunca. Mitigado con el guard explícito en el botón (no se
  muestra si ya hay una abierta) — y aunque se lograra crear una
  segunda igual (ej. editando manualmente), las funciones de cálculo
  toman siempre `max(startDate)` como "ciclo actual", no fallan, solo
  ignoran entradas abiertas más viejas.
- **Historial vacío o con datos parciales**: cubierto en "Decisiones
  requiriendo confirmación" arriba — depende de qué responda el
  usuario sobre mostrar o no una estimación con valores por defecto.
- **Filtración accidental de este dato al Worker**: el riesgo real de
  este nivel. Mitigado en dos capas: (1) revisión de código explícita
  de que `loadCycleHistory()`/`saveCycleHistory()` no llaman a
  `fetch`/`postToWorkerIfSubscribed()`, (2) un test de Playwright que
  intercepta *todas* las requests salientes durante un ciclo completo
  de agregar/editar/borrar una entrada y falla si alguna sale hacia el
  dominio del Worker.
- **Fechas fuera de orden**: si el usuario carga manualmente un
  historial con `startDate` fuera de orden cronológico (ej. completando
  ciclos viejos después de los nuevos), `averageCycleLengthDays()`
  necesita ordenar por `startDate` antes de calcular las diferencias
  entre entradas consecutivas — no puede asumir que el array ya viene
  ordenado por orden de carga.

## Acceptance criteria and high-level workflow

1. Tocar "Inicio del período" con historial vacío crea una entrada con
   `startDate = hoy`, `endDate = null`; la pestaña muestra "Período en
   curso, día 1" y el botón se reemplaza por el acceso a editar esa
   entrada.
2. Editar esa entrada para agregarle `endDate` (ej. 5 días después)
   cierra el ciclo: el historial la muestra con duración derivada (5
   días), y "Inicio del período" vuelve a estar disponible.
3. Con 2+ ciclos cerrados, "Análisis" muestra el promedio real de
   duración de período y de ciclo (sobre hasta los últimos 6), no los
   valores por defecto.
4. La fecha estimada del próximo período y la ventana fértil estimada
   se recalculan correctamente al agregar/editar/borrar entradas del
   historial.
5. El indicador de fase (menstruación/fértil/otro) coincide con lo
   esperado para al menos un caso de cada una de las 3 fases, forzando
   historial vía `localStorage` en el test (mismo método que
   `tests/ui/streak.spec.js`).
6. Un test de Playwright verifica que **ninguna** request de red sale
   hacia el Worker durante un flujo completo de "Inicio del período" →
   editar → borrar (intercepta todas las requests, falla si alguna
   matchea el dominio del Worker).
7. `cycleHistory` viaja correctamente en `exportData()`/`importData()`.
8. `npm run test:all` en verde, local y en CI.

## Implementation detail

### Archivos modificados
```
logic.js                  + averagePeriodLengthDays(), averageCycleLengthDays(),
                           currentCycleDay(), predictNextPeriod(),
                           predictFertileWindow(), cyclePhase() — todas
                           puras, sin DOM, exportadas en el objeto `api`
tests/logic.test.js       + tests unitarios de las 6 funciones nuevas
                           (casos: sin historial, 1 ciclo, varios ciclos,
                           ciclo en curso, fechas fuera de orden)
app.js                    + CYCLE_STORAGE_KEY, cycleHistory,
                           editingCycleId, loadCycleHistory()/
                           saveCycleHistory() (sin sync al Worker),
                           startPeriodToday(), submitCycleForm(),
                           fillCycleForm(), deleteCycleEntry(),
                           renderCycle() (hero + análisis + historial +
                           form, mismo patrón que renderBirthdays())
                           + "ciclo" agregado a TABS y al switch de
                           renderTabs()
                           + exportData()/importData(): cycleHistory
index.html                + botón/contenedor de la pestaña "Ciclo"
                           (mismo patrón de contenedor que cumples/
                           caminata/biblioteca)
styles.css                + estilos de la pestaña (probablemente reusa
                           .bday-hero/.lib-form/.lib-item existentes,
                           con una clase de color propia para el tab
                           como ya tienen bdaytab/walktab/libtab)
tests/ui/cycle.spec.js    (nuevo) — tests Playwright: flujo completo de
                           inicio/cierre de período, historial, análisis,
                           predicciones, y el test de "cero requests al
                           Worker" (ver Acceptance criteria #6)
README.md                 + roadmap Nivel 21 + línea en la lista de
                           features (con el mismo texto de "100% local"
                           que ya usan racha/checklist)
```

### Testing
TDD encendido para `logic.js` (son 6 funciones de cálculo puro, exactamente
el tipo de lógica donde este proyecto ya viene aplicando TDD implícito con
`computeStreak()`/`daysUntilInfo()`): tests unitarios primero en
`tests/logic.test.js`, cubriendo sin-historial, un-ciclo, varios-ciclos,
ciclo-en-curso, y fechas cargadas fuera de orden. Los tests de Playwright
en `tests/ui/cycle.spec.js` verifican el flujo end-to-end + la garantía de
privacidad (test de "cero requests salientes"), mismo patrón que
`tests/ui/streak.spec.js`/`tests/ui/library.spec.js` como referencia
directa.

## Deferred aspects

- **Notas/síntomas por día**: no pedido en este nivel — si se pide
  después, es un campo más en el form de historial, mismo patrón que
  agregar un campo nuevo a Cumpleaños o Biblioteca en niveles previos.
- **Manejo de ciclos irregulares** (outliers, mediana en vez de
  promedio, ponderar ciclos recientes más que viejos): promedio simple
  por ahora, ver "Ya decididas". Se retoma si el historial real muestra
  que la predicción se desvía mucho en la práctica.
- **Recordatorio/aviso** de que se acerca el período o la ventana
  fértil: descartado explícitamente para este nivel porque necesitaría
  sincronizar algo al Worker — no se retoma salvo pedido explícito
  futuro que reabra esa decisión de privacidad (igual que se dejó
  anotado para el hito de racha en Nivel 20).

## Implementation guidance
- TDD: encendido para las 6 funciones nuevas de `logic.js` (ver
  Testing). Apagado para el resto (render/CRUD en `app.js`, mismo
  patrón ya establecido para Cumpleaños/Biblioteca).
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por
  terminada; verificación manual del flujo completo (inicio → cerrar →
  historial → análisis) en el navegador antes de cerrar el nivel.
- Review: `/code-review` al final del nivel — con foco explícito en
  confirmar que `loadCycleHistory()`/`saveCycleHistory()` no tienen
  ningún `fetch`/sync al Worker, dado que es el riesgo central de este
  nivel.
- Scope: construir solo lo de este spec — no agregar recordatorios,
  notas/síntomas, ni ningún cambio en `cloudflare/` sin volver a pedir
  aprobación.
- Deferred aspects: ledger de arriba; el roadmap vive en el README, sin
  tracker externo.
- Build order: 1) funciones puras en `logic.js` + tests unitarios → 2)
  modelo de datos y CRUD en `app.js` (sin UI todavía, verificable desde
  la consola) → 3) UI de la pestaña (hero + análisis + historial +
  form) → 4) tests Playwright, incluido el de "cero requests al Worker"
  → 5) `/code-review`.
- Routing: sesión principal, secuencial — nivel de tamaño similar a
  Nivel 17-19, sin necesidad de delegar a subagentes por eficiencia de
  tokens.
- Orchestrator: sesión actual, sin cambio de modelo.

