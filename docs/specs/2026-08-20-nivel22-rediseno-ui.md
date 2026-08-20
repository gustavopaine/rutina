Status: Approved

# Nivel 22 — Rediseño de interfaz

## Review summary

Rediseño visual de toda la app (las 7 pestañas de días + Caminata/
Biblioteca/Cumples/Ciclo), aprobado como dirección de diseño tras
revisar mockups en un canvas de diseño:
https://claude.ai/code/artifact/355bc2f4-1e0e-4bcb-bbc9-86e505914b05

**Se mantiene** la identidad temática actual (cuarteto/Euge Quevedo,
colores por día de semana) y el sistema de tokens existente (colores,
tipografía Baloo 2 + Nunito, radios, sombras) — el rediseño reusa el
lenguaje visual ya establecido, no inventa uno nuevo.

**Cambia** la estructura de navegación y el header, para resolver dos
problemas reales identificados en capturas de la app actual (viewport
de celular, 412px):
1. **11 pestañas en una sola fila** (7 días + 4 secciones) no entran
   en pantalla — se cortan sin señal de scroll.
2. **Header repetitivo y sobredimensionado**: la escena completa
   (disco arcoíris + siluetas + "La semana de Verónica" en h1 de 32px)
   se repite idéntica en las 11 pestañas y ocupa ~40% del viewport
   antes de llegar al contenido real.

## Decisions and assumptions requiring review

### Confirmadas con el usuario (esta ronda)

- **Alcance**: toda la app (las 7 pestañas de días + las 4 secciones
  extra), no solo la pantalla de Rutina.
- **Identidad**: se mantiene cuarteto/Euge Quevedo + colores por día;
  el rediseño es de jerarquía visual y navegación, no de tema.
- **Dirección de diseño**: a criterio del agente (el usuario delegó
  explícitamente esta decisión).
- **Reestructuración de navegación en 2 niveles**: barra de navegación
  inferior fija con las 5 secciones (Rutina/Caminata/Biblioteca/
  Cumples/Ciclo) + selector de día (Lun-Dom) aparte, más chico, visible
  solo dentro de Rutina. Confirmado explícitamente como cambio de
  estructura (no solo de estilo).
- **Dirección final aprobada**: la mostrada en el canvas de diseño
  (link arriba) — 4 pantallas representativas (Rutina, Cumples,
  Biblioteca, Ciclo) con header compacto + navegación en 2 niveles.

### Ya decididas (agent decisions)

- **Header compacto**: reemplaza la escena completa (vinilo animado
  grande + haces de luz + siluetas + h1 de 32px + subtítulo) por una
  franja fija de 60px: vinilo miniatura (34px, mismo gradiente cónico)
  + "Verónica" (Baloo 2, 17px) + subtítulo chico ("Cuarteto a pleno ·
  Euge Quevedo", 10px) + chip de clima a la derecha (se saca del hero,
  vive en el header). El vinilo animado grande, los haces de luz
  giratorios y las siluetas de fondo se eliminan — quedan reemplazados
  por el vinilo miniatura del header, que conserva el guiño visual sin
  el costo de espacio.
- **"La semana de Verónica" como hero repetido**: se elimina. Su
  función (identidad + bienvenida) la cubre el header compacto; el
  banner del día (`.day-banner`, ya existente, sin cambios) sigue
  cumpliendo la función de "qué día es y qué categoría tiene".
- **Decoraciones flotantes contextuales**: las notitas musicales/
  confetti de fondo (`.note`, spawneadas en `app.js`) dejan de ser
  universales — se muestran en Rutina/Cumples/Biblioteca (encajan con
  el tono cuarteto/festivo) y se suprimen en Ciclo (dato de salud,
  tono más calmo). Caminata queda a criterio de implementación (ya
  tiene su propio mapa como foco visual, probablemente tampoco las
  necesita).
- **Selector de día**: pills más chicas que las actuales (12.5px vs
  13.5px, padding reducido), mismo criterio de color por día
  (gradiente + cortina oscura 0.45 para contraste WCAG, patrón ya
  usado y verificado en Nivel 9 — se mantiene sin cambios).
- **Barra de navegación inferior**: 5 items (ícono emoji + label,
  mismo criterio de emoji-como-ícono que ya usa toda la app — no se
  reemplaza por SVG, sería inconsistente con el resto de la UI).
  Ítem activo: fondo con el gradiente/acento propio de esa sección
  (Rutina usa naranja como color estable de marca, ya que Rutina en sí
  abarca los 7 colores de día; Caminata=teal, Biblioteca=violeta,
  Cumples=violeta/rosa, Ciclo=rosa). Fija al fondo, con
  `env(safe-area-inset-bottom)` para el home indicator de iOS (mismo
  cuidado que ya tiene el resto de la app con PWA en iOS). Objetivo
  táctil mínimo 44×44px en cada ítem.
- **Sin colores/tipografía nuevos**: cero tokens nuevos — todo el
  rediseño reusa `--orange/--orange-deep/--gold/--teal/--teal-deep/
  --pink/--pink-deep/--violet/--violet-deep/--ink/--text-soft/--cream/
  --card` y Baloo 2 + Nunito tal como están definidos hoy en
  `styles.css`.
