Status: Approved

# Nivel 16 — Recordatorios push para la rutina

## Review summary

Agrega recordatorios push reales (llegan aunque la app esté cerrada) que avisan
a Verónica cuándo arranca cada bloque de su rutina (Mañana/Tarde/Noche), de
lunes a viernes, en el horario fijo que ya existe en `app.js`. Como la app no
tiene backend, esto requiere agregar una piecita server-side nueva —un
Cloudflare Worker gratuito con Cron Triggers— que dispara el envío a la hora
justa; es la única forma de lograr un push real, no hay alternativa
100%-cliente que funcione con la app cerrada (documentado y confirmado con el
usuario). El resto de la app (rutina, cumples, caminata, biblioteca) no
cambia.

**[added]** Worker + KV en Cloudflare como pieza server-side nueva —
inevitable para push real; costo: nueva cuenta gratuita, nuevo secreto (clave
privada VAPID) a administrar fuera del repo, un paso de deploy manual
separado de GitHub Pages.
**[added]** Helper puro `urlBase64ToUint8Array()` en `logic.js` (con test) —
necesario para pasar la VAPID public key al navegador vía
`pushManager.subscribe()`; se agrega al módulo de lógica pura existente en
vez de vivir suelto en `app.js`, seteando el mismo patrón que el resto del
código testeable.
**[added]** Manejo de suscripción "stale" (410/404 del push service) en el
Worker, limpiando la KV — no lo pidió el usuario explícitamente, pero sin
esto el Worker rompe silenciosamente ni bien el navegador invalida la
suscripción (reinstalación, cambio de permisos). Costo: unas pocas líneas
más en el Worker.

**No hace** (decisiones ya conversadas con el usuario, no abiertas a
relitigar en esta ronda): recordatorio por tarea individual (solo por
bloque), recordatorio sábado/domingo, saltear el aviso si ya tildó todo el
bloque, soportar más de un dispositivo suscripto a la vez, deploy automático
del Worker desde CI.

## Decisions and assumptions requiring review

- **Horarios de aviso = horario de bloque ya existente**, no un horario
  nuevo a definir: Mañana 6:00, Tarde 12:30, Noche 19:00 (hora Argentina,
  UTC-3 fija, sin horario de verano). Son los mismos que ya están en
  `DEFAULT_DATA` de `app.js` para lunes a viernes (verificado: los 5 días
  comparten esos 3 horarios). Reversible: son 3 líneas de cron en
  `wrangler.toml`.
- **Suscripción única, no lista** — la KV guarda una sola suscripción bajo
  una clave fija; suscribirse desde un dispositivo nuevo pisa la anterior.
  Correcto para el caso de uso (una sola persona, un teléfono). Reversible
  más adelante si hace falta multi-dispositivo (ver Deferred aspects).
- **Botón "🔔 Activar recordatorios" en el pie de página**, junto a
  Exportar/Importar datos — mismo lugar que las otras acciones globales de
  la app, no una pantalla de configuración nueva. Decisión de bajo costo,
  reversible.
- **Copy de la notificación**: genérico por bloque, ej. "🌅 Arrancó la
  Mañana — revisá tu rutina" / "☀️ Arrancó la Tarde" / "🌙 Arrancó la
  Noche", sin mencionar tareas puntuales (evita filtrar contenido de la
  rutina en la notificación misma, que puede quedar visible en la pantalla
  de bloqueo).
- **Sin verificación proactiva de salud de la suscripción** en la UI más
  allá de leer `pushManager.getSubscription()` al cargar la app — si la
  suscripción se cae, el botón simplemente vuelve a mostrar "Activar" la
  próxima vez que abra la app; no hay alertas server→usuario si el envío
  falla. Aceptable para un solo usuario; ver Deferred aspects si esto
  importa más adelante.

## Scope boundary

### This iteration
- Botón para activar/desactivar recordatorios push (pide permiso de
  notificaciones, se suscribe vía `pushManager`, registra la suscripción en
  el Worker).
- `service-worker.js`: listener `push` (muestra la notificación) y
  `notificationclick` (enfoca/abre la app).
- Cloudflare Worker con Cron Triggers a las 3 horas de bloque, lunes a
  viernes, que manda el push usando VAPID.
- KV namespace con la suscripción (única).
- Helper `urlBase64ToUint8Array()` en `logic.js` + test.
- Documentación en README: qué hace la feature, limitaciones de iOS, cómo
  se generan las VAPID keys y se deployea el Worker (paso manual, una vez).

### Deferred aspects summary
Multi-dispositivo, recordatorio fin de semana, recordatorio por tarea en vez
de por bloque, saltear aviso si ya completó el bloque, deploy del Worker
automatizado desde CI. Detalle y condición de retorno de cada uno en
`Deferred aspects` más abajo.

### Explicit non-goals
- **No** sincroniza el estado del checklist (tildado/no tildado) al backend
  — decisión explícita del usuario para no romper el modelo de privacidad
  actual (todo el contenido de la rutina, incluida la actividad de Lara,
  vive solo en el dispositivo). El push es "ciego": avisa por horario, no
  por lo que falta.
