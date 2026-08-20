Status: Approved

# Nivel 23 — Nombre editable y frases motivacionales

## Review summary

Dos funciones independientes, empaquetadas en un mismo nivel a pedido
del usuario:

1. **Nombre editable**: "Verónica" en el header (`.app-header-name`)
   deja de estar hardcodeado — cualquiera que instale la app puede
   poner el nombre que quiera, guardado en `localStorage`, editable
   tocando el nombre en el header.
2. **Frases motivacionales**: la celebración de bloque completo
   (`celebrateBlockComplete()`, hoy "🎉 ¡Mañana completa! 🎉") deja de
   mostrar un texto genérico fijo y en su lugar muestra una frase
   motivacional/filosófica elegida al azar de un banco editable (30-35
   frases semilla + agregar/editar/borrar propias), mismo patrón CRUD
   que Biblioteca/Cumpleaños/Canción del día.

Ninguna de las dos toca `cloudflare/`, ni cambia el stack técnico
(sigue HTML/CSS/JS vanilla, sin build step).

## Decisions and assumptions requiring review

### Confirmadas con el usuario (esta ronda)

- **Reemplazo total del texto del banner**: la frase motivacional es
  el único texto — no menciona qué bloque se completó (eso ya se ve en
  la barra de progreso de la pantalla).
- **CRUD de frases en el pie de página**: mismo lugar donde ya viven
  Exportar/Importar datos y el aviso de cumpleaños — sin pestaña nueva.

### Ya decididas (agent decisions)

- **Nombre editable, solo en el header (sin duplicado en el pie)**:
  tocar el nombre (o el ícono ✏️ al lado, mismo ícono que usa el resto
  de la app para "editar") lo convierte en un input inline, Enter/blur
  guarda, Escape cancela. No hace falta una segunda entrada en
  "configuración" para lo mismo — la del header ya es descubrible
  (mismo criterio que "menos superficie nueva" de niveles anteriores).
- **El nombre editable NO renombra el cumpleaños semilla de
  "Verónica"** en `DEFAULT_BIRTHDAYS` — son datos independientes; si el
  usuario quiere renombrar ese cumpleaños, ya puede hacerlo a mano
  desde la pestaña Cumples (CRUD ya existente). Evita acoplar dos
  estructuras de datos no relacionadas.
- **El subtítulo "Cuarteto a pleno · Euge Quevedo" no cambia** — es
  identidad temática de la app, no el nombre de la persona.
- **`<title>`, meta description y `manifest.json` (nombre del ícono
  PWA) siguen fijos** — son archivos estáticos servidos, cambiarlos
  dinámicamente por usuario no es viable sin build step (y el nombre
  del ícono PWA ya quedó fijado al instalar la app en el celular,
  cambiarlo después no lo actualizaría ahí de todos modos). Fuera de
  alcance.
- **`celebrateStreakMilestone()` (racha) NO se toca** — solo
  `celebrateBlockComplete()`. La racha muestra información real
  (cuántos días), no es un texto genérico; reemplazarla por una frase
  perdería esa información. Comparten `showCelebrationBanner()` pero
  cada una arma su propio texto.
- **Selección al azar, no determinística por fecha**: a diferencia de
  "canción del día" (mismo tema todo el día, a propósito), acá cada
  vez que se completa un bloque se sortea una frase distinta — es
  literalmente lo que se pidió ("que se muestre al azar"). Función
  pura testeable: recibe la lista y una fuente de aleatoriedad
  inyectable (`Math.random` por defecto), mismo criterio que el resto
  de `logic.js` recibe sus variables en vez de leerlas del entorno.
- **Sin categorías/etiquetas** (motivación vs. filosofía vs.
  superación): una sola lista plana, mezclada — no se pidió filtrado
  ni categorización, agregarla sería superficie no pedida.
- **Fallback si la lista queda vacía** (el usuario borra todas las
  frases, incluidas las semilla): banner con un texto fijo genérico de
  respaldo ("🎉 ¡Bloque completo! 🎉") en vez de romper o mostrar vacío.