- **Sin cambios de stack técnico**: sigue siendo HTML/CSS/JS vanilla,
  sin build step, sin framework — coherente con las 21 niveles previas
  y con que el sitio se publica estático en GitHub Pages.

## Scope boundary

### This iteration

1. **`styles.css`**: nuevo header compacto (`.app-header` o similar),
   nueva barra de navegación inferior (`.bottom-nav`), selector de día
   restyleado (más chico), remoción de los estilos de la escena grande
   (`.vinyl` grande, `.beams`, `.soundbars`, `.stage-scene`, `header
   h1`/`.kicker`/`.sub` como hero de página completa) — quedan
   reemplazados, no simplemente ocultos.
2. **`index.html`**: nueva estructura de header + `<nav>` inferior;
   el `role="tablist"` actual de 11 pestañas se separa en dos: uno
   para las 5 secciones (barra inferior) y uno para los 7 días
   (selector de día, solo renderizado/visible dentro de Rutina).
3. **`app.js`**: `renderTabs()` se separa en dos funciones (secciones
   vs días); el estado `current` sigue siendo la fuente única de
   verdad (un día de la semana o una de las 4 secciones), la barra
   inferior resalta "Rutina" cuando `current` es cualquiera de los 7
   días. Navegación por teclado (flechas/Home/End, ya existente para
   el tablist actual) se preserva, ahora aplicada a cada uno de los
   dos grupos por separado. Las funciones de spawneo de decoraciones
   flotantes (`spawnNotes`/similar) dejan de correr en Ciclo.
4. **Todas las pantallas** (7 días + Caminata/Biblioteca/Cumples/
   Ciclo): adoptan el header compacto y la barra inferior. El
   contenido interno de cada pantalla (banners, forms, listas, cards)
   **no cambia** — el rediseño es de navegación/chrome compartido, no
   de cada pantalla individual (los mockups de Cumples/Biblioteca/
   Ciclo en el canvas muestran el patrón de contenido existente sin
   modificar, solo con el nuevo chrome alrededor).

### Explicit non-goals

- No cambia la paleta de colores, tipografía, ni el sistema de radios/
  sombras — reuso total de tokens existentes.
- No cambia ninguna funcionalidad — es un rediseño de navegación y
  jerarquía visual, no un cambio de features. Todo lo que existe hoy
  sigue existiendo.
- No introduce un framework, build step, ni bundler.
- No rediseña el contenido interno de cada pantalla (forms, listas,
  hero cards individuales) más allá de adaptarlos al nuevo chrome —
  eso queda fuera de este nivel, es una posible iteración futura si se
  pide.
- No cambia el modelo de `current` (sigue siendo un string: un día de
  semana o `"caminata"`/`"biblioteca"`/`"cumples"`/`"ciclo"`).

## Risks and failure modes

- **~50 tests de Playwright referencian la estructura de tabs actual**
  (`page.getByRole('tab', { name: '...' })` contra el `tablist` único
  de 11 ítems, en `tests/ui/*.spec.js` — `tabs-keyboard.spec.js` en
  particular testea navegación por teclado sobre ese único grupo).
  Separar en dos `role="tablist"` (secciones vs días) **requiere
  actualizar esos tests**, no es opcional — la navegación por teclado
  en particular necesita un test nuevo/reescrito que cubra los dos
  grupos por separado (Home/End dentro de cada grupo, no cruzando
  entre secciones y días). Este es el riesgo más grande del nivel:
  subestimarlo rompe la suite completa, no un test aislado.
