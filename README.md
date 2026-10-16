# Web personal · Cristian Luque Núñez

Web personal de desarrollador. Sin frameworks, sin build: HTML, CSS y un poco de JavaScript.

## Estructura

```
.
├── index.html        # Página completa (secciones ancladas)
├── css/styles.css    # Estilos, variables de color y responsive
├── js/main.js        # Tema, menú móvil, scrollspy y animaciones
└── img/
    ├── foto-perfil.webp      # Retrato principal (WebP)
    ├── foto-perfil.jpg       # Fallback (JPEG)
    └── foto-perfil-400.jpg   # Versión para Open Graph
```

## Abrir en local

No necesita servidor. Basta con abrir `index.html` en el navegador.
Si prefieres un servidor local:

```bash
python3 -m http.server 8000
# y visita http://localhost:8000
```

## Personalizar

- **Contenido:** todo el texto está en `index.html`, organizado por secciones comentadas
  (`HERO`, `SOBRE MI`, `EXPERIENCIA`, `STACK`, `FORMACIÓN`, `CONTACTO`).
- **Colores:** variables CSS en `:root` (`--accent`, `--bg`, etc.) y su variante
  `[data-theme="light"]` en `css/styles.css`.
- **Foto:** sustituye `img/foto-perfil.webp` y `img/foto-perfil.jpg` manteniendo el nombre.
  Formato cuadrado recomendado (p. ej. 600×600).

## Notas de privacidad

- La experiencia laboral **no incluye nombres de empresas ni clientes**.
- No se publica fecha de nacimiento ni dirección postal.
- Solo se muestran email, teléfono y ciudad.

## Despliegue

Cualquiera de estas opciones sirve con solo subir la carpeta:

- **GitHub Pages:** sube el repositorio y activa Pages en la rama principal.
- **Netlify / Cloudflare Pages / Vercel:** arrastra la carpeta o conecta el repo (no hay paso de build).
