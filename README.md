# Rutina de Verónica

[![Tests](https://github.com/gustavopaine/rutina/actions/workflows/test.yml/badge.svg)](https://github.com/gustavopaine/rutina/actions/workflows/test.yml)

App de una sola sección por pestaña (sin backend) para la rutina semanal de
Verónica, con tema de cuarteto (Euge Quevedo). Incluye:

- **Rutina semanal**: checklist por día (Mañana / Tarde / Noche), con progreso.
- **Cumpleaños**: lista con cuenta regresiva, editable desde la app.
- **Caminata**: tracking GPS en vivo con mapa (Leaflet + OpenStreetMap), sin costo.
- **Biblioteca**: accesos rápidos de música + tus propios links.

## Cómo abrirla

Ya está publicada en **https://gustavopaine.github.io/rutina/** — desde ahí
se puede instalar de verdad en el celular (Chrome → "Agregar a pantalla de
inicio"), con offline y Caminata por GPS funcionando.

También se puede abrir localmente con doble clic en `index.html` (sin
servidor), pero así el "modo offline / instalable como app" (service worker)
**no funciona** — el navegador lo bloquea por seguridad bajo `file://`.

Para probar el service worker en tu PC sin publicar nada, podés levantar un
servidor local desde esta carpeta con Node (sin dependencias):

```
node scripts/dev-server.js
```

y abrir `http://localhost:5173/index.html`. (También funciona
`python -m http.server 8000` si preferís Python.)

### Particularidades de instalarla en iPhone (Safari/iOS)

Cuando llegue el momento de instalar esto en un iPhone, tené en cuenta que
iOS se comporta distinto a Android/Chrome:

- **No hay instalación automática.** Safari no ofrece un cartel de "instalar
  la app" solo. Hay que abrir el sitio en Safari → tocar Compartir → "Agregar
  a la pantalla de inicio". El `manifest.json` (con `display: "standalone"`)
  ya está listo para eso, no hace falta ningún meta tag extra.
- **Wake Lock (pantalla encendida durante la caminata):** funciona en apps
  agregadas a la pantalla de inicio recién desde iOS 18.4 (antes tenía un bug
  conocido de Apple que lo rompía justo en ese modo). El código ya contempla
  que la API no exista (`if (!('wakeLock' in navigator)) return;`), así que
  en iOS viejo simplemente no se activa — no rompe nada, solo no ayuda a
  mantener la pantalla prendida.
- **El offline no es tan persistente como en Android.** Safari guarda bastante
  espacio por sitio, pero si la app no se abre durante varias semanas, iOS
  puede limpiar el caché del service worker y los datos guardados sin avisar.
  Por eso conviene usar de vez en cuando **⬇️ Exportar datos** (pie de página)
  como respaldo real, no depender solo de que iOS los mantenga para siempre.

Sources: [MagicBell — PWA iOS Limitations and Safari Support (2026)](https://www.magicbell.com/blog/pwa-ios-limitations-safari-support-complete-guide), [Progressier — Screen Wake Lock PWA Demo](https://progressier.com/pwa-capabilities/screen-wake-lock), [OJapp — What PWAs Can and Cannot Do on iOS in 2026](https://tips.ojapp.app/en/pwa-ios-2026-complete-guide/)

## Estructura de archivos

```
index.html          Estructura de la página
styles.css           Todos los estilos
logic.js              Lógica pura sin DOM (fechas, distancia GPS) — testeable
app.js                Datos "de fábrica" + resto de la lógica de la app
manifest.json         Metadatos para instalar como PWA
service-worker.js     Caché offline del "app shell"
icons/                Íconos de la PWA (192, 512, maskable)
tests/                Tests automáticos (Node, sin dependencias)
```

## Cómo editar contenido

- **Cumpleaños**: se editan directo desde la pestaña "🎂 Cumples" (agregar,
  editar, borrar). No hace falta tocar código.
- **Rutina semanal** (horarios y tareas de cada día): las tareas de cada
  bloque (Mañana/Tarde/Noche) se agregan, editan y borran directo desde la
  app, con los botones ✏️ / ✕ / "+ Agregar tarea" de cada bloque. Los
  bloques en sí (cuáles hay y su horario) y los días de la semana quedan
  fijos y se editan en `app.js`, dentro del bloque marcado `DATOS
  EDITABLES`, en la constante `DEFAULT_DATA` — esa es solo la "semilla"
  con la que arranca la app la primera vez; después de eso, los cambios
  hechos desde la app tienen prioridad y viven en `localStorage`.
- **Ítems de Biblioteca** que agregaste vos: se editan y borran desde la
  propia pestaña "🎵 Biblioteca". Los **accesos rápidos** fijos (Euge
  Quevedo, etc.) se editan en la constante `QUICK_LINKS` en `app.js`.

## Tests automáticos

Hay dos niveles de tests:

- **Lógica pura** (`tests/*.test.js`): cálculo de días para un cumpleaños,
  distancia GPS, formato de tiempo, mensajes de error de ubicación —
  vive en `logic.js`, sin DOM, sin dependencias. Se corre con:

  ```
  npm test
  ```

- **UI de punta a punta** (`tests/ui/*.spec.js`, con
  [Playwright](https://playwright.dev)): abre la app en un navegador de
  verdad y prueba los flujos completos — tildar y persistir el checklist,
  el reinicio diario, agregar/editar/borrar tareas de la rutina, cumpleaños
  y biblioteca (con sus confirmaciones), navegación por teclado de las
  pestañas, y la pantalla de error si algo falla al cargar. Requiere
  instalar el navegador una vez (`npx playwright install chromium`) y
  correrse con:

  ```
  npm run test:ui
  ```

  Estos tests levantan su propio servidor local (`scripts/dev-server.js`,
  sin dependencias) y bloquean las llamadas a fuentes/mapa externos para no
  depender de la conexión a internet.

`npm run test:all` corre ambos. El hook de pre-commit solo corre `npm test`
(la lógica pura, rápida) — los de UI son más lentos y se corren a mano
cuando conviene.

Hay un hook de pre-commit (versionado en `.githooks/`, no en `.git/hooks/`
que no viaja con el repo) que corre `npm test` antes de cada commit y lo
cancela si algo falla. Se activa una sola vez por clon con:

```
git config core.hooksPath .githooks
```

## Dónde vive cada dato

Todo se guarda en el `localStorage` del navegador donde se usa la app (no hay
servidor ni base de datos). Eso significa que **es por navegador/dispositivo**:
si se abre desde otro celular o se borra el caché del navegador, no va a
tener el historial ni lo tildado.

Para no perder esos datos, usá los botones **⬇️ Exportar datos** / **⬆️
Importar datos** al pie de la app: exportan/restauran un archivo `.json` con
el checklist, el historial de caminatas, la biblioteca y los cumpleaños.

## Roadmap (niveles)

El proyecto avanza por niveles definidos junto con el usuario:

- **Nivel 1** — persistencia confiable: el checklist ya no se perdía al
  recargar, la app abre en el día correcto.
- **Nivel 2** — mantenibilidad: se separó en archivos, se sumó accesibilidad
  (checkboxes reales, tabs con ARIA) y quedó lista la base de PWA
  (manifest + service worker), aunque todavía sin publicar.
- **Nivel 3** — cumpleaños editables desde la app, exportar/importar datos,
  Wake Lock durante la caminata (no se apaga la pantalla) y mejores mensajes
  de error de GPS.
- **Nivel 4** — tareas de la rutina semanal editables desde la app (como ya
  pasaba con cumpleaños), confirmación antes de borrar o de importar un
  backup (para no perder datos por error), ítems de Biblioteca editables
  (antes solo se podían agregar/borrar), y una primera tanda de tests
  automáticos (`logic.js` + `tests/`, corren con `npm test`).
- **Nivel 5** — se corrigió un bug real: el checklist diario se guardaba por
  nombre de día de la semana, así que lo tildado un lunes seguía apareciendo
  tildado todos los lunes siguientes para siempre; ahora cada día calendario
  nuevo arranca en blanco. Se agrandaron los botones táctiles (✏️/✕) tras
  verificar el layout en un ancho de pantalla de celular real (360px), y se
  agregó un hook de pre-commit que corre los tests antes de cada commit.
- **Nivel 6** — se probó el modo offline de verdad (cortando la conexión con
  el service worker activo, no solo viendo que se registre): la app carga y
  el checklist funciona sin internet; solo lo que necesita red externa
  (tipografías, mapa) se degrada, como estaba previsto. Si se cierra la app
  a mitad de una caminata sin apretar "Detener", ahora se puede recuperar
  (guardar en el historial o descartar) la próxima vez que se abre la
  pestaña de Caminata — antes se perdía todo. Si el guardado en el
  navegador falla (espacio lleno, modo privado), ahora aparece un aviso
  visible en pantalla en vez de quedar solo en la consola.
- **Nivel 7** — se probó el tracking de caminata en vivo con GPS simulado
  de punta a punta (nunca se había probado el trackeo real, solo el
  guardado de datos): iniciar, acumular distancia/pasos, detectar el
  cambio a modo vehículo y guardar la sesión, todo funcionó. Los anuncios
  para lectores de pantalla ahora son puntuales (avisan la tarea tildada y
  el progreso) en vez de releer todo el panel del día en cada toque. Se
  auditó el contraste de color (WCAG AA) y se encontraron fallas graves en
  varios elementos chicos/funcionales (etiquetas de categoría, número de
  progreso, botones principales de Caminata/Biblioteca/Cumpleaños) — se
  oscurecieron esos casos puntuales sin tocar la paleta de colores por
  día/pestaña (que le da identidad a cada día). La pestaña activa quedó
  con una mejora parcial (sombra de texto) sin garantizar 4.5:1 en todos
  los días, como trade-off consciente para no tocar esa paleta compartida.

- **Nivel 8** — navegación por teclado completa en las pestañas (flechas
  mueven y activan, Home/End van a los extremos, patrón ARIA estándar de
  tabs). Pantalla de error amigable si algo falla al cargar (en vez de
  pantalla en blanco). Primeros tests de UI de punta a punta con
  Playwright (`tests/ui/`), cubriendo checklist, rutina, cumpleaños,
  biblioteca y la navegación por teclado nueva.
- **Nivel 9** — se terminó de cerrar el contraste WCAG que había quedado
  pendiente (pestaña activa y banners grandes): en vez de oscurecer la
  paleta de colores por día, se agregó una cortina oscura semitransparente
  detrás del texto, así el color de cada día no cambia en el resto de la
  app. De paso se encontró y arregló un bug real de layout: el texto de
  los banners de Caminata y Biblioteca usaba la misma clase CSS (`.note`)
  que las notitas musicales decorativas de fondo, lo que lo sacaba del
  flujo normal y lo hacía flotar encima del título (bug que ya estaba
  desde Nivel 2, nunca detectado visualmente hasta ahora). Se documentaron
  las particularidades de instalar la app en iPhone (Safari/iOS). Se
  agregaron tests de rendimiento: que `burstConfetti()` no deje elementos
  colgados en el DOM, que guardar una caminata larga (miles de puntos)
  siga siendo rápido, y que el uso normal no genere un crecimiento de
  memoria fuera de lo razonable.

- **Nivel 10** — publicada en GitHub Pages:
  https://gustavopaine.github.io/rutina/ — verificado de punta a punta
  (manifest, service worker activo por HTTPS real, checklist, sin errores
  de consola).
- **Nivel 11** — bloqueada la indexación en buscadores (`robots.txt` +
  meta `noindex`), ahora que el sitio contiene datos personales reales
  (nombres y fechas de cumpleaños) accesibles públicamente de verdad.
- **Nivel 12** — CI con GitHub Actions: `npm test` corre automáticamente
  en cada push a `main` y en cada pull request, para detectar
  regresiones en la lógica pura antes de que lleguen a la rama
  publicada. Mismo alcance que el hook de pre-commit (rápido, sin los
  tests de UI).
