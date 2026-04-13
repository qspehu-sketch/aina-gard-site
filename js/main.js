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

  function initThreadsCursorParallax() {
    var shift = document.querySelector(".bg-threads-shift");
    if (!shift) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var maxX = reduce ? 14 : 72;
    var maxY = reduce ? 10 : 54;
    document.addEventListener("mousemove", function (e) {
      var nx = (e.clientX / window.innerWidth - 0.5) * 2;
      var ny = (e.clientY / window.innerHeight - 0.5) * 2;
      shift.style.transform =
        "translate(" + nx * maxX + "px, " + ny * maxY + "px)";
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
      if (e.target.closest(".card-flip-back")) {
        card.classList.remove("is-flipped");
        return;
      }
      if (card.classList.contains("is-flipped")) return;
      card.classList.add("is-flipped");
    });
  });

  var portraitCard = document.getElementById("portraitCard");
  if (portraitCard) {
    portraitCard.addEventListener("click", function (e) {
      if (e.target.closest("a[href]")) return;
      portraitCard.classList.toggle("is-flipped");
    });
  }

  initThreadsCursorParallax();
  applyLinks();
  setLang(lang);
})();