- **Storage keys**: `veronica-user-name` (string simple) y
  `veronica-motivational-phrases` (array `{id, text}`) — mismo prefijo
  `veronica-` que el resto (es el namespace interno de la app, no
  cambia aunque el nombre mostrado sí).
- **Campos del form de frase**: un solo campo de texto (sin link, a
  diferencia de Biblioteca/Canción del día) — no hace falta el helper
  compartido `readCrudNameUrlForm()`, se lee directo en
  `submitPhraseForm()`.
- **Filas del listado de frases**: mismo patrón sin-link ya usado para
  el historial de Ciclo (Nivel 21) — `.lib-item-info-wrap` en vez de
  `.lib-item a`, cero CSS nuevo.

## Scope boundary

### This iteration

1. **Nombre editable**:
   - `USER_NAME_STORAGE_KEY = 'veronica-user-name'`, `let userName`,
     `loadUserName()`/`saveUserName()` (mismo patrón load/save que el
     resto), semilla `'Verónica'` si no hay nada guardado.
   - `index.html`: `.app-header-name` pasa a tener contenido dinámico
     + un botón ✏️ chico al lado (o el propio texto es clickeable,
     accesible por teclado — `role="button"`/`tabindex`, con
     `aria-label` claro).
   - `renderUserName()` (o similar): pinta el nombre; al tocar, lo
     reemplaza por un `<input>` enfocado con el valor actual
     seleccionado, Enter/blur guarda (con validación mínima: no
     vacío, trim), Escape cancela sin guardar.
2. **Frases motivacionales**:
   - `MOTIVATIONAL_PHRASES_SEED` en `app.js`: 30-35 frases curadas
     (texto completo en "Implementation detail" abajo).
   - `PHRASES_STORAGE_KEY = 'veronica-motivational-phrases'`,
     `let motivationalPhrases`, `loadMotivationalPhrases()`/
     `saveMotivationalPhrases()`, semilla desde
     `MOTIVATIONAL_PHRASES_SEED` la primera vez (mismo patrón que
     `DAILY_SONGS_SEED`).
   - `logic.js`: `pickRandomPhrase(phrases, randomFn = Math.random)`
     — función pura, `null` si la lista está vacía.
   - `celebrateBlockComplete(blockTitle)` deja de armar el texto
     visible con `blockTitle` — en su lugar llama a
     `pickRandomPhrase()` sobre `motivationalPhrases` y arma
     `🎉 "${frase}" 🎉` (con fallback fijo si la lista está vacía, ver
     "Ya decididas"). El `announce()` para lectores de pantalla sí
     sigue mencionando el bloque ("¡Bloque ${blockTitle} completo! ${frase}")
     — a diferencia del banner visible, quien usa lector de pantalla no
     tiene la barra de progreso como referencia de qué se completó, así
     que ahí conviene no perder ese contexto.
   - Sección "✏️ Frases motivacionales" en el pie de página: lista
     (con editar/borrar) + form de agregar/editar (un campo de texto),
     mismo patrón visual que el resto de los CRUD de la app.
   - `exportData()`/`importData()`: se agregan `userName` y
     `motivationalPhrases`.

### Explicit non-goals

- No cambia `<title>`, meta description, ni `manifest.json`.
- No renombra el cumpleaños semilla de "Verónica" en
  `DEFAULT_BIRTHDAYS`.
- No toca `celebrateStreakMilestone()` ni el hito de racha.
- No agrega categorías/etiquetas a las frases.
- No agrega una pestaña nueva de "Configuración" (salvo que se
  confirme lo contrario en la pregunta abierta de arriba).
- No cambia el mecanismo de celebración en sí (confetti, timeout de
  3s, `announce()`) — solo el texto que arma `celebrateBlockComplete()`.

## Risks and failure modes

- **Nombre vacío o solo espacios**: validación mínima (trim, rechazar
  vacío) antes de guardar — si falla, el input queda abierto para
  corregir en vez de guardar un nombre vacío o cerrar sin guardar.
