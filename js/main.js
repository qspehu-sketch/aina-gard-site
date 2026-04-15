(function () {
  "use strict";

  var LINKS = {
    tg: "https://t.me/+rpmO-uLEpoM3MWZi",
    portfolio: "https://t.me/+rpmO-uLEpoM3MWZi"
  };

  var I18N = {
    ru: {
      doc_title: "Айна Гард — AI Creator",
      hero_name: "Айна Гард",
      eyebrow: "Проводник в мир нейросетей",
      subtitle: "AI-решения для бренда, бизнеса, творчества и жизни",
      btn_diag: "Бесплатная консультация",
      btn_portfolio: "Портфолио",
      sound_on: "🔊 Включить звук",
      sound_off: "🔇 Выключить звук",
      ariaSoundOn: "Включить фоновый звук",
      ariaSoundOff: "Выключить фоновый звук",
      tap_hint: "Нажмите",
      card_dir: "Направление",
      back: "Назад",
      about_kicker: "Обо мне",
      about_lead: "Практический опыт в нейросетях с 2024 года",
      role1: "AI-креатор",
      role2: "Промт-инженер",
      role3: "Вайб-кодер",
      contact: "Связаться",
      btn_card: "Бесплатная консультация →",
      c1_title: "Личный бренд",
      c1_back_title: "Личный бренд",
      c1_price: "от 5 000 ₽",
      c1_f1: "Нейрофотосессии",
      c1_f2: "Цифровой аватар",
      c1_f3: "Нейровидео",
      c1_f4: "Контент для соцсетей",
      c2_title: "Бизнес",
      c2_back_title: "Бизнес",
      c2_price: "от 10 000 ₽",
      c2_f1: "Автоматизация процессов",
      c2_f2: "AI-агенты и боты",
      c2_f3: "Сайты и лендинги",
      c2_f4: "Приложения под задачу",
      c3_title: "Творчество",
      c3_back_title: "Творчество",
      c3_price: "от 3 000 ₽",
      c3_f1: "Нейродизайн",
      c3_f2: "Изображения и видео",
      c3_f3: "Песни и музыка",
      c3_f4: "Креативные концепции",
      c4_title: "Жизнь",
      c4_back_title: "Жизнь",
      c4_price: "от 3 000 ₽",
      c4_f1: "AI для повседневных задач",
      c4_f2: "Идеи и планирование",
      c4_f3: "Личные проекты",
      c4_f4: "Умные помощники",
      meta_description:
        "Айна Гард — AI Creator, промт-инженер и вайб-кодер. AI-решения для бренда, бизнеса и творчества. Бесплатная консультация в Telegram."
    },
    en: {
      doc_title: "Aina Gard — AI Creator",
      hero_name: "Aina Gard",
      eyebrow: "Guide to the world of neural networks",
      subtitle: "AI solutions for brand, business, creativity & life",
      btn_diag: "Free consultation",
      btn_portfolio: "Portfolio",
      sound_on: "🔊 Sound on",
      sound_off: "🔇 Sound off",
      ariaSoundOn: "Enable ambient sound",
      ariaSoundOff: "Disable ambient sound",
      tap_hint: "Tap",
      card_dir: "Focus",
      back: "Back",
      about_kicker: "About",
      about_lead: "Hands-on experience with neural networks since 2024",
      role1: "AI creator",
      role2: "Prompt engineer",
      role3: "Vibe coder",
      contact: "Contact",
      btn_card: "Free consultation →",
      c1_title: "Personal brand",
      c1_back_title: "Personal brand",
      c1_price: "from 5000 ₽",
      c1_f1: "Neuro photo sessions",
      c1_f2: "Digital avatar",
      c1_f3: "Neuro video",
      c1_f4: "Social content",
      c2_title: "Business",
      c2_back_title: "Business",
      c2_price: "from 10 000 ₽",
      c2_f1: "Process automation",
      c2_f2: "AI agents & bots",
      c2_f3: "Sites & landing pages",
      c2_f4: "Apps for your goals",
      c3_title: "Creativity",
      c3_back_title: "Creativity",
      c3_price: "from 3000 ₽",
      c3_f1: "Neuro design",
      c3_f2: "Images & video",
      c3_f3: "Songs & music",
      c3_f4: "Creative concepts",
      c4_title: "Life",
      c4_back_title: "Life",
      c4_price: "from 3000 ₽",
      c4_f1: "AI for daily tasks",
      c4_f2: "Ideas & planning",
      c4_f3: "Personal projects",
      c4_f4: "Smart assistants",
      meta_description:
        "Aina Gard — AI creator, prompt engineer, and vibe coder. AI solutions for brand, business, and creativity. Free consultation on Telegram."
    }
  };

  var lang = localStorage.getItem("aina_lang") || "ru";
  var audioEl = document.getElementById("ambientAudio");
  var btnSound = document.getElementById("btnSound");
  var soundLabel = document.getElementById("soundLabel");
  var btnLang = document.getElementById("btnLang");

  if (audioEl) {
    audioEl.volume = 0.52;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /** Canvas plexus: рёбра по расстоянию, пружина к (ox,oy), магнит и подсветка у курсора */
  function initPlexusBackground() {
    var canvas = document.getElementById("bgPlexus");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var particles = [];
    var mouse = { x: 0, y: 0, active: false };
    var w = 300;
    var h = 200;
    var dpr = 1;
    var running = true;
    var rafId = 0;

    function cfg() {
      var reduce = prefersReducedMotion();
      return {
        reduce: reduce,
        maxDist: reduce ? 98 : 118,
        baseLine: reduce ? 0.14 : 0.22,
        musicBoost: document.body.classList.contains("music-on") ? 1.14 : 1,
        magnetR: reduce ? 125 : 268,
        magnetPull: reduce ? 0.38 : 1.08,
        spring: reduce ? 0.1 : 0.064,
        friction: reduce ? 0.79 : 0.865,
        highlightR: reduce ? 145 : 300
      };
    }

    function countN() {
      var reduce = prefersReducedMotion();
      var area = w * h;
      var n = Math.floor(area / 28500);
      return Math.max(32, Math.min(reduce ? 46 : 84, n));
    }

    function rebuild() {
      var rect = canvas.getBoundingClientRect();
      var rw = rect.width || window.innerWidth || 960;
      var rh = rect.height || window.innerHeight || 540;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = Math.max(320, Math.floor(rw));
      h = Math.max(240, Math.floor(rh));
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = countN();
      var rnd = Math.random;
      var pad = 16;
      particles = [];
      for (var i = 0; i < n; i++) {
        var ox = pad + rnd() * (w - pad * 2);
        var oy = pad + rnd() * (h - pad * 2);
        particles.push({
          ox: ox,
          oy: oy,
          x: ox,
          y: oy,
          vx: 0,
          vy: 0,
          r: 1.05 + rnd() * 2.35,
          bit: rnd() < 0.22 ? (rnd() < 0.5 ? "0" : "1") : null
        });
      }
    }

    function setMouseFromClient(clientX, clientY, rect) {
      if (
        clientX < rect.left - 32 ||
        clientX > rect.right + 32 ||
        clientY < rect.top - 32 ||
        clientY > rect.bottom + 32
      ) {
        mouse.active = false;
        return;
      }
      mouse.x = (clientX - rect.left) * (w / rect.width);
      mouse.y = (clientY - rect.top) * (h / rect.height);
      mouse.active = true;
    }

    function onPointerMove(e) {
      var rect = canvas.getBoundingClientRect();
      if (typeof e.clientX !== "number") return;
      setMouseFromClient(e.clientX, e.clientY, rect);
    }

    function onPointerLeaveTouch() {
      mouse.active = false;
    }

    function onTouchStart(e) {
      var t = e.touches && e.touches[0];
      if (!t) return;
      var rect = canvas.getBoundingClientRect();
      setMouseFromClient(t.clientX, t.clientY, rect);
    }

    function tick() {
      rafId = 0;
      if (!running) return;
      var c = cfg();
      var mx = mouse.x;
      var my = mouse.y;
      var magnetR = c.magnetR;
      var magnetPull = c.magnetPull * c.musicBoost;
      var spring = c.spring;
      var friction = c.friction;
      var i;
      var p;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        var dx = p.ox - p.x;
        var dy = p.oy - p.y;
        p.vx += dx * spring;
        p.vy += dy * spring;
        if (mouse.active) {
          var mdx = mx - p.x;
          var mdy = my - p.y;
          var md = Math.hypot(mdx, mdy);
          if (md < magnetR && md > 0.001) {
            var t = 1 - md / magnetR;
            var f = t * t * magnetPull;
            p.vx += (mdx / md) * f;
            p.vy += (mdy / md) * f;
          }
        }
        p.vx *= friction;
        p.vy *= friction;
        p.x += p.vx;
        p.y += p.vy;
      }

      ctx.clearRect(0, 0, w, h);
      var maxDist = c.maxDist;
      var baseLineAlpha = c.baseLine * c.musicBoost;
      var highlightR = c.highlightR;
      var j;
      var q;
      var d;
      var mdM;
      var edgeBoost;
      var alpha;
      var lw;

      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        for (j = i + 1; j < particles.length; j++) {
          q = particles[j];
          d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d > maxDist) continue;
          var midx = (p.x + q.x) * 0.5;
          var midy = (p.y + q.y) * 0.5;
          mdM = mouse.active ? Math.hypot(mx - midx, my - midy) : 9999;
          edgeBoost =
            mouse.active && mdM < highlightR
              ? Math.max(0, 1 - mdM / highlightR)
              : 0;
          alpha = (1 - d / maxDist) * baseLineAlpha * (1 + edgeBoost * 2.85);
          lw = 0.72 + edgeBoost * 1.55 + (1 - d / maxDist) * 0.48;
          if (edgeBoost > 0.18) {
            ctx.strokeStyle =
              "rgba(185, 248, 255, " + Math.min(0.92, alpha + 0.28) + ")";
          } else {
            ctx.strokeStyle = "rgba(95, 200, 255, " + alpha + ")";
          }
          ctx.lineWidth = lw;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        var dM = mouse.active ? Math.hypot(mx - p.x, my - p.y) : 9999;
        var hot =
          mouse.active && dM < magnetR ? Math.max(0, 1 - dM / magnetR) : 0;
        var rad = p.r + hot * 4;
        ctx.shadowColor = "rgba(120, 235, 255, 0.95)";
        ctx.shadowBlur = hot > 0.07 ? 16 * hot : 0;
        ctx.fillStyle =
          "rgba(195, 250, 255, " + (0.3 + hot * 0.6) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (p.bit) {
          var fs = Math.max(7, Math.min(13, rad * 2.35));
          ctx.font =
            "600 " + fs + "px 'Plus Jakarta Sans', system-ui, sans-serif";
          ctx.fillStyle =
            "rgba(215, 252, 255, " + (0.36 + hot * 0.55) + ")";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.bit, p.x, p.y + 0.5);
        }
      }

      rafId = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (!rafId && running) rafId = requestAnimationFrame(tick);
    }

    rebuild();
    startLoop();

    window.addEventListener("load", function () {
      rebuild();
    });

    requestAnimationFrame(function () {
      rebuild();
    });

    window.addEventListener(
      "resize",
      function () {
        rebuild();
      },
      { passive: true }
    );

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onPointerMove, { passive: true });
    document.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") onPointerLeaveTouch();
    }, { passive: true });
    document.addEventListener("pointercancel", onPointerLeaveTouch, {
      passive: true
    });
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener(
      "touchmove",
      function (e) {
        var t = e.touches && e.touches[0];
        if (!t) return;
        var rect = canvas.getBoundingClientRect();
        setMouseFromClient(t.clientX, t.clientY, rect);
      },
      { passive: true }
    );
    document.addEventListener("touchend", onPointerLeaveTouch, {
      passive: true
    });

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
      if (running) startLoop();
    });

    var rect0 = canvas.getBoundingClientRect();
    mouse.x = rect0.width * 0.5;
    mouse.y = rect0.height * 0.46;
  }

  /** Лёгкий параллакс слоя сети + orb */
  function initGlobalPointerAmbient() {
    var threadsRoot = document.querySelector(".bg-threads");
    var shift = document.querySelector(".bg-threads-shift");
    var o1 = document.querySelector(".bg-orb-1");
    var o2 = document.querySelector(".bg-orb-2");
    if (!threadsRoot && !o1 && !o2) return;

    var reduce = prefersReducedMotion();
    var tMul = reduce ? 0.35 : 1;
    var oMul = reduce ? 0.4 : 1;
    var pxX = reduce ? 28 : 72;
    var pxY = reduce ? 22 : 54;

    function applyFromPoint(clientX, clientY) {
      var w = window.innerWidth || 1;
      var h = window.innerHeight || 1;
      var nx = (clientX / w - 0.5) * 2;
      var ny = (clientY / h - 0.5) * 2;
      var tx = nx * pxX * tMul;
      var ty = ny * pxY * tMul;

      if (threadsRoot) {
        threadsRoot.style.transform =
          "translate3d(" + tx + "px, " + ty + "px, 0)";
      }
      if (shift) {
        shift.style.transform = "";
      }
      if (o1 && o2) {
        o1.style.transform =
          "translate3d(" + nx * 30 * oMul + "px, " + ny * 20 * oMul + "px, 0)";
        o2.style.transform =
          "translate3d(" + nx * -20 * oMul + "px, " + ny * -15 * oMul + "px, 0)";
      }
    }

    function onPointer(e) {
      if (typeof e.clientX === "number" && typeof e.clientY === "number") {
        applyFromPoint(e.clientX, e.clientY);
      }
    }

    function onTouch(e) {
      var t = e.touches && e.touches[0];
      if (t) applyFromPoint(t.clientX, t.clientY);
    }

    document.addEventListener("pointermove", onPointer, { passive: true });
    document.addEventListener("mousemove", onPointer, { passive: true });
    document.addEventListener("touchmove", onTouch, { passive: true });

    applyFromPoint(window.innerWidth * 0.5, window.innerHeight * 0.45);
  }

  /** Glow + 3D-tilt карточек; при reduced — слабее, но не отключено */
  function initCardWowEffects() {
    var reduce = prefersReducedMotion();
    var maxTilt = reduce ? 2 : 5;
    var glowHi = reduce ? "0.72" : "1";

    document.querySelectorAll("[data-card]").forEach(function (card) {
      var tilt = card.querySelector(".card-tilt");
      var front = card.querySelector(".card-front");
      if (!tilt) return;

      function resetTilt() {
        tilt.style.transform = "";
      }

      function setGlowPos(px, py) {
        var x = px + "px";
        var y = py + "px";
        card.style.setProperty("--glow-x", x);
        card.style.setProperty("--glow-y", y);
        if (front) {
          front.style.setProperty("--glow-x", x);
          front.style.setProperty("--glow-y", y);
        }
      }

      card.addEventListener("mouseenter", function () {
        if (!card.classList.contains("is-flipped")) {
          card.style.setProperty("--glow-opacity", glowHi);
          if (front) front.style.setProperty("--glow-opacity", glowHi);
        }
      });

      card.addEventListener("mouseleave", function () {
        card.style.setProperty("--glow-opacity", "0");
        if (front) front.style.setProperty("--glow-opacity", "0");
        resetTilt();
      });

      card.addEventListener("pointermove", function (e) {
        if (card.classList.contains("is-flipped")) {
          resetTilt();
          return;
        }
        var rect = card.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) return;
        var px = e.clientX - rect.left;
        var py = e.clientY - rect.top;
        setGlowPos(px, py);

        var nx = (e.clientX - rect.left) / rect.width;
        var ny = (e.clientY - rect.top) / rect.height;
        var tiltX = (ny - 0.5) * -10;
        var tiltY = (nx - 0.5) * 10;
        tiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
        tiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));
        tilt.style.transform =
          "perspective(1000px) rotateX(" +
          tiltX +
          "deg) rotateY(" +
          tiltY +
          "deg)";
      });
    });
  }

  function applyLinks() {
    document.querySelectorAll("[data-link]").forEach(function (el) {
      var k = el.getAttribute("data-link");
      if (LINKS[k]) el.href = LINKS[k];
    });
  }

  function setLang(next) {
    lang = next;
    localStorage.setItem("aina_lang", lang);
    document.documentElement.lang = lang === "en" ? "en" : "ru";
    var t = I18N[lang];
    if (!t) return;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (t[key] === undefined) return;
      el.textContent = t[key];
    });

    var img = document.getElementById("portraitImg");
    if (img && t.hero_name) img.setAttribute("alt", t.hero_name);

    var metaDesc = document.getElementById("metaDesc");
    var ogDesc = document.getElementById("ogDesc");
    if (t.meta_description) {
      if (metaDesc) metaDesc.setAttribute("content", t.meta_description);
      if (ogDesc) ogDesc.setAttribute("content", t.meta_description);
    }

    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && t.doc_title) ogTitle.setAttribute("content", t.doc_title);

    if (btnLang) btnLang.textContent = lang === "ru" ? "RU / EN" : "EN / RU";

    var playing = audioEl && !audioEl.paused;
    if (soundLabel) soundLabel.textContent = playing ? t.sound_off : t.sound_on;
    if (btnSound)
      btnSound.setAttribute("aria-label", playing ? t.ariaSoundOff : t.ariaSoundOn);
  }

  function toggleSound() {
    if (!audioEl || !btnSound || !soundLabel) return;
    var t = I18N[lang];
    if (audioEl.paused) {
      var playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(function () {
            btnSound.setAttribute("aria-pressed", "true");
            document.body.classList.add("music-on");
            soundLabel.textContent = t.sound_off;
            btnSound.setAttribute("aria-label", t.ariaSoundOff);
          })
          .catch(function (err) {
            console.warn("[audio] play blocked or failed:", err);
            btnSound.setAttribute("aria-pressed", "false");
            document.body.classList.remove("music-on");
          });
      }
    } else {
      audioEl.pause();
      btnSound.setAttribute("aria-pressed", "false");
      document.body.classList.remove("music-on");
      soundLabel.textContent = t.sound_on;
      btnSound.setAttribute("aria-label", t.ariaSoundOn);
    }
  }

  if (btnSound) btnSound.addEventListener("click", toggleSound);

  if (btnLang) {
    btnLang.addEventListener("click", function () {
      setLang(lang === "ru" ? "en" : "ru");
    });
  }

  document.querySelectorAll("[data-card]").forEach(function (card) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a[href]")) return;
      var tilt = card.querySelector(".card-tilt");
      if (e.target.closest(".card-flip-back")) {
        card.classList.remove("is-flipped");
        if (tilt) tilt.style.transform = "";
        var fr = card.querySelector(".card-front");
        if (fr) fr.style.setProperty("--glow-opacity", "0");
        return;
      }
      if (card.classList.contains("is-flipped")) return;
      card.classList.add("is-flipped");
      if (tilt) tilt.style.transform = "";
      card.style.setProperty("--glow-opacity", "0");
      var fr = card.querySelector(".card-front");
      if (fr) fr.style.setProperty("--glow-opacity", "0");
    });
  });

  var portraitCard = document.getElementById("portraitCard");
  if (portraitCard) {
    portraitCard.addEventListener("click", function (e) {
      if (e.target.closest("a[href]")) return;
      portraitCard.classList.toggle("is-flipped");
    });
  }

  initPlexusBackground();
  initGlobalPointerAmbient();
  initCardWowEffects();
  applyLinks();
  setLang(lang);
})();
