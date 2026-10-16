/* ==========================================================================
   Cristian Luque Núñez — interacciones de la web personal
   Sin dependencias. Tema, menú móvil, scrollspy, animaciones y año.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var STORAGE_KEY = "cln-theme";

  /* --- Tema (oscuro por defecto) ----------------------------------------- */
  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }
  if (stored === "light" || stored === "dark") {
    root.setAttribute("data-theme", stored);
  }

  var themeToggle = document.getElementById("themeToggle");
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function syncThemeColor() {
    if (!themeColor) return;
    themeColor.setAttribute(
      "content",
      root.getAttribute("data-theme") === "light" ? "#f6f8fa" : "#0b0f14"
    );
  }
  syncThemeColor();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      syncThemeColor();
      themeToggle.setAttribute(
        "aria-label",
        next === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"
      );
    });
  }

  /* --- Menú móvil -------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var navMenu = document.getElementById("navMenu");

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var open = navMenu.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!navMenu.classList.contains("is-open")) return;
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720) closeMenu();
    });
  }

  /* --- Sombra del header y scrollspy ------------------------------------ */
  var header = document.querySelector(".site-header");
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__menu a[href^="#"]'));

  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 10);

    var offset = window.scrollY + 140;
    var current = "";
    sections.forEach(function (section) {
      if (section.offsetTop <= offset) current = section.id;
    });

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      onScroll();
      revealInView();
      ticking = false;
    });
  }, { passive: true });
  onScroll();

  /* --- Animación de aparición ------------------------------------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function revealAll() {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* Red de seguridad: revela lo que ya está en pantalla aunque el observer no
     llegue a dispararse (pestañas en segundo plano, navegadores antiguos...). */
  function revealInView() {
    var limit = window.innerHeight * 0.94;
    revealItems.forEach(function (item) {
      if (item.classList.contains("is-visible")) return;
      if (item.getBoundingClientRect().top < limit) item.classList.add("is-visible");
    });
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

    revealItems.forEach(function (item) { observer.observe(item); });

    revealInView();
    window.addEventListener("load", revealInView);
  }

  /* --- Año dinámico ------------------------------------------------------ */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