- **No** soporta iOS < 16.4 ni iOS sin la PWA agregada a la pantalla de
  inicio — limitación de la plataforma (Apple), no de esta implementación;
  ya documentada en el README para Wake Lock, se extiende la misma nota.
- **No** agrega login ni cuentas de usuario — la suscripción sigue siendo
  anónima (solo un endpoint + claves públicas del navegador), como el resto
  de la app.

## Risks and failure modes

- **Repo público + secreto real**: el repo es público (confirmado en Nivel
  15). La clave privada VAPID nunca va al repo — se setea con
  `wrangler secret put VAPID_PRIVATE_KEY` (vive en Cloudflare, no en
  `wrangler.toml` ni en ningún archivo versionado). Se agrega
  `cloudflare/.dev.vars` a `.gitignore` para el desarrollo local con
  `wrangler dev`. Esto es exactamente el tipo de cosa a chequear en el
  `/code-review` de cierre.
- **Suscripción caduca sin aviso** (el navegador la invalida por reinstalar
  la PWA, limpiar datos, etc.): el Worker debe capturar el 404/410 que
  devuelve el push service al mandar a una suscripción muerta y borrarla de
  la KV en vez de reintentar/loguear error indefinidamente.
- **Costo**: 3 envíos/día a un solo suscriptor está muy por debajo de
  cualquier límite del free tier de Cloudflare (Cron Triggers, KV,
  invocaciones) — no hay riesgo de facturación inesperada.
- **Zona horaria**: Argentina no tiene horario de verano desde 2009, así
  que UTC-3 fijo es seguro de hardcodear en los crons sin lógica de DST.

## Acceptance criteria and high-level workflow

1. Verónica abre la app, toca "🔔 Activar recordatorios" en el pie de
   página → el navegador pide permiso de notificaciones → al aceptar, la
   app se suscribe vía `pushManager.subscribe()` y manda esa suscripción al
   Worker (`POST /subscribe`) → el botón pasa a mostrar "🔕 Desactivar
   recordatorios".
2. A las 6:00 / 12:30 / 19:00 (hora Argentina), lunes a viernes, llega una
   notificación push al dispositivo suscripto **aunque la app esté
   completamente cerrada** (verificado a mano en Android con la PWA
   instalada; en iOS si hay un dispositivo 16.4+ disponible para probar).
3. Tocar la notificación abre/enfoca la app.
4. Tocar "🔕 Desactivar recordatorios" da de baja la suscripción localmente
   y en el Worker (`POST /unsubscribe`) — no llegan más pushes.
5. Ningún texto de tarea, nombre, ni estado de tildado sale nunca del
   dispositivo hacia el Worker — solo el endpoint/claves de la suscripción
   push (necesarios para cualquier Web Push) llegan al backend.
6. `npm test` sigue en verde, con test nuevo para
   `urlBase64ToUint8Array()`.
7. README documenta la feature y el setup manual único de Cloudflare
   (generar VAPID keys, crear KV namespace, `wrangler secret put`,
   `wrangler deploy`).

## Implementation detail

### Archivos nuevos
```
cloudflare/
  wrangler.toml       Config del Worker: nombre, KV binding, 3 Cron Triggers
                       (Mañana/Tarde/Noche, lun-vie, en UTC)
  package.json         Deps del Worker (web-push, con nodejs_compat activado
                       en wrangler.toml para que corra en el runtime de
                       Workers)
  src/worker.js         fetch(): POST /subscribe, POST /unsubscribe
                       scheduled(): arma el mensaje según qué cron disparó
                       (event.cron) y manda el push a la suscripción
                       guardada en KV; si el push service devuelve
                       404/410, borra la suscripción de la KV.
  .dev.vars.example     Plantilla de variables locales (sin secretos reales)
```

### Archivos modificados
```
logic.js               + urlBase64ToUint8Array(base64String)
tests/logic.test.js    + test del helper de arriba
app.js                  + lógica del botón activar/desactivar (permiso,
                        subscribe/unsubscribe, POST al Worker), + constante
                        VAPID_PUBLIC_KEY y PUSH_SERVER_URL (públicas, van
                        en el código igual que QUICK_LINKS)
service-worker.js       + listener 'push' (showNotification)
                        + listener 'notificationclick' (focus/open)
index.html              + botón en el pie de página
styles.css              + estilo del botón nuevo (reusa clases existentes
                        de los otros botones del pie si aplica)
README.md               + sección de la feature y el setup de Cloudflare
                        + nota de iOS extendida (push también requiere
                        16.4+ y PWA instalada)
.gitignore              + cloudflare/.dev.vars
```

### Flujo de datos
Cliente ↔ Worker: solo dos POSTs livianos (`/subscribe`, `/unsubscribe`) con
el objeto `PushSubscription` estándar del navegador (endpoint + claves
p256dh/auth) — nada del contenido de la rutina viaja nunca.

Worker (cron) → push service del navegador (Google/Mozilla/Apple según el
dispositivo) → dispositivo. El Worker no sabe ni le importa qué tareas tiene
cada bloque; el texto del push es estático por bloque, definido en el propio
Worker.

