# Revisión del proyecto — Cristian Luque Núñez · Web personal

**Fecha:** 2026-10-16  
**Agente:** Revisor (read-only)  
**Archivo creado:** `revision.md`  
**Proyecto:** HTML/CSS/JS estático con tematización dinámica, menú móvil, scrollspy y animaciones por scroll.

---

## 1. Resumen ejecutivo

El proyecto es una web personal estática, sin framework ni paso de build, con buena estructura semántica, accesibilidad básica y código limpio. **No se encontraron errores críticos de seguridad ni fallos de sintaxis HTML/CSS.** Se han detectado pequeños detalles de mejora en accesibilidad, consistencia de atributos y robustez de CSS para navegadores antiguos.

---

## 2. Revisión HTML (`index.html`)

| Línea | Elemento / Fragmento | Observación | Severidad |
|---|---|---|---|
| 2 | `<html lang="es" data-theme="dark">` | Correcto, pero `data-theme` es controlado por JS; sin JS no hay problema porque no se fuerza ningún tema. | — |
| 20 | Favicon SVG inline (`data:image/svg+xml`) | Correcto, evita petición extra. | — |
| 27 | `<script>document.documentElement.classList.add("js");</script>` | Progressive enhancement: solo si JS carga aparece `.js`, por lo que `[data-reveal]` no se oculta sin JS. | — |
| 30 | Skip-link (`skip-link`) | Presente y funcional (`focus` muestra `top: 0`). | — |
| 39 | `<button>` del menú (`navToggle`) | `aria-expanded`, `aria-controls="navMenu"`, `aria-label` presentes y actualizados por JS. | — |
| 50 | Botón de tema (`themeToggle`) | `aria-label` actualizado dinámicamente (líneas 36-39 de JS). Bien. | — |
| 61 | `<section class="hero" aria-labelledby="hero-title">` | `aria-labelledby` apunta al `id="hero-title"` que está en el `<p class="hero__role">` (línea 66), no en un encabezado. **No es error**, pero es confuso: un `aria-labelledby` en una sección debería apuntar al `h2` o al título principal de esa sección. Aquí el `h1` oculto (línea 64) es el título real; se recomienda usar `aria-label` o apuntar al `h1`. | Baja |
| 64 | `<h1 class="visually-hidden">` | Título principal oculto visualmente pero disponible para lectores de pantalla. Técnica válida para diseño hero, pero asegurarse de que no sea ignorado por SEO (el texto está completo). | — |
| 85 | `<img src="img/foto-perfil.jpg" width="600" height="600" alt="Retrato de Cristian Luque Núñez" loading="eager" decoding="async" />` | Atributos `width`/`height` presentes (bueno para CLS). Falta `srcset` en la imagen principal, aunque sí hay `<source>` con WebP. **Recomendación:** agregar `srcset` al `<img>` para servir `foto-perfil-400.jpg` en pantallas pequeñas, o usar `sizes`. | Baja |
| 143-171 | Contacto (`contact__item`) | Email (`mailto:`) y teléfono (`tel:`) expuestos como enlaces directos. Según `README.md` es deliberado. No hay protección anti-spam (p. ej. obfuscación o `mailto:` con entidad HTML). **No es bug**, pero si se desea reducir scraping es mejor usar formulario o ofuscar. | Baja |
| 163 | `<div class="contact__item">` (ubicación) | No es enlace (correcto: no hay URL de mapa). Semánticamente podría ser `<address>` o usar `itemprop`, pero no es obligatorio. | — |
| 339-343 | `<footer>` | Correcto; `site-footer__top` con `href="#top"` devuelve al inicio. | — |

### Errores / problemas HTML encontrados
- **Ningún error de sintaxis HTML** (etiquetas cerradas, estructura válida).
- **Nota menor:** `id="hero-title"` en `<p>` (línea 66) es usado por `aria-labelledby` de la sección hero. Considerar cambiar a `<h1>` visible o usar `aria-label` directamente.

---

## 3. Revisión CSS (`css/styles.css`)

