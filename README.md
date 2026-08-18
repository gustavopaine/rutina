# Rutina de Verónica

App de una sola sección por pestaña (sin backend) para la rutina semanal de
Verónica, con tema de cuarteto (Euge Quevedo). Incluye:

- **Rutina semanal**: checklist por día (Mañana / Tarde / Noche), con progreso.
- **Cumpleaños**: lista con cuenta regresiva, editable desde la app.
- **Caminata**: tracking GPS en vivo con mapa (Leaflet + OpenStreetMap), sin costo.
- **Biblioteca**: accesos rápidos de música + tus propios links.

## Cómo abrirla

Doble clic en `index.html`. Funciona así, sin servidor.

**Importante:** el "modo offline / instalable como app" (service worker) **no
funciona abriendo el archivo directamente** (`file://`) — el navegador lo
bloquea por seguridad. Para que esa parte funcione hace falta servir el sitio
por `http://` o `https://` (por ejemplo, un hosting como GitHub Pages). Hasta
que eso no pase, la app anda igual, solo que sin instalación ni caché offline.

Para probar el service worker en tu PC sin publicar nada, podés levantar un
servidor local desde esta carpeta:

```
python -m http.server 8000
```

y abrir `http://localhost:8000/index.html`.

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

La lógica pura (cálculo de días para un cumpleaños, distancia GPS, formato
de tiempo, mensajes de error de ubicación) vive en `logic.js` y tiene tests
en `tests/`. Para correrlos, con [Node.js](https://nodejs.org) instalado:

```
npm test
```

No hace falta instalar nada más (no usan ninguna dependencia externa).

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

Publicar en un hosting público (GitHub Pages u otro) queda para una etapa
posterior, a criterio del usuario — el sitio contiene datos personales reales
(nombres y fechas de nacimiento de familiares), así que esa decisión se toma
explícitamente cuando llegue el momento.