- **Frase muy larga rompe el banner**: `#blockCelebration` tiene
  `max-width` fijo y el texto ya hace wrap (ver CSS existente) — una
  frase larga simplemente ocupa más líneas, no rompe el layout, pero
  conviene que las frases semilla sean razonablemente cortas (una
  oración) para que se lean bien en 3 segundos.
- **XSS**: tanto el nombre como las frases son texto libre del usuario
  que se renderiza en el DOM — usar `escapeHtml()` (ya existente,
  usado en todo el resto de la app) en ambos casos, nunca
  `innerHTML` directo con el valor crudo.
- **Migración**: usuarios que ya tenían la app instalada sin este
  nivel simplemente ven "Verónica" (semilla) y el banco de frases
  semilla la primera vez que cargue este nivel — no hay reconstrucción
  retroactiva de nada, mismo criterio que niveles anteriores.

## Acceptance criteria and high-level workflow

1. Tocar el nombre en el header (o su ícono ✏️) lo vuelve editable;
   guardar un nombre nuevo lo persiste y se ve igual después de
   recargar.
2. Completar un bloque muestra una frase del banco (no el texto viejo
   "¡Bloque completa!"), con el mismo confetti/banner/anuncio de
   siempre.
3. Agregar, editar y borrar una frase propia desde el pie de página
   persiste en `localStorage` y esas frases entran en el sorteo.
4. Borrar todas las frases (incluidas las semilla) no rompe la
   celebración — muestra el texto de respaldo.
5. `userName` y `motivationalPhrases` viajan correctamente en
   `exportData()`/`importData()`.
6. `npm run test:all` en verde, local y en CI.

## Implementation detail

### Banco de frases semilla (MOTIVATIONAL_PHRASES_SEED)

```
1. "Un paso hoy vale más que diez promesas para mañana."
2. "La constancia le gana al talento cuando el talento no es constante."
3. "No tenés que ser perfecta, tenés que ser vos, todos los días un poco más."
4. "Cada hábito chico de hoy es la persona que vas a ser mañana."
5. "El descanso también es parte del progreso, no su opuesto."
6. "Lo que se repite, se vuelve fuerte — elegí bien qué repetís."
7. "No hace falta motivación todos los días, alcanza con la costumbre."
8. "Sé amable con vos misma: nadie construye nada bueno a los gritos."
9. "El orden de afuera ayuda a que la cabeza descanse un poco."
10. "Hoy alcanza con hacer lo que podés, no lo que idealizás."
11. "Cada tarea tildada es una prueba de que sos capaz de sostener algo."
12. "La calma no es no tener nada que hacer, es hacer las cosas una por vez."
13. "Nadie ve todos los días que elegiste seguir — pero cuentan igual."
14. "El cuerpo también aprende: moverte hoy le enseña a mañana."
15. "No compares tu día de hoy con tu mejor día — comparalo con ayer."
16. "Terminar lo chico también es terminar algo."
17. "La disciplina es quererte lo suficiente como para no abandonarte."
18. "Un día sin todo tildado sigue siendo un día que intentaste."
19. "Lo simple sostenido en el tiempo vale más que lo grande hecho una vez."
20. "Agradecé lo que ya lograste antes de mirar lo que falta."
21. "La rutina no te achica el mundo, te da un lugar firme para pararte."
22. "Cuidarte a vos también es cuidar a los que te rodean."
23. "No es necesario sentir ganas para empezar — las ganas a veces llegan después."
24. "Lo que hoy parece rutina, en un año va a ser una versión mejor de vos."
25. "Cada bloque completo es una decisión de no dejarte para después."
26. "El progreso real no se nota de un día para el otro, se nota mirando para atrás."
27. "Está bien pedir ayuda — sostener todo sola no te hace más fuerte."
28. "Hoy hiciste lo que pudiste con lo que tenías: eso ya es bastante."
29. "La paciencia con una misma es la base de cualquier cambio de verdad."
30. "Un mal día no borra todos los días buenos que vinieron antes."
31. "Elegí hoy de nuevo lo que ya elegiste ayer — ahí está la fuerza."
32. "No se trata de nunca cansarte, se trata de volver a intentarlo."
33. "Cada tarea de hoy es un mensaje para la vos de dentro de un año."
34. "Ir despacio también es ir — no hace falta correr para avanzar."
```

