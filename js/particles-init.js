/**
 * particles.js: стабильный запуск, меньше нагрузки на CPU/GPU, пауза в фоновой вкладке.
 * Слои см. styles.css (#particles-js z-index: 2 над фото).
 */
(function () {
  "use strict";

  var lastIsDark = null;
  var lastLayoutTier = -1;
  var waitAttempts = 0;
  var MAX_WAIT = 80;
  var booted = false;

  function layoutTier() {
    var w = window.innerWidth || 1200;
    if (w < 768) return 0;
    if (w < 1200) return 1;
    return 2;
  }

  function destroyParticles() {
    var root = document.getElementById("particles-js");
    if (root) {
      var canv = root.querySelector("canvas");
      if (canv && canv.parentNode) canv.parentNode.removeChild(canv);
    }
    var dom = window.pJSDom;
    var list =
      dom && typeof dom.length === "number" && dom.length > 0
        ? Array.prototype.slice.call(dom)
        : [];
    for (var i = 0; i < list.length; i++) {
      try {
        var p = list[i];
        if (p && p.pJS && p.pJS.fn && p.pJS.fn.vendors) {
          p.pJS.fn.vendors.destroypJS();
        }
      } catch (e) {}
    }
    window.pJSDom = [];
  }

  function detectDark() {
    var html = document.documentElement;
    if (html.classList.contains("theme-light")) return false;
    if (html.getAttribute("data-theme") === "light") return false;
    if (html.classList.contains("dark")) return true;
    if (html.getAttribute("data-theme") === "dark") return true;
    return true;
  }

  function isCoarsePointer() {
    try {
      return window.matchMedia("(pointer: coarse)").matches;
    } catch (e) {
      return false;
    }
  }

  function initParticles(isDark) {
    if (typeof window.particlesJS !== "function") return;
    destroyParticles();

    var colors = isDark
      ? {
          particles: "#6ec8ff",
          lines: "#f0a8d8",
          accent: "#4a9fd8"
        }
      : {
          particles: "#4a7ba7",
          lines: "#c97db8",
          accent: "#2d5a7b"
        };

    var reduce = false;
    try {
      reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e2) {}

    var coarse = isCoarsePointer();
    var w = window.innerWidth || 1200;
    var count = reduce ? 36 : w < 768 ? 50 : w < 1200 ? 68 : 88;
    var valueArea = reduce ? 1800 : w < 768 ? 1500 : 1250;
    var linkDist = w < 768 ? 135 : 160;
    var moveSpeed = reduce ? 0.4 : coarse ? 0.8 : 1;
    var useRetina = w >= 960 && !reduce && !coarse;

    window.particlesJS("particles-js", {
      particles: {
        number: { value: count, density: { enable: true, value_area: valueArea } },
        color: { value: colors.particles },
        shape: {
          type: "circle",
          stroke: { width: 0.5, color: colors.accent }
        },
        opacity: {
          value: 0.7,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.3
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 1
          }
        },
        line_linked: {
          enable: true,
          distance: linkDist,
          color: colors.lines,
          opacity: 0.4,
          width: 1.2
        },
        move: {
          enable: true,
          speed: moveSpeed,
          random: true,
          out_mode: "bounce"
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: true, mode: "push" },
          resize: true
        },
        modes: {
          grab: { distance: 220, line_linked: { opacity: 0.8 } },
          push: { particles_nb: 4 },
          repulse: { distance: 180, duration: 0.4 }
        }
      },
      retina_detect: useRetina
    });
  }

  function syncParticlesFromTheme(force) {
    var d = detectDark();
    if (!force && lastIsDark === d && document.querySelector("#particles-js canvas")) {
      return;
    }
    lastIsDark = d;
    initParticles(d);
  }

  function boot() {
    if (booted) return;
    syncParticlesFromTheme(true);

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        destroyParticles();
      } else {
        syncParticlesFromTheme(true);
      }
    });

    window.addEventListener("pageshow", function (ev) {
      if (ev.persisted) {
        syncParticlesFromTheme(true);
      }
    });

    var moTimer = null;
    try {
      new MutationObserver(function () {
        if (moTimer) clearTimeout(moTimer);
        moTimer = setTimeout(function () {
          moTimer = null;
          var d = detectDark();
          if (d !== lastIsDark) {
            syncParticlesFromTheme(true);
          }
        }, 200);
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme"]
      });
    } catch (e3) {}

    lastLayoutTier = layoutTier();
    var resizeTimer = null;
    window.addEventListener(
      "resize",
      function () {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          resizeTimer = null;
          var t = layoutTier();
          if (t !== lastLayoutTier) {
            lastLayoutTier = t;
            syncParticlesFromTheme(true);
          }
        }, 320);
      },
      { passive: true }
    );

    booted = true;
  }

  function waitLib() {
    waitAttempts++;
    if (typeof window.particlesJS === "function") {
      boot();
      return;
    }
    if (waitAttempts >= MAX_WAIT) {
      return;
    }
    setTimeout(waitLib, 80);
  }

  function startAfterPaint() {
    if (document.readyState === "complete") {
      requestAnimationFrame(function () {
        requestAnimationFrame(waitLib);
      });
    } else {
      window.addEventListener("load", function () {
        requestAnimationFrame(function () {
          requestAnimationFrame(waitLib);
        });
      });
    }
  }

  startAfterPaint();
})();