| Línea | Regla / Propiedad | Observación | Severidad |
|---|---|---|---|
| 139 | `background: color-mix(in srgb, var(--bg) 82%, transparent);` | Uso de `color-mix()` (CSS Color Module Level 5). Funciona en navegadores modernos (Chrome 111+, Safari 16.2+, Firefox 128+). **En navegadores antiguos (IE, Safari <16, Chrome <111) no funciona**; el header perderá el efecto de vidrio esmerilado (`backdrop-filter` sí es más soportado). No es un error, pero es un punto de degradación progresiva. | Baja |
| 169 | `border: 1px solid color-mix(...)` | Idem, usa `color-mix`. Degradación aceptable. | Baja |
| 320 | `background: linear-gradient(140deg, ...)` | Correcto. | — |
| 330-340 | `.timeline::before` | Línea de tiempo con gradiente vertical que pasa a transparente. Correcto. | — |
| 498-502 | `html.js [data-reveal]` | Estado oculto (`opacity: 0`, `translateY(18px)`). Solo se aplica si `.js` está presente (línea 27 de HTML), por lo que sin JS nunca se oculta. **Buena práctica.** | — |
| 546-553 | `@media (prefers-reduced-motion: reduce)` | Respeta preferencias de movimiento; fuerza `opacity: 1` y `transform: none` en `[data-reveal]`. | — |
| 555-558 | `@media print` | Oculta elementos no necesarios para impresión (`site-header`, `hero__actions`, etc.). Bien. | — |
| 63 | `img, svg { display: block; max-width: 100%; }` | Reset correcto para evitar espacios de línea debajo de imágenes. | — |
| 66 | `a { color: inherit; text-decoration: none; }` | Elimina subrayados por defecto; los enlaces hover cambian color (`.nav__menu a:hover`, `.btn`, etc.). No hay problema, pero asegurar que todos los enlaces tengan contraste suficiente en hover (sí lo tienen con `--accent`). | — |
| 512-513 | `@media (max-width: 860px)` `.hero__inner` | `grid-template-columns: 1fr` y `text-align: center` bien implementados. `.hero__photo { order: -1; }` coloca foto arriba. | — |
| 538-539 | `.theme-toggle { margin: 0.3rem 0.2rem 0.2rem; justify-self: start; }` | En móvil (`<720px`) el botón de tema se alinea al inicio del menú vertical. Correcto. | — |

### Errores / problemas CSS encontrados
- **Ningún error de sintaxis CSS** (propiedades válidas, llaves cerradas, valores correctos).
- **Nota menor:** No hay `prefers-color-scheme: dark/light` automático. El tema depende exclusivamente de `data-theme` y `localStorage`. Si un usuario tiene el sistema en claro y nunca visitó antes, verá tema oscuro (defecto) hasta que use el botón. Esto es una decisión de diseño, no un bug.
- **Nota menor:** Falta `font-display: swap` o `font-display: optional` en la carga de Google Fonts (línea 24 de HTML). Esto podría causar FOIT/FOUC si la red es lenta. **Sugerencia:** agregar `&display=swap` al URL de fuentes (ya está `display=swap` en la URL: `...&display=swap`; sí está presente, bien).

---

## 4. Revisión JS (`js/main.js`)

| Línea | Fragmento / Función | Observación | Severidad |
|---|---|---|---|
| 13-16 | `try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}` | Protege contra `localStorage` bloqueado o en modo privado. | — |
| 19-27 | `syncThemeColor()` | Actualiza meta `theme-color` según tema. Si no existe la meta, retorna sin error. | — |
| 34 | `try { localStorage.setItem(...) } catch (e) {}` | Igual que arriba. | — |
| 55-59 | `navToggle` click | Alterna `is-open`. Actualiza `aria-expanded` y `aria-label`. | — |
| 61-63 | `navMenu` click | Cierra menú al hacer click en cualquier `<a>` interno (`event.target.closest("a")`). Funciona incluso si el clic es sobre un `<span>` o `<svg>` dentro del enlace. | — |
| 65-68 | `document` click | Cierra menú si el clic es fuera (`!navMenu.contains(event.target) && !navToggle.contains(event.target)`). Correcto. | — |
| 70-72 | `keydown` Escape | Cierra menú con tecla Escape. Bien para accesibilidad. | — |
| 74-76 | `resize` > 720px | Cierra menú al pasar a escritorio. Evita que el menú quede abierto en cambios de tamaño. | — |
| 84-102 | `onScroll()` | Scrollspy: calcula `offset = window.scrollY + 140`; recorre secciones y activa `is-active` + `aria-current`. No hay debounce, pero usa `requestAnimationFrame` (líneas 105-113) con `ticking` para limitar a 60fps. **Bien implementado.** | — |
| 89 | `section.offsetTop <= offset` | Si hay secciones muy cortas o con padding grande, podría asignar `current` a la última sección visible incluso si es solo un fragmento. Aceptable para una página de una sola pantalla. | Baja |
| 117-150 | IntersectionObserver | Usa `rootMargin: "0px 0px -8% 0px"`, `threshold: 0.12`. Si el navegador no soporta `IntersectionObserver`, cae en `revealAll()` (línea 135). Si hay `prefers-reduced-motion: reduce`, también `revealAll()`. | — |
| 148 | `window.addEventListener("load", revealInView);` | Asegura que elementos ya visibles se revelen si el observer no llegó a dispararse (pestañas en segundo plano). | — |
| 153-154 | Año dinámico | `new Date().getFullYear()`; actualiza `#year`. | — |

### Errores / problemas JS encontrados
- **Ningún error de sintaxis ni fallo de ejecución**.
- **Nota menor:** `revealInView()` (línea 126) y `revealAll()` (línea 120) no verifican si el elemento está oculto por CSS (`opacity: 0`) antes de añadir `is-visible`. Aunque `is-visible` sobrescribe, si la regla `html.js [data-reveal]` no carga, no hay problema. No es un error.
- **Nota menor:** No hay protección contra clic rápido repetido en `themeToggle` (podría hacer múltiples cambios de tema, aunque es idempotente). No es un problema real.

---

## 5. Accesibilidad (A11y)

