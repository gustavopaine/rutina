Status: Approved

# Nivel 18 — Recordatorio de fin de semana, aviso de cumpleaños configurable, racha con perdones y Dependabot

## Review summary

Cuatro funcionalidades independientes agrupadas en un mismo nivel, a
pedido del usuario (mismo patrón que Niveles 16-17): (1) recordatorio
push también sábado y domingo, hoy sin aviso porque esos bloques son
"Libre" sin horario fijo; (2) elegir desde la UI cuántos días antes avisa
el cumpleaños (hoy fijo en 1, hardcodeado en el Worker); (3) perdonar
hasta un día salteado por semana sin cortar la racha de rutina; (4)
activar Dependabot (hardening pendiente desde Nivel 11-15, nunca hecho).

**[decidido con el usuario]** Racha con perdones: 1 perdón por semana
calendario, automático (no hay que activarlo), no acumulable, con un
indicador visible junto al badge de racha. Era la única de las cuatro
piezas que era una decisión de producto real, no inferible del código —
confirmado directamente con el usuario en esta ronda.

**[agent decision]** Horarios del recordatorio de fin de semana: 9:00
(Mañana), 14:00 (Tarde), 21:00 ART (Noche) — más tarde que los horarios
de semana (6:00/12:30/19:00) porque los bloques de sábado/domingo son
"Libre" (sin horario escolar/changas fijos), no hay una hora "correcta"
en los datos existentes de la que inferir esto. Es un cron trivial de
cambiar si no te sirve.

**[agent decision]** Rango de días de anticipación para el aviso de
cumpleaños: 1 a 7 días, select en la UI, default 1 (mismo comportamiento
que hoy si no se toca). Vive en la misma KV que la suscripción/cumpleaños
(nueva clave `notice-days`), no en `wrangler.toml` — si viviera ahí,
cambiar el valor requeriría un redeploy manual, contradiciendo el pedido
de que sea configurable "desde la UI".

**[agent decision]** Dependabot: PRs semanales, sin auto-merge (alguien
las revisa a mano, como todo lo demás en este repo), cubre las dos
carpetas con `package.json` (raíz y `cloudflare/`).

**No hace falta tocar**: el resto de la lógica de racha (`computeStreak()`
sigue siendo el mismo algoritmo, solo cambia qué cuenta como "hueco"),
ni el diseño del Worker (mismo patrón de `sendPush()`/KV que Niveles
16-17), ni el resto de la UI de cumpleaños/racha ya construida.

## Decisions and assumptions requiring review

### Racha con perdones (confirmado con el usuario)

- **Cuántos perdones**: 1 por semana calendario (lunes a domingo, mismo
  criterio que el resto de la app — `mondayOffset()` en `logic.js`), no
  acumulable: si no se usa esa semana, se pierde. Evita que se acumulen
  meses de perdones sin usar y de golpe "tapen" semanas enteras de
  inactividad, lo cual desvirtuaría la racha como métrica.
- **Automático**: el día salteado simplemente no corta la racha si
  todavía queda perdón disponible esa semana, sin que el usuario tenga
  que hacer nada.
- **Visible**: indicador chico cerca del badge de racha, algo como
  "❄️ 1 perdón disponible esta semana" / "❄️ Perdón usado esta semana" —
  si no se mostrara nada, un día salteado que no corta la racha
  parecería un bug.

### Ya decididas (agent decisions, arriba en el resumen)
Horarios del recordatorio de fin de semana, rango/storage del aviso de
cumpleaños configurable, alcance de Dependabot — ver resumen.

## Scope boundary

### This iteration
1. **Recordatorio de fin de semana**: 3 crons nuevos en el Worker
   (sábado y domingo, mismos 3 horarios-tipo que semana pero adaptados
   a "Libre"), mismo mensaje genérico que los de semana.
2. **Aviso de cumpleaños configurable**: select de 1-7 días en la UI
   (cerca del botón de recordatorios o en la pestaña Cumples), se
   sincroniza al Worker igual que la lista de cumpleaños, el cron lee el
   valor guardado en vez de un fijo "+1 día".
3. **Racha con perdones**: `computeStreak()` extendido con un parámetro
   de perdones disponibles/usados por semana; indicador visual en el
   badge de racha.
4. **Dependabot**: `.github/dependabot.yml`, PRs semanales, root +
   `cloudflare/`, sin auto-merge.

### Explicit non-goals
- No cambia el modelo de privacidad (mismos datos ya viajan al Worker,
  ninguno nuevo salvo el número de días de anticipación, que no es dato
  personal).
- No es un rediseño de la pestaña de recordatorios ni del badge de
  racha — son agregados chicos sobre lo que ya existe.
- Dependabot no incluye auto-merge ni CI adicional más allá de lo que
  ya corre (`unit-tests`/`ui-tests` en cada PR, ya configurado).

## Risks and failure modes

- **Cron nuevo en el Worker**: 3 crons más suman al límite de Cron
  Triggers del plan free de Cloudflare (bien por debajo, hoy son 4, con
  esto quedan 7 — el límite gratuito es bastante más alto).