- **Accesibilidad de la navegación en 2 niveles**: dos `tablist`
  visibles simultáneamente (barra inferior siempre, selector de día
  solo en Rutina) necesita `aria-label`s distintos y claros en cada
  uno para que un lector de pantalla no los confunda (ej. "Secciones
  de la app" vs "Días de la semana"). Mismo cuidado WCAG que ya viene
  aplicando el proyecto desde Nivel 9.
- **Contraste de texto**: el header compacto pone texto oscuro
  (`--ink`/`--text-soft`) sobre `--cream` — ya es el patrón actual, sin
  cambios de riesgo ahí. El selector de día y el banner siguen usando
  la cortina oscura 0.45 verificada en Nivel 9 — no tocar esa técnica.
  El ícono activo de la barra inferior pone texto blanco sobre
  gradientes de color — mismo criterio de contraste que ya se aplicó a
  botones (`--violet`/`--pink`/`--teal` oscurecidos donde hiciera
  falta, ver comentarios existentes en `styles.css`) — verificar
  contraste real de cada combinación al implementar, no asumir que
  alcanza por analogía.
- **`env(safe-area-inset-bottom)` sin probar en dispositivo real**: el
  mockup lo incluye por buena práctica (mismo cuidado iOS que ya tiene
  el proyecto), pero no se puede verificar visualmente sin un iPhone
  real o simulador — verificación manual pendiente igual que otras
  particularidades de iOS ya documentadas en el README.

## Acceptance criteria and high-level workflow

1. Las 11 "pestañas" actuales (7 días + 4 secciones) navegan igual que
   antes en cuanto a funcionalidad (mismo `current`, mismo contenido
   por pestaña), pero divididas en dos grupos visuales: barra inferior
   fija (5 secciones) + selector de día (7 días, visible solo dentro
   de Rutina).
2. El header compacto (60px) reemplaza la escena grande en las 11
   pantallas — sin regresión de contenido (clima, identidad de marca,
   nombre siguen visibles, solo más chicos).
3. Navegación por teclado sigue funcionando en ambos grupos de tabs
   por separado (flechas, Home, End), con tests actualizados que lo
   prueben.
4. Ciclo no muestra las decoraciones flotantes (notitas/confetti de
   fondo); el resto de las pantallas las conserva.
5. Ningún test existente queda roto sin actualizar deliberadamente —
   `npm run test:all` en verde al final del nivel, con los tests de
   navegación reescritos donde corresponda (no borrados ni debilitados
   para que pasen).
6. Verificación visual manual (capturas o navegador) de al menos
   Rutina + una pestaña de sección, comparando contra los mockups
   aprobados.

## Implementation detail

### Archivos modificados
```
styles.css     Nuevo .app-header, .bottom-nav, day-selector restyleado;
               remoción de estilos de la escena grande (.vinyl grande,
               .beams, .soundbars, .stage-scene, header h1/.kicker/.sub
               como hero de página completa)
index.html     Nueva estructura de header + nav inferior; dos
               role="tablist" en vez de uno (secciones / días)
app.js         renderTabs() dividido en renderSectionNav() +
               renderDayTabs() (nombres tentativos); current sigue
               siendo la única fuente de verdad; guard de decoraciones
               flotantes por pestaña (suprimidas en Ciclo)
tests/ui/tabs-keyboard.spec.js
               Reescrito para los dos grupos de tabs por separado
tests/ui/*.spec.js (el resto)
               Actualizar cualquier selector que asuma la estructura
               vieja de tabs (revisar caso por caso al implementar)
README.md      Roadmap Nivel 22
```

### Testing
TDD apagado (es CSS/HTML/estructura de navegación, no lógica pura de
`logic.js`). Verificación: `npm run test:all` debe quedar en verde,
actualizando conscientemente cada test que dependía de la estructura
vieja de un solo `tablist` — nunca borrar o debilitar un test para que
pase, si un test verificaba algo que sigue siendo cierto (ej. "tildar
una tarea persiste") reescribirlo contra la nueva estructura, no
eliminarlo. Verificación visual manual además de los tests automáticos,
dado que es un cambio de UI.

## Deferred aspects

- **Rediseño del contenido interno de cada pantalla** (forms, listas,
  hero cards individuales más allá del chrome compartido): fuera de
  este nivel, ver "Explicit non-goals". Se retoma si se pide
  explícitamente.
- **Verificación en dispositivo iOS real** del `safe-area-inset-bottom`
  de la barra inferior: pendiente, mismo tipo de limitación que otras
  particularidades de iOS ya documentadas en el README (no hay forma
  de probarlo sin el dispositivo).
- **Decoraciones flotantes en Caminata**: quedó "a criterio de
  implementación" en vez de una decisión firme — resolver al
  implementar, con el mapa GPS como foco visual principal de esa
  pantalla probablemente ya alcanza sin decoraciones extra.

## Implementation guidance
- TDD: apagado (CSS/HTML/navegación, no lógica pura).
- Isolation: checkout actual (`main`), sin worktree.
- Verify: `npm run test:all` antes de dar cualquier tarea por
  terminada; verificación visual manual (navegador/capturas) de al
  menos Rutina + una sección, comparada contra los mockups aprobados
  en el canvas de diseño.
- Review: `/code-review` al final del nivel, después de que todas las
  tareas estén hechas y la verificación pase — mismo gate que niveles
  anteriores, con foco explícito en accesibilidad de los dos
  `tablist` (aria-labels, navegación por teclado) dado que es el
  riesgo central de este nivel.
- Scope: construir solo la reestructuración de navegación + header
  compacto de este spec — no rediseñar el contenido interno de cada
  pantalla, no tocar `logic.js`, no cambiar el stack técnico.
- Deferred aspects: ledger de arriba; no hay tracker externo para este
  proyecto, el roadmap vive en el README.
- Build order: 1) header compacto + estructura de dos `tablist` en
  `index.html`/`styles.css`/`app.js` (riesgo más alto primero, toca
  todas las pantallas) → 2) aplicar el nuevo chrome a las 11 pantallas
  → 3) reescribir `tests/ui/tabs-keyboard.spec.js` y ajustar el resto
  de la suite → 4) `npm run test:all` en verde → 5) verificación visual
  manual contra los mockups → 6) `/code-review`.
- Routing: sesión principal, secuencial — nivel de tamaño similar a
  niveles anteriores grandes (17-19), sin necesidad de delegar a
  subagentes por eficiencia de tokens, salvo que la revisión de
  accesibilidad de los dos tablist convenga delegarse aparte para no
  cargar el contexto principal con el detalle de cada test reescrito.
- Orchestrator: sesión actual, sin cambio de modelo.
