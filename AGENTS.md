# AGENTS.md — Web personal de Cristian Luque

> Instrucciones para agentes de IA que trabajen en este repositorio. Léelas antes de tocar código.
> Responde y documenta en **español**.

## Qué es este proyecto

Web personal de desarrollador con demos interactivas de sus proyectos. Es un sitio **estático**, sin framework, sin `package.json` y sin paso de build: HTML, CSS y JavaScript del navegador.

Fuente de verdad funcional: `README.md`. `revision.md` es una auditoría puntual de octubre de 2026 y puede estar desactualizada; no la trates como especificación.

## Estructura

```
index.html                 Página completa con secciones ancladas
css/styles.css             Estilos, temas claro/oscuro y responsive
js/main.js                 Tema, navegación, progreso de lectura y año
js/projects.js             Demos y tablero de pestañas de proyectos
js/vendor/                 country-moves.js y country-dancer.js (Profe Country)
img/                       Retrato en WebP y sprites de Wasteland Legends
```

> Crowd Runner se retiró del tablero por el momento. Si se recupera, su copia
> vive en `demos/crowd-runner/` como copia de `../soldados`.

## Cómo ejecutarlo

No hay instalación ni compilación. Para que las demos funcionen igual que en producción:

```bash
cd /home/cris/Documentos/CLN
python3 -m http.server 8000
# http://localhost:8000
```

También se puede abrir `index.html` con doble clic, pero algunas demos rinden mejor con servidor.

## Arquitectura

- **Una sola página** con secciones `#inicio`, `#proyectos`, `#sobre-mi`, `#trayectoria`, `#stack` y `#contacto`.
- **Tema**: `data-theme="light|dark"` en `<html>`, variables CSS en `:root` y `[data-theme="dark"]`, persistencia en `localStorage` con la clave `cln-theme` y respeto a `prefers-color-scheme` cuando el usuario no ha elegido.
- **Navegación**: scrollspy con `IntersectionObserver`, `aria-current` en el enlace activo y barra de progreso de lectura.
- **Proyectos**: tablero con roles ARIA (`tablist`, `tab`, `tabpanel`), flechas de teclado, swipe y pestañas internas (por ejemplo, las de Nido). Solo se anima el panel activo. Ahora mismo tiene cuatro pestañas: Random Movies, Nido, Profe Country y Wasteland Legends.
- **Imágenes**: el retrato se sirve solo en WebP (`img/foto-perfil.webp` y `img/foto-perfil-400.webp` para Open Graph). No añadas JPEG de respaldo salvo petición explícita.
- **Demos**: los datos simulados (películas, recordatorios, personajes) viven en `js/projects.js`; cada demo se inicializa con `onVisible()` para no consumir CPU fuera de pantalla.
- **Movimiento reducido**: `prefers-reduced-motion` debe seguir desactivando animaciones y revelados.

## Convenciones de código

- JavaScript sin módulos ES: cada archivo es un IIFE con `"use strict"`.
- Usa `const`/`let`, funciones nombradas y `requestAnimationFrame`; evita dependencias nuevas.
- Accede al DOM con `data-*` y `querySelector`, no con selectores frágiles por posición.
- Mantén el HTML semántico y accesible: `aria-*`, foco visible, navegación por teclado, textos alternativos.
- CSS con clases tipo BEM (`hero__title`, `projects__grid`) y variables para color, espaciado y tipografía. No dupliques valores de tema.
- Los textos visibles van en español. Los identificadores de código pueden estar en inglés.
- No introduzcas frameworks, bundlers ni pasos de build salvo petición explícita. La web debe seguir funcionando sin JavaScript en lo esencial.

## Al modificar demos

- **Profe Country**: las librerías de `js/vendor/` son copias de `../country`; si cambias movimientos o el bailarín, sincroniza ambos proyectos.
- **Crowd Runner**: retirado del tablero por ahora. Si se recupera, copia el juego desde `../soldados` a `demos/crowd-runner/` y embébelo; no edites la copia como fuente principal.
- **Wasteland Legends**: los sprites de `img/proyectos/wasteland/` pertenecen al prototipo real; no los sustituyas por placeholders.

## Verificación antes de terminar

No hay tests automatizados. Comprueba manualmente:

1. `python3 -m http.server 8000` y carga sin errores en consola.
2. Anchos de 360 px, 390 px, 768 px y 1280 px. En móvil: hero en orden copy → retrato → datos, y las pestañas del tablero visibles y sin cortar.
3. Tema claro y oscuro, incluido el cambio persistido tras recargar.
4. Pestañas de proyectos con ratón, teclado (flechas/Enter) y swipe.
5. Enlaces, `mailto:`, `tel:` y anclas de navegación.
6. Con `prefers-reduced-motion: reduce` no hay animaciones molestas.

## Reglas para agentes

- No hagas commits, pushes ni despliegues sin que se te pida.
- No cambies datos personales (nombre, contacto, experiencia) sin confirmación.
- Mantén el diseño existente; los cambios visuales deben ser coherentes con las variables y el estilo actual.
- Si un cambio afecta a una demo, revisa también su versión enlazada en la ficha.
- El despliegue es estático (GitHub Pages, Netlify, Cloudflare Pages o Vercel); no generes artefactos de build.
