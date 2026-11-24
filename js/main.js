/* ============================================================
   Navegación, tema y progreso de lectura
   ============================================================ */
(function () {
  "use strict";

  const THEME_KEY = "cln-theme";
  const root = document.documentElement;
  const toggles = Array.prototype.slice.call(document.querySelectorAll("[data-theme-toggle]"));
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      return window.localStorage.getItem(THEME_KEY);
    } catch (error) {
      return null;
    }
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (persist) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch (error) {
        /* localStorage puede estar bloqueado */
      }
    }

    toggles.forEach(function (button) {
      button.setAttribute(
        "aria-label",
        theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
      );
      button.setAttribute("title", theme === "dark" ? "Tema claro" : "Tema oscuro");
    });

    if (metaTheme) {
      metaTheme.setAttribute("content", theme === "dark" ? "#141126" : "#f3f0fa");
    }
  }

  applyTheme(storedTheme() || (systemDark.matches ? "dark" : "light"), false);

  toggles.forEach(function (button) {
    button.addEventListener("click", function () {
      applyTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
  });

  if (systemDark.addEventListener) {
    systemDark.addEventListener("change", function (event) {
      if (!storedTheme()) applyTheme(event.matches ? "dark" : "light", false);
    });
  }

  /* Progreso de lectura en el rail */
  const progress = document.querySelector("[data-scroll-progress]");
  let ticking = false;

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progress) progress.style.width = (value * 100).toFixed(2) + "%";
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateProgress);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* Sección activa en la navegación */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".topbar__nav a"));
  const sections = navLinks
    .map(function (link) {
      const id = link.getAttribute("href");
      return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const visibleSections = new Map();

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visibleSections.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        let active = null;
        let best = 0;
        visibleSections.forEach(function (ratio, section) {
          if (ratio > best) {
            best = ratio;
            active = section;
          }
        });

        navLinks.forEach(function (link) {
          const target = link.getAttribute("href");
          link.setAttribute("aria-current", active && target === "#" + active.id ? "true" : "false");
        });
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.6] }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* Año del pie */
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