(34 frases; texto original en tono cálido/vos, sin citas atribuidas a
terceros para no citar mal ni usar contenido con derechos de autor.)

### Archivos modificados
```
logic.js       + pickRandomPhrase(phrases, randomFn = Math.random)
tests/logic.test.js
               + tests de pickRandomPhrase (lista vacía, selección
                 determinística con randomFn fijo, respeta el índice)
app.js         + userName, loadUserName()/saveUserName(),
                 renderUserName() o equivalente (edición inline)
               + MOTIVATIONAL_PHRASES_SEED, motivationalPhrases,
                 loadMotivationalPhrases()/saveMotivationalPhrases()
               + celebrateBlockComplete() usa pickRandomPhrase() en
                 vez de armar texto con blockTitle
               + submitPhraseForm()/editPhraseEntry()/
                 deletePhraseEntry(), reusa renderCrudItemsList()
                 (fila sin link, como el historial de Ciclo)
               + exportData()/importData(): userName,
                 motivationalPhrases
index.html     + estructura del nombre editable en el header (input +
                 ícono ✏️)
               + sección "Frases motivacionales" en el pie de página
styles.css     Probablemente cero clases nuevas (reusa .app-header-*,
               .lib-item/.lib-item-info-wrap, .lib-form, .lib-add-btn)
               — a confirmar si el input inline del nombre necesita un
               estilo propio chico
tests/ui/nivel23.spec.js (nuevo)
               Tests Playwright: nombre editable persiste, frase
               aparece al completar bloque (mockeable fijando
               randomFn en pruebas si hace falta, o verificando que el
               texto mostrado está en la lista de frases), CRUD de
               frases, export/import
README.md      + roadmap Nivel 23
```

### Testing
TDD encendido para `pickRandomPhrase()` en `logic.js` (mismo criterio
que el resto de funciones de cálculo puro del proyecto). El resto
(CRUD, edición inline del nombre) sigue el patrón ya establecido:
TDD apagado, cubierto con Playwright.

## Deferred aspects

- **Pestaña de "Configuración" dedicada**: si en el futuro se agregan
  más preferencias de usuario, puede valer la pena una pestaña propia
  en vez de seguir sumando secciones al pie de página — se retoma
  cuando haya una tercera preferencia que lo justifique.
- **Categorías de frases** (motivación/filosofía/superación): no
  pedido, se agrega si en algún momento se pide filtrar o elegir el
  tono según el contexto.

## Implementation guidance
- TDD: encendido para `pickRandomPhrase()` en `logic.js`; apagado para
  el resto (CRUD/UI, mismo patrón ya establecido).
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por
  terminada; verificación visual manual del nombre editable y de la
  celebración con frase nueva.
- Review: `/code-review` al final del nivel, mismo gate que niveles
  anteriores — con foco en XSS (escapeHtml en nombre y frases) y
  accesibilidad de la edición inline del nombre (foco, teclado,
  aria-label).
- Scope: construir solo lo de este spec — no agregar pestaña de
  Configuración ni categorías de frases sin volver a pedir aprobación.
- Deferred aspects: ledger de arriba; el roadmap vive en el README,
  sin tracker externo.
- Build order: 1) `pickRandomPhrase()` + tests → 2) nombre editable
  (aislado, bajo riesgo) → 3) banco de frases + CRUD en el pie de
  página → 4) `celebrateBlockComplete()` usa la frase al azar → 5)
  tests Playwright → 6) `/code-review`.
- Routing: sesión principal, secuencial — nivel de tamaño chico/medio,
  sin necesidad de delegar a subagentes.
- Orchestrator: sesión actual, sin cambio de modelo.