- **Perdones y zona horaria**: "semana calendario" tiene que calcularse
  con el mismo criterio lunes-primero que ya usa `mondayOffset()` en
  `logic.js` (reusar, no reinventar) para evitar otro bug de huso
  horario como los ya documentados en Niveles 5 y 17.
- **`notice-days` mal sincronizado**: si el valor no llega a sincronizarse
  al Worker (ej. sin conexión), el cron usa el último valor guardado en
  KV — igual que ya pasa con la lista de cumpleaños, mismo patrón/mismo
  riesgo ya aceptado en Nivel 17.
- **Dependabot ruido**: PRs semanales pueden acumularse si nadie las
  revisa — aceptable, es exactamente lo que ya pasa (o no) con el resto
  del mantenimiento manual de este repo.

## Acceptance criteria and high-level workflow

1. Sábado y domingo, con recordatorios activos, llegan pushes a los 3
   horarios nuevos (verificable a mano, mismo método que Nivel 16-17: se
   puede forzar moviendo el cron temporalmente).
2. Cambiar el select de "días de anticipación" en la UI y volver a
   sincronizar hace que el cron de cumpleaños avise ese número de días
   antes en vez de 1 (verificable moviendo el cron y con una fecha de
   prueba).
3. `npm test` cubre `computeStreak()` extendido con perdones: sin
   perdón disponible corta igual que antes, con perdón disponible no
   corta y lo consume, un perdón no se lleva a la semana siguiente si no
   se usó.
4. El badge de racha muestra el estado del perdón cuando hay uno
   disponible o recién usado.
5. Un PR de Dependabot aparece la primera semana después del merge
   (verificable en la pestaña Pull Requests del repo).
6. `npm run test:all` en verde, local y en CI.

## Implementation detail

### Archivos modificados
```
logic.js                + computeStreak() extendido con parámetro de
                           perdones (firma a definir en la
                           implementación, cubriendo semana calendario
                           vía mondayOffset() ya existente)
tests/logic.test.js      + tests de computeStreak() con perdones
app.js                    + UI de días de anticipación (select +
                          sync al Worker), indicador de perdón en el
                          badge de racha, historial de racha
                          extendido si hace falta marcar perdones
                          usados
index.html                + contenedor del select de anticipación
styles.css                + estilos del select y del indicador de
                          perdón
cloudflare/src/worker.js  + 3 crons de fin de semana en BLOCK_MESSAGES
                          + handleBirthdayCron() lee notice-days de
                          la KV en vez de +1 fijo
cloudflare/wrangler.toml  + 3 Cron Triggers nuevos (sábado/domingo)
.github/dependabot.yml    (nuevo) — npm, root + cloudflare/, semanal
README.md                + roadmap Nivel 18, sección de recordatorios
                          actualizada
```

### Testing
Mismo patrón que niveles anteriores: `computeStreak()` con perdones
lleva tests en `tests/logic.test.js` (TDD para esa parte); UI del
select y del indicador de perdón verificada a mano y con Playwright
donde aplique; recordatorios de fin de semana y aviso de cumpleaños
configurable se verifican a mano moviendo el cron temporalmente, mismo
método ya usado y documentado en Nivel 17 (revertir el cron después,
sin excepción).

## Deferred aspects

- **Perdones configurables por el usuario** (elegir cuántos por semana):
  queda fijo en 1 por ahora — si se pide más adelante, encaja como un
  número más en la UI, mismo patrón que `notice-days`.
- **Recordatorio por tarea individual** (ya deferido desde Nivel 16): no
  pedido en este nivel tampoco.
- **Auto-merge de Dependabot**: no pedido, y va en contra de la cultura
  de revisión manual de este repo — reconsiderarlo si el volumen de PRs
  se vuelve una carga real.

## Implementation guidance
- TDD: apagado, salvo `logic.js` — mismo patrón que niveles anteriores.
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por terminada;
  verificación manual de los 2 flujos de push (fin de semana, aviso de
  cumpleaños configurable) antes de cerrar el nivel — moviendo el cron
  temporalmente y revirtiéndolo después, sin excepción (Nivel 17 mostró
  cuánto puede tardar esto si no se hace con cuidado: confirmar
  `git push` y el bump de `CACHE_NAME` del service worker ANTES de
  pedirle al usuario que pruebe algo en su celular real).
- Review: `/code-review` al final del nivel, después de que todas las
  tareas estén hechas y la verificación pase — mismo gate que Niveles
  15-17.
- Scope: construir solo las 4 partes de este spec — no agregar
  configuración de perdones, auto-merge de Dependabot, ni nada fuera de
  esto sin volver a pedir aprobación.
- Deferred aspects: ledger de arriba reconciliado; no hay tracker
  externo para este proyecto, el roadmap vive en el README.
- Build order: 1) Dependabot (aislado, cero riesgo, no depende de nada
  más) → 2) `computeStreak()` con perdones + tests → 3) UI del
  indicador de perdón → 4) recordatorio de fin de semana en el Worker →
  5) aviso de cumpleaños configurable (UI + Worker) → 6) verificación
  manual de los dos flujos de push → 7) `/code-review`.
- Routing: todo en la sesión principal, secuencial — nivel acotado, sin
  necesidad de delegar a subagentes por eficiencia de tokens.
- Orchestrator: sesión actual, sin cambio de modelo.