| Área | Estado | Detalle |
|---|---|---|
| `lang` | ✅ | `lang="es"` en `<html>`. |
| `title` / `meta description` | ✅ | Presentes y descriptivos. |
| Open Graph | ✅ | `og:type`, `og:locale`, `og:title`, `og:description`, `og:image`. |
| Skip link | ✅ | `.skip-link` con `href="#contenido"`; `focus` la muestra. |
| Contraste | ✅ | Colores `--text` (#e6edf5) sobre `--bg` (#0b0f14) dan contraste muy alto; `--text-soft` (#9fb0c3) sobre fondo oscuro es aceptable para texto secundario. |
| `focus-visible` | ✅ | Definido con `outline: 2px solid var(--accent)` y `outline-offset: 3px`. |
| `aria-label` en nav | ✅ | `nav` con `aria-label="Navegación principal"`. |
| `aria-expanded` menú | ✅ | Actualizado por JS. |
| `aria-current` scrollspy | ✅ | Actualizado en enlaces de navegación activos. |
| `aria-labelledby` secciones | ✅ | Cada `<section>` apunta a su `h2` excepto hero (ver nota). |
| `visually-hidden` | ✅ | Técnica estándar para ocultar `h1`. |
| `aria-hidden` decorativos | ✅ | Iconos SVG en nav, botón de tema, puntos decorativos (`dot`) marcados `aria-hidden="true"`. |
| `prefers-reduced-motion` | ✅ | Respeta preferencia; desactiva animaciones. |
| `print` | ✅ | Oculta elementos no impresos; mantiene contenido. |

---

## 6. Seguridad

| Aspecto | Estado | Detalle |
|---|---|---|
| Datos expuestos (email, teléfono) | ⚠️ Deliberado | Según `README.md`: no se incluyen nombres de empresas ni fechas de nacimiento. Email y teléfono son públicos por diseño. No hay riesgo de inyección ya que no hay formularios ni base de datos. |
| `localStorage` | ✅ | Se usa solo para tema; no almacena datos sensibles ni tokens. |
| Scripts externos | ✅ | Solo Google Fonts (`fonts.googleapis.com`) y favicon inline. No hay tracking de terceros (Google Analytics, etc.) en el HTML. |
| CSP / Headers | ❌ No aplica | Es archivo estático; no hay servidor ni cabeceras configuradas. Si se despliega en Netlify/Vercel, se recomienda agregar cabeceras de seguridad (`Content-Security-Policy`, `X-Content-Type-Options`, `Referrer-Policy`). |
| `mailto:` / `tel:` | ✅ | No son vectores de ataque en este contexto. |

---

## 7. Rendimiento / Optimización

| Punto | Estado | Sugerencia |
|---|---|---|
| Imágenes | ✅ WebP + JPEG fallback | `img/foto-perfil.webp` y `.jpg` presentes. Falta `srcset` en `<img>` (línea 85) para servir versiones más pequeñas (`-400.jpg`). |
| Fuentes | ✅ `display=swap` ya en URL | Evita FOIT. |
| CSS | ✅ Una sola hoja (`styles.css`) | No hay CSS innecesario cargado en HTML. |
| JS | ✅ Una sola hoja (`main.js`), sin dependencias | No hay librerías externas (jQuery, React, etc.). |
| Animaciones | ✅ `transform` + `opacity` + `requestAnimationFrame` | No usan `left`/`top` ni propiedades que forcen layout. |
| `loading="eager"` en foto hero | ✅ Correcto | Es la imagen principal de la página. |

---

## 8. Recomendaciones de mejora (priorizadas)

### Prioridad media-alta
1. **Agregar `srcset` / `sizes`** al `<img>` de la foto (línea 85) para servir `foto-perfil-400.jpg` en pantallas estrechas, reduciendo ancho de banda.
2. **Revisar `aria-labelledby` de hero** (línea 61): considerar apuntar a `h1` o usar `aria-label="Inicio — Cristian Luque Núñez"` para claridad.

### Prioridad baja
3. **Considerar `prefers-color-scheme`** automático si se desea que el tema inicial respete el sistema operativo.
4. **Ofuscar email/teléfono** si se desea reducir scraping (opcional, según política del usuario).
5. **Agregar `@media (hover: hover)` y `@media (pointer: coarse)`** si se quiere ajustar interacción para táctiles vs. mouse.
6. **Depuración:** si se despliega con servidor, agregar cabeceras `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, y un CSP básico (`default-src 'self'; img-src 'self' data: https:; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self';`.

---

## 9. Conclusión

El proyecto cumple con su objetivo: una web personal limpia, rápida, accesible y sin dependencias. No hay errores de sintaxis, no hay vulnerabilidades evidentes y la experiencia de usuario (tema, menú, scrollspy, animaciones) está bien implementada. Las observaciones son principalmente de **mejora progresiva** (imágenes responsivas, cabeceras de seguridad si hay servidor, consistencia de ARIA en hero). El archivo `revision.md` debe conservarse junto al proyecto como registro de revisión.

---
*Revisión realizada sin modificar archivos (modo solo lectura). No se editaron `index.html`, `css/styles.css`, `js/main.js` ni `README.md`.*
