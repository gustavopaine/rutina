Status: Approved

# Nivel 17 — Racha de rutina, push de cumpleaños y estadísticas de caminata

## Review summary

Tres funcionalidades pedidas por el usuario para un mismo nivel: (1) una
racha ("🔥 N días seguidos") quе cuenta cuántos días calendario consecutivos
Verónica completó toda la rutina; (2) un push de cumpleaños ("mañana cumple
Fulano") que reutiliza el Worker del Nivel 16; (3) un panel de estadísticas
de caminata (distancia total, resumen semanal/mensual, racha de días con
caminata, mejor caminata) sobre el historial que ya se guarda.

Ninguna de las tres tenía la base de datos necesaria ya armada — se
investigó el código actual antes de diseñar (ver "Decisions and
assumptions" abajo) y las tres requieren agregar algún dato nuevo que hoy
no existe, no solo mostrar algo que ya estaba guardado.

**[added]** Historial persistente de días de rutina completa
(`veronica-routine-history`, nuevo) — inevitable para la racha, no existía
ningún registro por fecha calendario (el checklist se guarda por nombre de
día de semana, no por fecha).
**[added]** Campo `timestamp` en cada sesión de caminata nueva — inevitable
para el resumen semanal/mensual y la racha de caminata; las caminatas
guardadas antes de este nivel no lo van a tener y quedan fuera de esos dos
desgloses (siguen contando en el total histórico y en "mejor caminata").
**[added]** Guarda del lado del Worker: `/birthdays` rechaza guardar
cumpleaños si no hay ninguna suscripción push activa (sin dueño a quién
avisarle, no tiene sentido guardar el dato) — costo de unas pocas líneas,
evita cumpleaños húerfanos en la KV.
**[added]** Helper compartido `computeStreak()` en `logic.js`, usado tanto
por la racha de rutina como por la de caminata (misma lógica: contar hacia
atrás desde hoy mientras haya fechas consecutivas en un set) — evita
duplicar la lógica de racha dos veces.

**No hace**: racha con "días libres"/perdón por saltear un día, edición
manual de la racha, notificación push cuando se rompe o se alcanza una
racha, aviso de cumpleaños configurable en días de anticipación (queda fijo
en 1 día antes), gráfico/calendario visual para las estadísticas de
caminata (son 5 números, no un gráfico), reconstrucción retroactiva de
semanas/meses de caminatas viejas (no hay fecha real guardada de antes).

## Decisions and assumptions requiring review

- **Qué cuenta como "día completo"**: todos los ítems de los 3 bloques
  (Mañana/Tarde/Noche) de ese día tildados, usando `totalItems()` (ya
  existe) contra la rutina *editable* actual (no la de fábrica) — así un
  día con tareas agregadas/borradas por el usuario se mide contra su propia
  versión. Sábado/domingo cuentan igual que cualquier otro día (tienen
  ítems propios, aunque el bloque diga "Libre").
- **Hoy cuenta apenas se completa**, sin esperar a que pase la fecha: la
  racha mostrada en pantalla sí incluye el día de hoy en cuanto se tilda el
  último ítem, calculada en el momento (no hace falta recargar ni esperar
  al día siguiente). El *guardado* en el historial persistente pasa recién
  al abrir la app un día distinto (mismo punto donde hoy ya se detecta el
  cambio de día calendario) — es cuando queda "cerrado" ese día anterior.
- **Ventana del aviso de cumpleaños: 1 día antes** (la víspera), fija, sin
  configuración en la UI. Si en algún momento se quiere avistar con más
  anticipación, es un solo número a cambiar en el Worker.
- **Un solo cumpleaños sincronizado a la vez, no un opt-in aparte**: los
  cumpleaños se sincronizan automáticamente en cuanto hay una suscripción
  push activa (al activar recordatorios, y en cada alta/edición/baja de un
  cumpleaños mientras siga activa) — no hay un botón separado para "avisar
  cumples sí/no". Al desactivar recordatorios, se borran también los
  cumpleaños guardados en el Worker (mismo botón, mismo gesto de baja que
  ya existe).
- **Estadísticas de caminata: 5 números, no gráfico** — Distancia total,
  Esta semana, Este mes, Racha actual (días con caminata), Mejor caminata.
  Se agregan arriba de la lista de historial existente en la pestaña
  Caminata, sin pestaña nueva ni rediseño de navegación.
- Las caminatas guardadas **antes** de este nivel no tienen fecha real
  (solo un texto ya formateado tipo "lun, 17 ago, 14:30") — se van a seguir
  contando en "Distancia total" y "Mejor caminata" (no necesitan fecha),
  pero no en "Esta semana"/"Este mes"/"Racha" (si necesitan fecha real). Se
  va a aclarar en el texto de esos dos números que arrancan a contar desde
  este nivel.

## Scope boundary

### This iteration
1. **Racha de rutina**: nuevo historial persistente + cálculo en vivo +
   badge visible cerca del progreso del día (p. ej. "🔥 5 días seguidos").
2. **Push de cumpleaños**: sync de la lista de cumpleaños al Worker
   (activar/editar/desactivar), nuevo Cron Trigger diario en el Worker,
   nuevo endpoint `/birthdays`, aviso 1 día antes.
3. **Estadísticas de caminata**: `timestamp` nuevo en cada sesión guardada,
   panel de 5 números en la pestaña Caminata.

### Deferred aspects summary
Ver ledger al final: racha con perdones/freezes, aviso de cumpleaños
configurable, gráfico de caminatas, reconstrucción retroactiva de fechas
viejas de caminata, notificación push por hito de racha.

### Explicit non-goals
- No cambia el modelo de "el checklist en sí nunca sale del dispositivo"
  (Nivel 16): la racha se calcula y guarda 100% local, el Worker nunca ve
  qué tareas están tildadas.
- No agrega un opt-in separado para el push de cumpleaños: usa la misma
  activación/desactivación de recordatorios que ya existe.
- No es un rediseño de la pestaña Caminata: el panel de estadísticas es un
  agregado arriba de lo que ya hay, mismo estilo visual.

## Risks and failure modes

- **Sincronizar cumpleaños es una ampliación real del modelo de privacidad**
  del Nivel 16 (nombres + fechas de nacimiento reales, incluida una menor,
  ahora en la KV de Cloudflare) — confirmado explícitamente con el usuario
  en esta ronda. Mitigación: el dato ya es público de cualquier forma (el
  sitio no tiene login, cualquiera con la URL ve los cumpleaños hoy), y se
  borra de la KV al desactivar recordatorios.
- **Salto de varios días sin abrir la app**: la detección de "día
  completo" solo evalúa el día que se está dejando atrás (`lastActive`) en
  el momento en que se vuelve a abrir la app en una fecha distinta — si se
  saltean 3 días sin abrir la app, esos días intermedios simplemente no
  quedan registrados como completos (lo cual es correcto: no se puede sabe
  si se completó la rutina sin la app abierta), pero tampoco se registran
  explícitamente como "rotos" — no hace falta: el cálculo de racha ya trata
  cualquier fecha ausente en el historial como racha cortada.
- **Bug de zona horaria a evitar**: parsear `lastActive` (string
  "YYYY-MM-DD") con `new Date("YYYY-MM-DD")` lo interpreta como UTC
  medianoche, que en Argentina (UTC-3) puede caer en el día calendario
  anterior al construir un objeto `Date` y leer `.getDay()`. Hay que
  construirlo con componentes (`new Date(y, m-1, d)`), como ya se hace en
  el resto del código (`isoDate`, `todayKey`).
- **Cumpleaños sin suscripción activa**: si el Worker recibe un POST a
  `/birthdays` sin que exista antes una suscripción guardada, lo rechaza
  (400) en vez de guardar un dato húerfano.

## Acceptance criteria and high-level workflow

1. Al completar todos los ítems del día, aparece (sin recargar) un badge
   de racha con el número actualizado.
2. Al abrir la app en un día calendario nuevo, si el día anterior había
   quedado 100% completo, la racha del historial queda un día más larga;
   si no, se corta.
3. `npm test` cubre `computeStreak()` con casos: racha vacía, racha
   consecutiva, racha con hueco (corta), hoy completo sí/no.
4. Al activar recordatorios push, los cumpleaños actuales se sincronizan al
   Worker (verificable vía `wrangler kv key get birthdays --remote`).
5. Editar/agregar/borrar un cumpleaños con recordatorios activos
   resincroniza automáticamente.
6. Al desactivar recordatorios, se borran tanto la suscripción como los
   cumpleaños de la KV.
7. Un día antes de un cumpleaños guardado, llega un push
   "🎂 Mañana cumple: {nombre(s)}" (verificado a mano, igual que el push de
   rutina del Nivel 16 — se puede forzar con un script de prueba sin
   esperar al cron real).
8. La pestaña Caminata muestra los 5 números de estadísticas, correctos
   contra el historial real (verificable a mano con un par de caminatas
   de prueba).
9. `npm run test:all` en verde, local y en CI.

## Implementation detail

### Archivos modificados
```
logic.js                + computeStreak(historyDates, todayIso, todayCompleted)
                         + alguna función de agregación de estadísticas de
                           caminata (suma, filtro por semana/mes, máximo) —
                           pura, sin DOM, para poder testearla
tests/logic.test.js      + tests de computeStreak y de las funciones de
                          agregación de caminata
app.js                    + STREAK_STORAGE_KEY, hook en loadCheckState()
                          para cerrar el día anterior y grabar el historial
                          + badge de racha en renderDay() / al tildar
                          + session.timestamp en stopWalk()
                          + panel de 5 números en renderWalkHistory()
                          + sync de cumpleaños al Worker (en
                          subscribeToReminders() y en saveBirthdays(),
                          solo si hay suscripción activa)
index.html                + contenedor del badge de racha (header) y del
                          panel de estadísticas (pestaña Caminata)
styles.css                + estilos de ambos, siguiendo el sistema de
                          stat-tiles existente si aplica (dataviz skill)
cloudflare/src/worker.js  + endpoint POST /birthdays (valida forma,
                          rechaza si no hay suscripción, guarda en KV)
                          + extiende /unsubscribe para borrar también
                          `birthdays`
                          + refactor: sendPush(env, subscription, message)
                          compartido entre el caso de bloque de rutina y
                          el caso de cumpleaños
                          + nuevo scheduled() branch para el cron diario
                          de cumpleaños (calcula "mañana" en hora
                          Argentina, busca coincidencias, arma el mensaje)
cloudflare/wrangler.toml  + 4to Cron Trigger diario, horario distinto a
                          los 3 de rutina (ej. 8:00 ART = "0 11 * * *")
```

### Testing
Mismo patrón que niveles anteriores: lógica pura (`computeStreak`, las
agregaciones de caminata) con tests en `tests/*.test.js`; UI verificada a
mano (badge de racha, panel de estadísticas) y con Playwright donde
aplique sin depender de fechas reales (mockeando `Date`/localStorage con
historiales de prueba armados a mano, como ya se hace mockeando
`Notification`/`pushManager` en `tests/ui/reminders.spec.js`); el push de
cumpleaños real se verifica a mano igual que el de rutina en el Nivel 16
(se puede forzar con un script de prueba sin esperar al cron).

## Deferred aspects

- **Racha con perdones/freezes** (no cortar la racha si se salta un día
  puntual): no pedido, agregaría una decisión de producto (¿cuántos
  perdones? ¿se acumulan?) que no se planteó. Encajaría como una regla más
  en `computeStreak()` si se pide.
- **Aviso de cumpleaños configurable** (más de 1 día de anticipación, o
  elegible por el usuario): queda fijo en 1 día por ahora. Encajaría
  agregando un input en la UI que viaje al Worker junto con la lista.
- **Notificación push por hito de racha** ("¡5 días seguidos!"): no
  pedido, es una extensión natural pero es otra decisión de producto
  (¿en qué números avisar?). Encajaría reusando el mismo Worker si se
  sincronizara también el estado de la racha (lo cual reabre la pregunta
  de privacidad del Nivel 16 para el checklist).
- **Gráfico/calendario visual de caminatas**: se pidieron números, no un
  gráfico — si más adelante se quiere una vista tipo calendario o gráfico
  de barras, es un trabajo de UI aparte, no una extensión trivial de este
  panel de 5 números.
- **Reconstrucción retroactiva de fecha real en caminatas viejas**: no hay
  forma confiable de recuperarla (`dateLabel` es un texto ya formateado,
  parsearlo de vuelta a fecha es frágil). Las caminatas de antes de este
  nivel quedan permanentemente fuera de los desgloses semanal/mensual y de
  la racha de caminata.

## Implementation guidance
- TDD: apagado, salvo `logic.js` — mismo patrón que niveles anteriores:
  lógica pura nueva lleva su test en `tests/`, el resto (UI, Worker) se
  verifica manualmente / con Playwright donde aplique.
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por terminada;
  verificación manual del push de cumpleaños de punta a punta (con un
  cumpleaños de prueba a 1 día) antes de cerrar el nivel.
- Review: `/code-review` al final del nivel, después de que todas las
  tareas estén hechas y la verificación pase — mismo gate que Niveles
  15-16 (encontró bugs reales las dos veces). Atención especial al
  parseo de fechas (zona horaria) y al endpoint nuevo `/birthdays`
  (validación de forma, igual que `/subscribe`).
- Scope: construir solo las 3 partes de este spec — no agregar
  configuración de días de anticipación, gráficos, ni perdones de racha
  sin volver a pedir aprobación.
- Deferred aspects: ledger de arriba reconciliado; no hay tracker externo
  para este proyecto, el roadmap vive en el README.
- Build order: 1) `computeStreak()` + tests (piso de lógica pura,
  reusado por las dos rachas) → 2) racha de rutina completa (historial +
  hook + badge) → 3) `timestamp` en caminatas + funciones de agregación +
  tests → 4) panel de estadísticas de caminata en la UI → 5) Worker:
  endpoint `/birthdays` + refactor `sendPush()` + cron diario → 6) sync de
  cumpleaños desde el cliente (activar/editar/desactivar) → 7)
  verificación manual del push de cumpleaños → 8) `/code-review`.
- Routing: todo en la sesión principal, secuencial — nivel acotado, sin
  necesidad de delegar a subagentes por eficiencia de tokens.
- Orchestrator: sesión actual, sin cambio de modelo.
