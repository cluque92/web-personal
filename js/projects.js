/* ============================================================
   Demos interactivas · Cristian Luque Núñez
   Cada demo es independiente y solo se anima cuando está visible.
   ============================================================ */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  function onVisible(element, enter, exit) {
    if (!("IntersectionObserver" in window)) {
      enter();
      return function () {
        if (exit) exit();
      };
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) enter();
          else if (exit) exit();
        });
      },
      { rootMargin: "140px 0px" }
    );

    observer.observe(element);
    return function () {
      observer.disconnect();
    };
  }

  /* ---------------------------------------------------------
     Profe Country
     --------------------------------------------------------- */
  function initCountry() {
    const root = document.querySelector("[data-country]");
    if (!root || !window.PC || !window.PC.Dancer) return;

    const host = root.querySelector("[data-country-dancer]");
    const stepsEl = root.querySelector("[data-country-steps]");
    const moveEl = root.querySelector("[data-country-move]");
    const countEl = root.querySelector("[data-country-count]");
    const liveEl = root.querySelector("[data-country-live]");
    const playBtn = root.querySelector("[data-country-play]");
    const mirrorBtn = root.querySelector("[data-country-mirror]");

    if (!host || !stepsEl || !playBtn) return;

    let dancer;
    try {
      dancer = new window.PC.Dancer(host, {
        avatar: "vaquero",
        hat: "#8a5a2b",
        shirt: "#b03a2e",
        mirror: true
      });
    } catch (error) {
      return;
    }

    const sequence = [
      "kbcR",
      "kbcL",
      "kbcR",
      "kbcL",
      "grapevineR",
      "grapevineL",
      "stompR",
      "clapBeat"
    ];

    const items = sequence.map(function (id, index) {
      const move = window.PC.Moves.get(id);
      const item = document.createElement("li");
      const number = document.createElement("span");
      const label = document.createElement("span");

      number.textContent = String(index + 1).padStart(2, "0");
      label.textContent = move.name;
      item.append(number, label);
      stepsEl.append(item);
      return item;
    });

    const bpm = 116;
    const secondsPerBeat = 60 / bpm;

    let playing = false;
    let pausedBeat = 0;
    let startedAt = 0;
    let raf = 0;
    let visible = true;
    let lastIndex = -1;
    let mirror = true;

    function highlight(index) {
      items.forEach(function (item, itemIndex) {
        item.classList.toggle("is-active", itemIndex === index);
      });
    }

    function renderIdle(now) {
      if (reducedMotion) return;
      dancer.render({ turn: 0 }, { playing: false, time: now / 1000 });
    }

    function frame(now) {
      if (!visible) {
        raf = 0;
        return;
      }

      if (!playing) {
        if (reducedMotion) {
          raf = 0;
          return;
        }
        renderIdle(now);
        raf = requestAnimationFrame(frame);
        return;
      }

      const beats = pausedBeat + (now - startedAt) / 1000 / secondsPerBeat;
      const index = ((Math.floor(beats) % sequence.length) + sequence.length) % sequence.length;
      const fraction = beats - Math.floor(beats);
      const move = window.PC.Moves.get(sequence[index]);
      const pose = window.PC.Moves.sample(move.frames, fraction);

      dancer.render(pose, { playing: true });

      if (index !== lastIndex) {
        lastIndex = index;
        highlight(index);
        if (moveEl) moveEl.textContent = move.name;
        if (countEl) countEl.textContent = String(index + 1);
        if (liveEl) liveEl.textContent = "Paso " + (index + 1) + ": " + move.name;
      }

      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (playing) return;
      playing = true;
      startedAt = performance.now();
      playBtn.textContent = "Pausar";
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function pause() {
      if (!playing) return;
      pausedBeat = (pausedBeat + (performance.now() - startedAt) / 1000 / secondsPerBeat) % sequence.length;
      playing = false;
      playBtn.textContent = "Bailar";
    }

    playBtn.addEventListener("click", function () {
      if (playing) pause();
      else start();
    });

    if (mirrorBtn) {
      mirrorBtn.addEventListener("click", function () {
        mirror = !mirror;
        dancer.setSettings({ mirror: mirror });
        mirrorBtn.setAttribute("aria-pressed", String(mirror));
      });
    }

    const firstMove = window.PC.Moves.get(sequence[0]);
    highlight(0);
    if (moveEl) moveEl.textContent = firstMove.name;
    if (countEl) countEl.textContent = "1";
    dancer.render({ turn: 0 }, { playing: false, time: 0 });
    raf = requestAnimationFrame(frame);

    onVisible(
      root,
      function () {
        visible = true;
        if (!raf) raf = requestAnimationFrame(frame);
      },
      function () {
        visible = false;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      }
    );

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        visible = false;
        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      } else {
        visible = true;
        if (!raf) raf = requestAnimationFrame(frame);
      }
    });
  }

  /* ---------------------------------------------------------
     Random Movies
     --------------------------------------------------------- */
  function initMovies() {
    const root = document.querySelector("[data-movies]");
    if (!root) return;

    const homeView = root.querySelector('[data-movies-view="home"]');
    const resultView = root.querySelector('[data-movies-view="result"]');
    const sheet = root.querySelector("[data-movies-sheet]");
    const summaryEl = root.querySelector("[data-movies-summary]");
    const rollBtn = root.querySelector("[data-movies-roll]");
    const againBtn = root.querySelector("[data-movies-again]");
    const resultEl = root.querySelector("[data-movies-result]");
    const liveEl = root.querySelector("[data-movies-live]");
    const genresEl = root.querySelector("[data-movies-genres]");
    const platformsEl = root.querySelector("[data-movies-platforms]");
    const backButtons = root.querySelectorAll("[data-movies-back]");

    if (!homeView || !resultView || !sheet || !rollBtn || !resultEl) return;

    const genres = ["Drama", "Comedia", "Thriller", "Ciencia ficción", "Terror", "Animación", "Acción", "Romance"];
    const platforms = ["Netflix", "Prime Video", "Disney+", "Movistar+", "Filmin", "Max"];

    const movies = [
      {
        id: "fauno",
        title: "El laberinto del fauno",
        mark: "Fauno",
        year: 2006,
        director: "Guillermo del Toro",
        tagline: "La fantasía no siempre es un refugio.",
        genres: ["Drama", "Fantasía"],
        platforms: ["Netflix"],
        rating: 8.2,
        runtime: 118,
        colors: ["#2f2318", "#8c6b2f", "#d9b45c"]
      },
      {
        id: "otros",
        title: "Los otros",
        mark: "Otros",
        year: 2001,
        director: "Alejandro Amenábar",
        tagline: "Esta casa no está vacía.",
        genres: ["Terror", "Thriller"],
        platforms: ["Prime Video"],
        rating: 7.6,
        runtime: 104,
        colors: ["#1d2524", "#4c5d58", "#b8c7bb"]
      },
      {
        id: "celda",
        title: "Celda 211",
        mark: "Celda 211",
        year: 2009,
        director: "Daniel Monzón",
        tagline: "Un motín. Un hombre dentro. Nadie sabe quién es.",
        genres: ["Thriller", "Drama"],
        platforms: ["Netflix"],
        rating: 7.7,
        runtime: 113,
        colors: ["#27251f", "#7b5e37", "#c8a15b"]
      },
      {
        id: "vascos",
        title: "Ocho apellidos vascos",
        mark: "Vascos",
        year: 2014,
        director: "Emilio Martínez-Lázaro",
        tagline: "El amor también tiene acento.",
        genres: ["Comedia", "Romance"],
        platforms: ["Prime Video"],
        rating: 6.5,
        runtime: 98,
        colors: ["#18332b", "#3f7b5c", "#e2c56b"]
      },
      {
        id: "nieve",
        title: "La sociedad de la nieve",
        mark: "Nieve",
        year: 2023,
        director: "J. A. Bayona",
        tagline: "Hay historias que se cuentan para seguir vivos.",
        genres: ["Drama"],
        platforms: ["Netflix"],
        rating: 7.8,
        runtime: 144,
        colors: ["#222c33", "#63727a", "#e7edf0"]
      },
      {
        id: "volver",
        title: "Volver",
        mark: "Volver",
        year: 2006,
        director: "Pedro Almodóvar",
        tagline: "Volver a casa nunca es volver atrás.",
        genres: ["Drama", "Comedia"],
        platforms: ["Netflix"],
        rating: 7.6,
        runtime: 121,
        colors: ["#3a1c1d", "#a23c36", "#e0a05c"]
      },
      {
        id: "alcarras",
        title: "Alcarràs",
        mark: "Alcarràs",
        year: 2022,
        director: "Carla Simón",
        tagline: "La tierra también tiene memoria.",
        genres: ["Drama"],
        platforms: ["Filmin"],
        rating: 7.0,
        runtime: 120,
        colors: ["#3b3a22", "#8a8a4b", "#e5c96b"]
      },
      {
        id: "bestas",
        title: "As bestas",
        mark: "Bestas",
        year: 2022,
        director: "Rodrigo Sorogoyen",
        tagline: "Dos vecinos. Una frontera. Ninguna salida fácil.",
        genres: ["Thriller", "Drama"],
        platforms: ["Movistar+"],
        rating: 7.7,
        runtime: 137,
        colors: ["#1f2823", "#4f6350", "#a7b38a"]
      },
      {
        id: "dune2",
        title: "Dune: Parte dos",
        mark: "Dune",
        year: 2024,
        director: "Denis Villeneuve",
        tagline: "El desierto cobra lo que promete.",
        genres: ["Ciencia ficción", "Acción"],
        platforms: ["Max"],
        rating: 8.5,
        runtime: 166,
        colors: ["#2a1b12", "#b87534", "#e8c48a"]
      },
      {
        id: "eeaao",
        title: "Everything Everywhere All at Once",
        mark: "Everything",
        year: 2022,
        director: "Daniels",
        tagline: "Todo, en todas partes, de golpe.",
        genres: ["Ciencia ficción", "Comedia"],
        platforms: ["Prime Video"],
        rating: 7.8,
        runtime: 139,
        colors: ["#231a33", "#6845a5", "#f0a33e"]
      },
      {
        id: "parasitos",
        title: "Parásitos",
        mark: "Parásitos",
        year: 2019,
        director: "Bong Joon-ho",
        tagline: "Una casa, dos mundos, ningún plan.",
        genres: ["Thriller", "Drama"],
        platforms: ["Prime Video"],
        rating: 8.5,
        runtime: 132,
        colors: ["#1b2620", "#4a6a4d", "#c9d49e"]
      },
      {
        id: "whiplash",
        title: "Whiplash",
        mark: "Whiplash",
        year: 2014,
        director: "Damien Chazelle",
        tagline: "No hay atajos para la grandeza.",
        genres: ["Drama"],
        platforms: ["Prime Video"],
        rating: 8.5,
        runtime: 106,
        colors: ["#241a1a", "#8c3d2f", "#e0a84b"]
      },
      {
        id: "madmax",
        title: "Mad Max: Fury Road",
        mark: "Mad Max",
        year: 2015,
        director: "George Miller",
        tagline: "La carretera es la única salida.",
        genres: ["Acción", "Ciencia ficción"],
        platforms: ["Max"],
        rating: 8.1,
        runtime: 120,
        colors: ["#3a1a10", "#c45a22", "#efb34f"]
      },
      {
        id: "spiderverse",
        title: "Spider-Man: Across the Spider-Verse",
        mark: "Spider-Verse",
        year: 2023,
        director: "Joaquim Dos Santos",
        tagline: "Cada universo tiene su propio héroe.",
        genres: ["Animación", "Acción"],
        platforms: ["Netflix"],
        rating: 8.6,
        runtime: 140,
        colors: ["#25153f", "#b03c78", "#54c7d6"]
      },
      {
        id: "lalaland",
        title: "La La Land",
        mark: "La La Land",
        year: 2016,
        director: "Damien Chazelle",
        tagline: "Un sueño, dos caminos.",
        genres: ["Romance", "Drama"],
        platforms: ["Prime Video"],
        rating: 8.0,
        runtime: 128,
        colors: ["#1d2848", "#4b62a8", "#e7b45e"]
      },
      {
        id: "chihiro",
        title: "El viaje de Chihiro",
        mark: "Chihiro",
        year: 2001,
        director: "Hayao Miyazaki",
        tagline: "Un mundo detrás del túnel.",
        genres: ["Animación", "Fantasía"],
        platforms: ["Netflix"],
        rating: 8.6,
        runtime: 125,
        colors: ["#20303a", "#4d7a72", "#e8c979"]
      },
      {
        id: "alien",
        title: "Alien",
        mark: "Alien",
        year: 1979,
        director: "Ridley Scott",
        tagline: "En el espacio, nadie te oye.",
        genres: ["Terror", "Ciencia ficción"],
        platforms: ["Disney+"],
        rating: 8.5,
        runtime: 117,
        colors: ["#121817", "#344a40", "#9bb8a3"]
      },
      {
        id: "madre",
        title: "Todo sobre mi madre",
        mark: "Madre",
        year: 1999,
        director: "Pedro Almodóvar",
        tagline: "Las madres también inventan familias.",
        genres: ["Drama", "Comedia"],
        platforms: ["Filmin"],
        rating: 7.8,
        runtime: 101,
        colors: ["#321a24", "#9d3d50", "#e6b05d"]
      }
    ];

    const synopsis = {
      fauno: "En la España de posguerra, Ofelia descubre un laberinto y un mundo fantástico que le pone tres pruebas.",
      otros: "Grace vive con sus hijos en una casa aislada, convencida de que algo habita en la penumbra.",
      celda: "Un funcionario recién llegado queda atrapado en el motín de una prisión y tiene que hacerse pasar por uno de los presos.",
      vascos: "Un sevillano finge ser vasco para conquistar a una chica, y la mentira se le va de las manos.",
      nieve: "Los supervivientes de un accidente aéreo en los Andes tienen que organizarse para seguir con vida.",
      volver: "Raimunda vuelve a su pueblo y se enfrenta a un pasado familiar que creía enterrado.",
      alcarras: "Una familia de payeses ve peligrar su última cosecha y su forma de vida.",
      bestas: "Un matrimonio francés y sus vecinos gallegos chocan por un proyecto de molinos.",
      dune2: "Paul Atreides se une a los fremen para vengar a su familia y frenar el destino que se le impone.",
      eeaao: "Una mujer normal descubre que puede saltar entre universos y que solo ella puede salvarlos.",
      parasitos: "Una familia pobre se infiltra poco a poco en la casa de una familia rica.",
      whiplash: "Un joven batería se somete a la disciplina feroz de un profesor obsesionado con la perfección.",
      madmax: "Max se une a Furiosa para huir de un tirano por un desierto sin ley.",
      spiderverse: "Miles Morales conoce a otras versiones de Spider-Man y descubre que ser héroe no es una sola cosa.",
      lalaland: "Un pianista de jazz y una actriz aspirante se enamoran mientras persiguen sus sueños.",
      chihiro: "Chihiro entra en un mundo de espíritus y tiene que trabajar para liberar a sus padres.",
      alien: "La tripulación de una nave espacial recoge una forma de vida que no debería haber encontrado.",
      madre: "Manuela busca al padre de su hijo y, por el camino, reencuentra a las mujeres que la marcaron."
    };

    const selectedGenres = new Set();
    const selectedPlatforms = new Set();
    let lastId = null;
    let rolling = false;

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function buildChip(label, set, container) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chip";
      button.textContent = label;
      button.setAttribute("aria-pressed", "false");

      button.addEventListener("click", function () {
        if (set.has(label)) set.delete(label);
        else set.add(label);
        button.setAttribute("aria-pressed", String(set.has(label)));
        updateSummary();
      });

      container.append(button);
    }

    genres.forEach(function (genre) {
      buildChip(genre, selectedGenres, genresEl);
    });

    platforms.forEach(function (platform) {
      buildChip(platform, selectedPlatforms, platformsEl);
    });

    function updateSummary() {
      if (!summaryEl) return;
      const genreText = selectedGenres.size
        ? Array.from(selectedGenres).join(", ")
        : "Todos los géneros";
      const platformText = selectedPlatforms.size
        ? Array.from(selectedPlatforms).join(", ")
        : "Cualquier plataforma";
      summaryEl.textContent = genreText + ". " + platformText + ".";
    }

    function showView(name) {
      homeView.hidden = name !== "home";
      resultView.hidden = name !== "result";
    }

    function openSheet(open) {
      sheet.hidden = !open;
    }

    function candidates() {
      return movies.filter(function (movie) {
        const genreMatch = selectedGenres.size === 0 || movie.genres.some(function (genre) {
          return selectedGenres.has(genre);
        });
        const platformMatch = selectedPlatforms.size === 0 || movie.platforms.some(function (platform) {
          return selectedPlatforms.has(platform);
        });
        return genreMatch && platformMatch;
      });
    }

    function renderMovie(movie) {
      const providers = movie.platforms.map(function (platform) {
        return "<span>" + escapeHtml(platform) + "</span>";
      }).join("");

      resultEl.innerHTML =
        '<article class="movie-result">' +
          '<div class="movie-backdrop" style="--backdrop-a:' + movie.colors[0] + ';--backdrop-b:' + movie.colors[1] + ';--backdrop-c:' + movie.colors[2] + '">' +
            '<span class="movie-backdrop__kicker">Esta noche</span>' +
            '<span class="movie-backdrop__word">' + escapeHtml(movie.mark) + "</span>" +
          "</div>" +
          "<h3>" + escapeHtml(movie.title) + "</h3>" +
          '<p class="movie-tagline">' + escapeHtml(movie.tagline) + "</p>" +
          '<p class="movie-meta">' + movie.year + " · " + movie.runtime + " min · ★ " + movie.rating.toFixed(1) + "</p>" +
          '<p class="movie-synopsis">' + escapeHtml(synopsis[movie.id] || "") + "</p>" +
          '<p class="movie-section-label">Disponible en</p>' +
          '<div class="movie-providers">' + providers + "</div>" +
        "</article>";

      resultEl.scrollTop = 0;
      showView("result");
    }

    function renderEmpty(message) {
      resultEl.innerHTML = '<div class="movie-empty">' + message + "</div>";
      resultEl.scrollTop = 0;
      showView("result");
    }

    function roll() {
      if (rolling) return;

      const pool = candidates();
      if (pool.length === 0) {
        renderEmpty("No hay películas con esos filtros.<br />Prueba a ampliarlos desde «Filtros».");
        if (liveEl) liveEl.textContent = "No hay películas con esos filtros.";
        return;
      }

      let options = pool;
      if (pool.length > 1) {
        options = pool.filter(function (movie) {
          return movie.id !== lastId;
        });
      }

      rolling = true;
      rollBtn.disabled = true;
      const rollLabel = rollBtn.querySelector("span");
      const previousLabel = rollLabel ? rollLabel.textContent : "";
      if (rollLabel) rollLabel.textContent = "Buscando...";
      if (againBtn) {
        againBtn.disabled = true;
        againBtn.textContent = "Buscando...";
      }

      window.setTimeout(function () {
        const movie = options[Math.floor(Math.random() * options.length)];
        lastId = movie.id;
        renderMovie(movie);
        rolling = false;
        rollBtn.disabled = false;
        if (rollLabel) rollLabel.textContent = previousLabel;
        if (againBtn) {
          againBtn.disabled = false;
          againBtn.textContent = "Otra";
        }
        if (liveEl) {
          liveEl.textContent = movie.title + ", " + movie.year + ". Disponible en " + movie.platforms.join(", ") + ". " + movie.tagline;
        }
      }, reducedMotion ? 0 : 420);
    }

    rollBtn.addEventListener("click", roll);
    if (againBtn) againBtn.addEventListener("click", roll);

    backButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        showView("home");
        if (liveEl) liveEl.textContent = "Vuelta al inicio.";
      });
    });

    root.querySelectorAll("[data-movies-open-filters]").forEach(function (button) {
      button.addEventListener("click", function () {
        openSheet(true);
      });
    });

    root.querySelectorAll("[data-movies-close-filters]").forEach(function (button) {
      button.addEventListener("click", function () {
        openSheet(false);
      });
    });

    const applyBtn = root.querySelector("[data-movies-apply]");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        openSheet(false);
        updateSummary();
        if (liveEl) liveEl.textContent = summaryEl ? summaryEl.textContent : "Filtros aplicados.";
      });
    }

    const resetBtn = root.querySelector("[data-movies-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        selectedGenres.clear();
        selectedPlatforms.clear();
        root.querySelectorAll(".chip").forEach(function (chip) {
          chip.setAttribute("aria-pressed", "false");
        });
        updateSummary();
        if (liveEl) liveEl.textContent = "Filtros limpiados.";
      });
    }

    updateSummary();
  }

  /* ---------------------------------------------------------
     Nido
     --------------------------------------------------------- */
  function initNido() {
    const root = document.querySelector("[data-nido]");
    if (!root) return;

    const lanesEl = root.querySelector("[data-nido-lanes]");
    const upcomingEl = root.querySelector("[data-nido-upcoming]");
    const kidsEl = root.querySelector("[data-nido-kids]");
    const familyEl = root.querySelector("[data-nido-family]");
    const progressLabel = root.querySelector("[data-nido-progress-label]");
    const progressBar = root.querySelector("[data-nido-progress]");
    const liveEl = root.querySelector("[data-nido-live]");
    const tabButtons = root.querySelectorAll("[data-nido-tab]");
    const panels = root.querySelectorAll("[data-nido-panel]");

    if (!lanesEl) return;

    const priorityColors = {
      alta: "#ba1a1a",
      media: "#9a6700",
      baja: "#2b6a8a"
    };

    const people = {
      lucas: { name: "Lucas", initial: "L", accent: "#b36a3c" },
      vera: { name: "Vera", initial: "V", accent: "#3e7c5a" },
      family: { name: "Toda la familia", initial: "C", accent: "#2b4c7e" }
    };

    const reminders = [
      { id: 1, title: "Llevar a Lucas al dentista", child: "lucas", moment: "Mañana", time: "09:30", category: "Salud", priority: "alta", done: false },
      { id: 2, title: "Deberes de lengua", child: "lucas", moment: "Tarde", time: "17:30", category: "Cole", priority: "media", done: true },
      { id: 3, title: "Merendar y jugar un rato", child: "vera", moment: "Tarde", time: "18:00", category: "Casa", priority: "baja", done: false },
      { id: 4, title: "Preparar la mochila de Vera", child: "vera", moment: "Noche", time: "20:30", category: "Cole", priority: "media", done: false },
      { id: 5, title: "Compra semanal", child: "family", moment: "Tarde", time: "19:00", category: "Casa", priority: "baja", done: false }
    ];

    const upcoming = [
      { id: 101, day: "Mañana", title: "Revisión dental de Lucas", time: "09:30", category: "Salud", priority: "alta" },
      { id: 102, day: "Mañana", title: "Entrega de la autorización del cole", time: "12:00", category: "Cole", priority: "media" },
      { id: 103, day: "Jueves 22", title: "Cumpleaños de Vera", time: "17:00", category: "Familia", priority: "alta" },
      { id: 104, day: "Viernes 23", title: "Excursión al museo", time: "08:45", category: "Cole", priority: "media" }
    ];

    const children = [
      {
        id: "lucas",
        name: "Lucas",
        initial: "L",
        accent: "#b36a3c",
        meta: "7 años · 2.º de Primaria",
        school: "CEIP Clara Campoamor",
        allergies: "Frutos secos",
        authorized: "Marta y abuela Carmen"
      },
      {
        id: "vera",
        name: "Vera",
        initial: "V",
        accent: "#3e7c5a",
        meta: "4 años · Infantil 4",
        school: "Escuela La Cabrera",
        allergies: "Ninguna conocida",
        authorized: "Marta y tía Ana"
      }
    ];

    const members = [
      { name: "Cristian", initial: "C", accent: "#2b4c7e", role: "Admin" },
      { name: "Marta", initial: "M", accent: "#8a5a3b", role: "Progenitora" },
      { name: "Carmen", initial: "C", accent: "#5d9b74", role: "Cuidadora" }
    ];

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function priorityColor(priority) {
      return priorityColors[priority] || priorityColors.baja;
    }

    function row(reminder) {
      const done = reminder.done;
      return (
        '<div class="nido-row' + (done ? " is-done" : "") + '">' +
          '<button class="nido-check" type="button" data-nido-toggle="' + reminder.id + '" aria-pressed="' + done + '" aria-label="' + (done ? "Marcar como pendiente" : "Marcar como hecho") + ": " + escapeHtml(reminder.title) + '" style="--priority:' + priorityColor(reminder.priority) + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          "</button>" +
          "<div>" +
            '<p class="nido-row__title">' + escapeHtml(reminder.title) + "</p>" +
            '<p class="nido-row__meta">' + escapeHtml(reminder.time) + ", " + escapeHtml(reminder.category) + "</p>" +
          "</div>" +
        "</div>"
      );
    }

    function renderToday() {
      const total = reminders.length;
      const done = reminders.filter(function (reminder) {
        return reminder.done;
      }).length;

      if (progressLabel) progressLabel.textContent = done + " de " + total;
      if (progressBar) progressBar.style.width = (total ? (done / total) * 100 : 0) + "%";

      const order = ["lucas", "vera", "family"];
      const moments = ["Mañana", "Tarde", "Noche"];

      lanesEl.innerHTML = order.map(function (childId) {
        const person = people[childId];
        const items = reminders.filter(function (reminder) {
          return reminder.child === childId;
        });
        if (!items.length) return "";

        const groups = moments.map(function (moment) {
          const momentItems = items.filter(function (reminder) {
            return reminder.moment === moment;
          });
          if (!momentItems.length) return "";
          return '<p class="nido-moment">' + moment + "</p>" + momentItems.map(row).join("");
        }).join("");

        return (
          '<div class="nido-lane" style="--accent:' + person.accent + '">' +
            '<div class="nido-lane__head">' +
              '<span class="nido-avatar">' + person.initial + "</span>" +
              "<strong>" + person.name + "</strong>" +
            "</div>" +
            groups +
          "</div>"
        );
      }).join("");
    }

    function renderUpcoming() {
      if (!upcomingEl) return;
      const days = [];
      upcoming.forEach(function (item) {
        if (days.indexOf(item.day) === -1) days.push(item.day);
      });

      upcomingEl.innerHTML = days.map(function (day) {
        const items = upcoming.filter(function (item) {
          return item.day === day;
        });
        return (
          '<div class="nido-day">' +
            "<strong>" + escapeHtml(day) + "</strong>" +
            items.map(function (item) {
              return (
                '<div class="nido-row">' +
                  '<span class="nido-check" aria-hidden="true" style="--priority:' + priorityColor(item.priority) + '"></span>' +
                  "<div>" +
                    '<p class="nido-row__title">' + escapeHtml(item.title) + "</p>" +
                    '<p class="nido-row__meta">' + escapeHtml(item.time) + ", " + escapeHtml(item.category) + "</p>" +
                  "</div>" +
                "</div>"
              );
            }).join("") +
          "</div>"
        );
      }).join("");
    }

    function renderKids() {
      if (!kidsEl) return;
      kidsEl.innerHTML = children.map(function (child) {
        return (
          '<div class="nido-kid-card">' +
            '<div class="nido-kid-head">' +
              '<span class="nido-avatar" style="--accent:' + child.accent + '">' + child.initial + "</span>" +
              "<div><strong>" + escapeHtml(child.name) + "</strong><span>" + escapeHtml(child.meta) + "</span></div>" +
            "</div>" +
            "<dl>" +
              "<div><dt>Colegio</dt><dd>" + escapeHtml(child.school) + "</dd></div>" +
              "<div><dt>Alergias</dt><dd>" + escapeHtml(child.allergies) + "</dd></div>" +
              "<div><dt>Autorizados</dt><dd>" + escapeHtml(child.authorized) + "</dd></div>" +
            "</dl>" +
          "</div>"
        );
      }).join("");
    }

    function renderFamily() {
      if (!familyEl) return;
      familyEl.innerHTML = members.map(function (member) {
        return (
          '<div class="nido-member">' +
            '<div class="nido-member__identity">' +
              '<span class="nido-avatar" style="--accent:' + member.accent + '">' + member.initial + "</span>" +
              "<div><strong>" + escapeHtml(member.name) + "</strong><span>Cuenta de la familia</span></div>" +
            "</div>" +
            '<span class="nido-role">' + escapeHtml(member.role) + "</span>" +
          "</div>"
        );
      }).join("") +
      '<div class="nido-invite"><span>Código para invitar a un cuidador</span><strong>NIDO-4821</strong></div>';
    }

    root.addEventListener("click", function (event) {
      const button = event.target.closest("[data-nido-toggle]");
      if (!button) return;

      const id = Number(button.getAttribute("data-nido-toggle"));
      const reminder = reminders.find(function (item) {
        return item.id === id;
      });
      if (!reminder) return;

      reminder.done = !reminder.done;
      renderToday();

      if (liveEl) {
        liveEl.textContent = reminder.title + (reminder.done ? ": hecho." : ": pendiente.");
      }
    });

    tabButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        const target = button.getAttribute("data-nido-tab");

        tabButtons.forEach(function (item) {
          item.setAttribute("aria-selected", String(item === button));
        });

        panels.forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-nido-panel") !== target;
        });
      });
    });

    renderToday();
    renderUpcoming();
    renderKids();
    renderFamily();
  }

  /* ---------------------------------------------------------
     Wasteland Legends
     --------------------------------------------------------- */
  function initWasteland() {
    const root = document.querySelector("[data-waste]");
    if (!root) return;

    const picker = root.querySelector("[data-waste-picker]");
    const sprite = root.querySelector("[data-waste-sprite]");
    const roleEl = root.querySelector("[data-waste-role]");
    const nameEl = root.querySelector("[data-waste-name]");
    const descEl = root.querySelector("[data-waste-desc]");
    const statsEl = root.querySelector("[data-waste-stats]");

    if (!picker || !sprite || !statsEl) return;

    const characters = [
      {
        id: "dust",
        name: "Dust Hunter",
        role: "Exploradora",
        sprite: "img/proyectos/wasteland/dust-hunter.png",
        desc: "Rápida, curiosa y con muy pocas ganas de quedarse quieta. Encuentra atajos donde otros ven escombros.",
        stats: { Vida: 72, Ataque: 64, Velocidad: 92, Suerte: 58 }
      },
      {
        id: "gunner",
        name: "Desert Gunner",
        role: "Tiradora",
        sprite: "img/proyectos/wasteland/desert-gunner.png",
        desc: "Punta firme y pocas palabras. Prefiere resolver las conversaciones a distancia de seguridad.",
        stats: { Vida: 68, Ataque: 94, Velocidad: 61, Suerte: 45 }
      },
      {
        id: "sentinel",
        name: "Iron Sentinel",
        role: "Defensor",
        sprite: "img/proyectos/wasteland/iron-sentinel.png",
        desc: "Aguanta lo que le echen. Si el camino se estrecha, probablemente sea él quien lo abra.",
        stats: { Vida: 96, Ataque: 58, Velocidad: 34, Suerte: 41 }
      },
      {
        id: "reaper",
        name: "Bone Reaper",
        role: "Segador",
        sprite: "img/proyectos/wasteland/bone-reaper.png",
        desc: "No habla mucho del pasado. El yermo tampoco pregunta. Golpea fuerte y camina despacio.",
        stats: { Vida: 84, Ataque: 88, Velocidad: 46, Suerte: 63 }
      }
    ];

    const buttons = characters.map(function (character) {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Elegir a " + character.name);

      const image = document.createElement("img");
      image.src = character.sprite;
      image.alt = "";
      button.append(image);

      button.addEventListener("click", function () {
        select(character.id);
      });

      picker.append(button);
      return button;
    });

    function select(id) {
      const character = characters.find(function (item) {
        return item.id === id;
      });
      if (!character) return;

      sprite.src = character.sprite;
      sprite.alt = character.name;
      roleEl.textContent = character.role;
      nameEl.textContent = character.name;
      descEl.textContent = character.desc;

      statsEl.innerHTML = Object.keys(character.stats).map(function (stat) {
        return (
          "<div>" +
            "<dt>" + stat + "</dt>" +
            '<dd><span style="--value:' + character.stats[stat] + '%"></span></dd>' +
          "</div>"
        );
      }).join("");

      characters.forEach(function (item, index) {
        buttons[index].setAttribute("aria-pressed", String(item.id === id));
      });
    }

    select("dust");
  }

  /* ---------------------------------------------------------
     Slider de experimentos
     --------------------------------------------------------- */
  function initSlider() {
    const root = document.querySelector("[data-slider]");
    if (!root) return;

    const track = root.querySelector("[data-slider-track]");
    const slides = Array.prototype.slice.call(root.querySelectorAll("[data-slider-slide]"));
    const tabs = Array.prototype.slice.call(root.querySelectorAll("[data-slider-tab]"));
    const prev = root.querySelector("[data-slider-prev]");
    const next = root.querySelector("[data-slider-next]");
    const status = root.querySelector("[data-slider-status]");
    const progress = root.querySelector("[data-slider-progress]");
    const viewport = root.querySelector("[data-slider-viewport]");

    if (!track || !slides.length) return;

    const names = tabs.map(function (tab) {
      return tab.textContent.trim();
    });

    let index = 0;

    function setInert(slide, inactive) {
      if ("inert" in slide) {
        slide.inert = inactive;
        return;
      }

      slide.querySelectorAll("a, button, input, select, textarea, [tabindex]").forEach(function (element) {
        if (inactive) element.setAttribute("tabindex", "-1");
        else element.removeAttribute("tabindex");
      });
    }

    function go(target) {
      index = (target + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";

      slides.forEach(function (slide, slideIndex) {
        const active = slideIndex === index;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
        setInert(slide, !active);
      });

      tabs.forEach(function (tab, tabIndex) {
        tab.setAttribute("aria-selected", String(tabIndex === index));
        tab.setAttribute("tabindex", tabIndex === index ? "0" : "-1");
      });

      const activeTab = tabs[index];
      if (activeTab && activeTab.parentElement) {
        const list = activeTab.parentElement;
        const listRect = list.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const target = list.scrollLeft + (tabRect.left - listRect.left) - (listRect.width - tabRect.width) / 2;
        list.scrollLeft = Math.max(0, target);
      }

      if (status) status.textContent = names[index] + " · " + (index + 1) + " de " + slides.length;
      if (progress) progress.style.width = ((index + 1) / slides.length) * 100 + "%";
    }

    tabs.forEach(function (tab, tabIndex) {
      tab.addEventListener("click", function () {
        go(tabIndex);
      });
    });

    if (prev) prev.addEventListener("click", function () { go(index - 1); });
    if (next) next.addEventListener("click", function () { go(index + 1); });

    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(index - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go(index + 1);
      }
    });

    if (viewport) {
      let startX = null;

      viewport.addEventListener("pointerdown", function (event) {
        if (event.pointerType === "mouse") return;
        startX = event.clientX;
      });

      viewport.addEventListener("pointerup", function (event) {
        if (startX === null) return;
        const delta = event.clientX - startX;
        startX = null;
        if (Math.abs(delta) < 40) return;
        go(index + (delta < 0 ? 1 : -1));
      });

      viewport.addEventListener("pointercancel", function () {
        startX = null;
      });
    }

    document.querySelectorAll("[data-slider-jump]").forEach(function (link) {
      link.addEventListener("click", function () {
        go(Number(link.getAttribute("data-slider-jump")));
      });
    });

    go(0);
  }

  /* ---------------------------------------------------------
     Arranque
     --------------------------------------------------------- */
  initCountry();
  initMovies();
  initNido();
  initWasteland();
  initSlider();
})();
