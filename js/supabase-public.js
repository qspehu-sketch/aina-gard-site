(function () {
  "use strict";

  var url = window.SUPABASE_URL || "";
  var key = window.SUPABASE_ANON_KEY || "";
  var client = null;
  if (url && key && window.supabase && window.supabase.createClient) {
    client = window.supabase.createClient(url, key);
    window.__ainaSupabase = client;
  }

  function mergeCardsIntoWindow(rows) {
    var bySlot = {};
    rows.forEach(function (r) {
      bySlot[r.slot] = r.data || {};
    });
    window.__AINA_SERVICE_ROWS__ = bySlot;
    if (window.__ainaRefreshI18n) window.__ainaRefreshI18n();
  }

  function loadServiceCards() {
    if (!client) return Promise.resolve();
    return client
      .from("service_cards")
      .select("slot,data")
      .order("slot", { ascending: true })
      .then(function (res) {
        if (res.error) {
          console.warn("[supabase] service_cards:", res.error.message);
          return;
        }
        mergeCardsIntoWindow(res.data || []);
      });
  }

  function esc(s) {
    if (!s) return "";
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderArticles(list, lang) {
    var root = document.getElementById("articles-root");
    var wrap = document.getElementById("articles-section");
    if (!root) return;
    root.innerHTML = "";
    if (!list || !list.length) {
      if (wrap) wrap.hidden = true;
      return;
    }
    if (wrap) wrap.hidden = false;
    list.forEach(function (a) {
      var title = lang === "en" ? (a.title_en || a.title_ru) : (a.title_ru || a.title_en);
      var body = lang === "en" ? (a.body_en || a.body_ru) : (a.body_ru || a.body_en);
      var art = document.createElement("article");
      art.className = "feed-card";
      var imgHtml = a.image_url
        ? '<div class="feed-card__img"><img src="' + esc(a.image_url) + '" alt="" loading="lazy" /></div>'
        : "";
      art.innerHTML =
        imgHtml +
        '<h3 class="feed-card__title">' +
        esc(title) +
        "</h3>" +
        '<div class="feed-card__body">' +
        esc(body).replace(/\n/g, "<br>") +
        "</div>";
      root.appendChild(art);
    });
  }

  function renderReviews(list, lang) {
    var root = document.getElementById("reviews-root");
    var wrap = document.getElementById("reviews-section");
    if (!root) return;
    root.innerHTML = "";
    if (!list || !list.length) {
      if (wrap) wrap.hidden = true;
      return;
    }
    if (wrap) wrap.hidden = false;
    list.forEach(function (r) {
      var text = lang === "en" ? (r.text_en || r.text_ru) : (r.text_ru || r.text_en);
      var el = document.createElement("blockquote");
      el.className = "review-card";
      el.innerHTML =
        '<p class="review-card__text">' +
        esc(text).replace(/\n/g, "<br>") +
        "</p>" +
        '<footer class="review-card__author">— ' +
        esc(r.author_name) +
        "</footer>";
      root.appendChild(el);
    });
  }

  function loadFeed() {
    if (!client) return Promise.resolve();
    var lang = (window.__ainaGetLang && window.__ainaGetLang()) || "ru";
    return Promise.all([
      client
        .from("articles")
        .select("id,title_ru,title_en,body_ru,body_en,image_url,sort_order")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      client
        .from("reviews")
        .select("id,author_name,text_ru,text_en,sort_order")
        .eq("published", true)
        .order("sort_order", { ascending: true })
    ]).then(function (pair) {
      var ar = pair[0];
      var rv = pair[1];
      if (ar.error) console.warn("[supabase] articles:", ar.error.message);
      if (rv.error) console.warn("[supabase] reviews:", rv.error.message);
      renderArticles(ar.data || [], lang);
      renderReviews(rv.data || [], lang);
    });
  }

  function initLeadForm() {
    var form = document.getElementById("lead-form");
    if (!form) return;
    var msg = document.getElementById("lead-form-msg");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (msg) {
        msg.textContent = "";
        msg.className = "lead-form__msg";
      }
      var fd = new FormData(form);
      var name = (fd.get("name") || "").toString().trim();
      var contact = (fd.get("contact") || "").toString().trim();
      var message = (fd.get("message") || "").toString().trim();
      if (!name || !contact) {
        if (msg) {
          msg.textContent = "Укажите имя и способ связи.";
          msg.className = "lead-form__msg lead-form__msg--err";
        }
        return;
      }
      if (!client) {
        if (msg) {
          msg.textContent =
            "Форма ещё не подключена: заполните js/supabase-config.js (см. supabase/SETUP.txt).";
          msg.className = "lead-form__msg lead-form__msg--err";
        }
        return;
      }
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      client
        .from("leads")
        .insert({ name: name, contact: contact, message: message || null, status: "new" })
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (res.error) {
            if (msg) {
              msg.textContent = "Не удалось отправить. Проверьте настройки сайта или напишите в Telegram.";
              msg.className = "lead-form__msg lead-form__msg--err";
            }
            console.warn(res.error);
            return;
          }
          form.reset();
          if (msg) {
            msg.textContent = "Спасибо! Я свяжусь с вами.";
            msg.className = "lead-form__msg lead-form__msg--ok";
          }
        });
    });
  }

  initLeadForm();
  if (client) {
    loadServiceCards().then(function () {
      return loadFeed();
    });
  }

  window.__ainaReloadPublicData = function () {
    if (!client) return Promise.resolve();
    return loadServiceCards().then(function () {
      return loadFeed();
    });
  };

  document.addEventListener("aina-lang-changed", function () {
    loadFeed();
  });
})();
