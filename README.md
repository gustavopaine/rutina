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
app.js                Datos + lógica de la app
manifest.json         Metadatos para instalar como PWA
service-worker.js     Caché offline del "app shell"
icons/                Íconos de la PWA (192, 512, maskable)
```

## Cómo editar contenido

- **Cumpleaños**: se editan directo desde la pestaña "🎂 Cumples" (agregar,
  editar, borrar). No hace falta tocar código.
- **Rutina semanal** (horarios y tareas de cada día): se edita en `app.js`,
  dentro del bloque marcado `DATOS EDITABLES` al principio del archivo,
  en la constante `DATA`. Cada día tiene bloques (`Mañana`/`Tarde`/`Noche`)
  y cada bloque una lista de `items` con texto (`t`) y emoji (`e`).
- **Accesos rápidos de música** (Biblioteca): constante `QUICK_LINKS` en
  `app.js`, cerca de la sección de Biblioteca.

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

Publicar en un hosting público (GitHub Pages u otro) queda para una etapa
posterior, a criterio del usuario — el sitio contiene datos personales reales
(nombres y fechas de nacimiento de familiares), así que esa decisión se toma
explícitamente cuando llegue el momento.