### Testing
- **Lógica pura**: test de `urlBase64ToUint8Array()` en
  `tests/logic.test.js`, siguiendo el patrón existente.
- **UI (Playwright)**: test de que el botón existe, que al tocarlo se llama
  a `Notification.requestPermission` (mockeado, sin pegarle a un push
  service real desde CI) y que el label cambia a "Desactivar". No se testea
  el envío real de push desde CI/Playwright — no es razonablemente
  simulable sin el Worker real y un dispositivo real.
- **Verificación manual** (igual que el offline de Nivel 6 o el GPS
  simulado de Nivel 7): probar el recordatorio real de punta a punta con la
  PWA instalada y cerrada, en al menos Android; en iOS si hay un dispositivo
  16.4+ a mano.
- El Worker en sí (`cloudflare/src/worker.js`) no tiene test automatizado en
  este MVP — se verifica manualmente con `wrangler dev` y una suscripción de
  prueba. Ver Deferred aspects.

## Deferred aspects

- **Multi-dispositivo**: la KV guarda una sola suscripción; suscribirse
  desde un segundo teléfono pisa la primera. Por qué se deja afuera: el uso
  actual es un solo dispositivo. Vuelve a estar en alcance si en algún
  momento más de una persona (ej. Gustavo también) quiere recibir el mismo
  recordatorio. Encaja cambiando la KV de un valor único a una lista y
  iterando al mandar el push.
- **Recordatorio sábado/domingo**: los bloques de fin de semana no tienen
  horario fijo ("Libre"), así que no hay recordatorio esos días. Por qué:
  decisión explícita del usuario en esta ronda. Vuelve a estar en alcance si
  pide un horario "de cortesía" para el finde — encaja agregando 3 Cron
  Triggers más al mismo Worker.
- **Saltear el aviso si ya tildó el bloque**: requiere sincronizar el
  checklist al backend, lo que cambia el modelo de privacidad actual (hoy
  todo vive solo en el dispositivo). Por qué se deja afuera: decisión
  explícita del usuario, prioriza privacidad sobre precisión del aviso.
  Volvería a estar en alcance solo si el usuario decide explícitamente que
  quiere ese trade-off.
- **Recordatorio por tarea individual** (no por bloque): las tareas no
  tienen horario propio en el modelo de datos actual, solo el bloque lo
  tiene. Encajaría si en algún momento se agrega horario por tarea al
  editor de rutina — cambio de modelo de datos más grande, no parte de este
  nivel.
- **Deploy del Worker automatizado desde CI**: por ahora `wrangler deploy`
  es manual, igual que la generación de las VAPID keys. Por qué: agregar un
  token de Cloudflare a los secrets de GitHub Actions es una decisión de
  infraestructura aparte, no atada a que la feature funcione. Encajaría
  como un job nuevo en el workflow existente de CI si el Worker empieza a
  cambiar seguido.
- **Test automatizado del Worker**: sin test hoy: se verifica a mano con
  `wrangler dev`. Encajaría con `vitest` + `@cloudflare/vitest-pool-workers`
  si el Worker crece en complejidad.

## Implementation guidance
- TDD: apagado, salvo `logic.js` — mismo patrón que niveles 1-15: lógica
  pura nueva lleva su test en `tests/`, el resto (Worker, UI) se verifica
  manualmente / con Playwright donde aplique, sin exigir test-first.
- Isolation: checkout actual (`main`), sin worktree — así se trabajó en
  niveles anteriores.
- Verify: `npm run test:all` (unit + UI) antes de dar cualquier tarea por
  terminada; además, verificación manual de push real de punta a punta
  (PWA instalada, app cerrada) antes de dar el nivel por cerrado.
- Review: `/code-review` al final del nivel, después de que todas las
  tareas estén hechas y la verificación pase — puesto especial atención al
  manejo del secreto VAPID (que no termine en el repo público) dado que
  este nivel toca eso directamente.
- Scope: construir solo lo que este spec especifica — no agregar
  multi-dispositivo, recordatorio de finde, ni sync de estado del checklist
  sin volver a pedir aprobación (son "Deferred aspects", no MVP).
- Deferred aspects: ledger de arriba reconciliado; no hay tracker externo
  para este proyecto (roadmap vive en el README, "Roadmap (niveles)").
- Build order: 1) helper `urlBase64ToUint8Array` + test (piso de lógica
  pura) → 2) Worker (`/subscribe`, `/unsubscribe`, `scheduled`) + deploy
  manual + generación de VAPID keys → 3) UI del botón + listeners del
  service worker, apuntando al Worker ya deployado → 4) test de UI
  (Playwright) del botón → 5) verificación manual end-to-end del push real
  → 6) README → 7) `/code-review`.
- Routing: todo el trabajo (helper, Worker, UI, tests, README) se hace en
  la sesión principal — es un nivel chico, secuencial, sin necesidad de
  delegar a subagentes por eficiencia de tokens.
- Orchestrator: sesión actual, sin cambio de modelo — el trabajo es
  mecánico y acotado, no necesita mayor esfuerzo de razonamiento que los
  niveles anteriores.
