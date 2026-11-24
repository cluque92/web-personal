# Web personal · Cristian Luque Núñez

Web personal de desarrollador con demos interactivas de sus proyectos.
Sin frameworks y sin build: HTML, CSS y JavaScript.

## Estructura

```
.
├── index.html                  # Página completa (secciones ancladas)
├── css/
│   └── styles.css              # Estilos, temas claro/oscuro y responsive
├── js/
│   ├── main.js                 # Tema, navegación, progreso de lectura y año
│   ├── projects.js             # Demos y tablero de pestañas de proyectos
│   └── vendor/
│       ├── country-moves.js    # Biblioteca de movimientos de Profe Country
│       └── country-dancer.js   # Profe SVG articulado de Profe Country
└── img/
    ├── foto-perfil.webp        # Retrato
    └── proyectos/
        └── wasteland/          # Sprites reales del prototipo Wasteland Legends
```

## Abrir en local

No necesita servidor para ver la web, pero las demos funcionan mejor con uno:

```bash
python3 -m http.server 8000
# y visita http://localhost:8000
```

## Qué incluye

Los cuatro proyectos van en un **tablero de pestañas** (flechas, teclado y
swipe) para no hacer scroll de más. Solo se anima la pestaña activa.

- **Random Movies**: demo de la app Android en un móvil, con filtros por género
  y plataforma, «Sorpréndeme esta noche» y ficha de resultado.
- **Nido**: demo de la app Flutter con las pestañas Hoy, Próximos, Hijos y
  Familia, progreso del día y recordatorios con prioridad.
- **Profe Country**: profe SVG articulado con coreografía de ocho tiempos,
  modo espejo y pausa.
- **Wasteland Legends**: selección de personaje con los sprites del prototipo.

## Personalizar

- **Contenido:** todo el texto está en `index.html`, organizado por secciones
  comentadas (`HERO`, `PROYECTOS`, `SOBRE MI`, `TRAYECTORIA`, `STACK`,
  `CONTACTO`).
- **Colores:** variables CSS en `:root` y en `[data-theme="dark"]`
  (`css/styles.css`).
- **Foto:** sustituye `img/foto-perfil.webp` manteniendo el nombre. Formato
  cuadrado recomendado (p. ej. 600×600). Para la imagen de Open Graph se usa
  `img/foto-perfil-400.webp`.
- **Demos:** los datos de las demos (películas, recordatorios, personajes)
  están en `js/projects.js`.

## Notas

- Las demos son versiones reducidas que funcionan en el navegador. Los
  proyectos originales están enlazados desde cada ficha.
- Los sprites de Wasteland Legends pertenecen al prototipo real.
- La experiencia laboral no incluye nombres de empresas ni clientes.

## Despliegue

Cualquiera de estas opciones sirve subiendo la carpeta:

- **GitHub Pages:** activa Pages en la rama principal.
- **Netlify / Cloudflare Pages / Vercel:** conecta el repo (no hay paso de build).
