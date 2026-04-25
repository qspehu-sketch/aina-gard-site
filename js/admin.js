(function () {
  "use strict";

  var loginPanel = document.getElementById("login-panel");
  var adminApp = document.getElementById("admin-app");
  var loginForm = document.getElementById("login-form");
  var loginMsg = document.getElementById("login-msg");
  var headActions = document.getElementById("head-actions");

  var LEAD_STATUS = [
    { v: "new", l: "Новая" },
    { v: "in_progress", l: "В работе" },
    { v: "done", l: "Выполнена" },
    { v: "archived", l: "В архиве" }
  ];

  function setMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text || "";
    el.className = "admin-msg" + (kind ? " admin-msg--" + kind : "");
  }

  function rndPathSuffix() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return String(Date.now()) + "-" + Math.random().toString(36).slice(2, 10);
  }

  if (!String(window.SUPABASE_URL || "").trim() || !String(window.SUPABASE_ANON_KEY || "").trim()) {
    setMsg(loginMsg, "Укажите SUPABASE_URL и SUPABASE_ANON_KEY в файле js/supabase-config.js.", "err");
    if (loginForm) loginForm.style.display = "none";
    return;
  }

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    setMsg(loginMsg, "Не загрузилась библиотека Supabase. Проверьте сеть и обновите страницу.", "err");
    if (loginForm) loginForm.style.display = "none";
    return;
  }

  const { createClient } = window.supabase;
  const db = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  function mountLogout() {
    if (!headActions) return;
    headActions.innerHTML = "";
    var a = document.createElement("a");
    a.href = "/";
    a.className = "btn-ghost";
    a.textContent = "На сайт";
    var b = document.createElement("button");
    b.type = "button";
    b.className = "btn-ghost";
    b.textContent = "Выйти";
    b.addEventListener("click", function () {
      db.auth.signOut();
    });
    headActions.appendChild(a);
    headActions.appendChild(b);
  }

  function initTabs() {
    var tabs = document.querySelectorAll(".admin-tab");
    var panels = document.querySelectorAll(".admin-panel");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var name = tab.getAttribute("data-tab");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });
        panels.forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
        });
      });
    });
  }

  function statusLabel(val) {
    for (var i = 0; i < LEAD_STATUS.length; i++) {
      if (LEAD_STATUS[i].v === val) return LEAD_STATUS[i].l;
    }
    return val;
  }

  function loadLeads() {
    var tbody = document.getElementById("leads-body");
    var msg = document.getElementById("leads-msg");
    if (!tbody) return;
    setMsg(msg, "Загрузка…");
    db
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(function (res) {
        if (res.error) {
          setMsg(msg, res.error.message, "err");
          return;
        }
        setMsg(msg, "");
        tbody.innerHTML = "";
        (res.data || []).forEach(function (row) {
          var tr = document.createElement("tr");
          var dt = row.created_at ? new Date(row.created_at).toLocaleString("ru-RU") : "";
          var opts = LEAD_STATUS.map(function (s) {
            return (
              '<option value="' +
              s.v +
              '"' +
              (row.status === s.v ? " selected" : "") +
              ">" +
              s.l +
              "</option>"
            );
          }).join("");
          tr.innerHTML =
            "<td>" +
            dt +
            "</td><td>" +
            esc(row.name) +
            "</td><td>" +
            esc(row.contact) +
            '</td><td class="cell-msg">' +
            esc(row.message || "") +
            '</td><td><select data-lead-id="' +
            row.id +
            '" class="lead-status">' +
            opts +
            "</select></td>";
          tbody.appendChild(tr);
        });
        tbody.querySelectorAll(".lead-status").forEach(function (sel) {
          sel.addEventListener("change", function () {
            var id = sel.getAttribute("data-lead-id");
            db
              .from("leads")
              .update({ status: sel.value })
              .eq("id", id)
              .then(function (r2) {
                if (r2.error) alert(r2.error.message);
              });
          });
        });
      });
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function defaultCardData() {
    return {
      ru: { title: "", back_title: "", price: "", tags: ["", "", "", ""] },
      en: { title: "", back_title: "", price: "", tags: ["", "", "", ""] }
    };
  }

  function mergeData(raw) {
    var d = defaultCardData();
    if (!raw || typeof raw !== "object") return d;
    ["ru", "en"].forEach(function (lang) {
      if (!raw[lang]) return;
      var x = raw[lang];
      if (x.title) d[lang].title = x.title;
      if (x.back_title) d[lang].back_title = x.back_title;
      if (x.price) d[lang].price = x.price;
      if (x.tags && x.tags.length) {
        for (var i = 0; i < 4; i++) d[lang].tags[i] = x.tags[i] || "";
      }
    });
    return d;
  }

  function loadCards() {
    var mount = document.getElementById("cards-mount");
    var msg = document.getElementById("cards-msg");
    if (!mount) return;
    setMsg(msg, "Загрузка…");
    db
      .from("service_cards")
      .select("slot,data")
      .order("slot", { ascending: true })
      .then(function (res) {
        if (res.error) {
          setMsg(msg, res.error.message, "err");
          return;
        }
        setMsg(msg, "");
        var bySlot = {};
        (res.data || []).forEach(function (r) {
          bySlot[r.slot] = mergeData(r.data);
        });
        mount.innerHTML = "";
        for (var slot = 1; slot <= 4; slot++) {
          var data = bySlot[slot] || defaultCardData();
          var block = document.createElement("div");
          block.className = "card-block";
          block.innerHTML =
            "<h3>Карточка " +
            slot +
            '</h3><div class="grid-2">' +
            cardLangFields(slot, "ru", data.ru) +
            cardLangFields(slot, "en", data.en) +
            '</div><button type="button" class="btn-primary" data-save-slot="' +
            slot +
            '">Сохранить карточку ' +
            slot +
            "</button>";
          mount.appendChild(block);
        }
        mount.querySelectorAll("[data-save-slot]").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var slot = parseInt(btn.getAttribute("data-save-slot"), 10);
            var root = btn.closest(".card-block");
            var data = readCardBlock(root, slot);
            setMsg(msg, "Сохранение…");
            db
              .from("service_cards")
              .upsert(
                { slot: slot, data: data, updated_at: new Date().toISOString() },
                { onConflict: "slot" }
              )
              .then(function (r2) {
                if (r2.error) setMsg(msg, r2.error.message, "err");
                else setMsg(msg, "Карточка " + slot + " сохранена.", "ok");
              });
          });
        });
      });
  }

  function cardLangFields(slot, lang, pack) {
    var p = lang.toUpperCase();
    var tags = pack.tags || ["", "", "", ""];
    var t = "";
    for (var i = 0; i < 4; i++) {
      t +=
        "<label>Тег " +
        (i + 1) +
        '<input type="text" data-slot="' +
        slot +
        '" data-lang="' +
        lang +
        '" data-field="tag' +
        i +
        '" value="' +
        escAttr(tags[i]) +
        '" /></label>';
    }
    return (
      '<div class="card-lang"><span class="lang-tag">' +
      p +
      '</span><label>Заголовок (лицевая)<input type="text" data-slot="' +
      slot +
      '" data-lang="' +
      lang +
      '" data-field="title" value="' +
      escAttr(pack.title) +
      '" /></label><label>Заголовок (оборот)<input type="text" data-slot="' +
      slot +
      '" data-lang="' +
      lang +
      '" data-field="back_title" value="' +
      escAttr(pack.back_title) +
      '" /></label><label>Цена<input type="text" data-slot="' +
      slot +
      '" data-lang="' +
      lang +
      '" data-field="price" value="' +
      escAttr(pack.price) +
      '" /></label>' +
      t +
      "</div>"
    );
  }

  function escAttr(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function readCardBlock(root, slot) {
    var out = { ru: { title: "", back_title: "", price: "", tags: ["", "", "", ""] }, en: { title: "", back_title: "", price: "", tags: ["", "", "", ""] } };
    root.querySelectorAll("input[data-slot]").forEach(function (inp) {
      var lang = inp.getAttribute("data-lang");
      var field = inp.getAttribute("data-field");
      var v = inp.value.trim();
      if (!out[lang]) return;
      if (field === "title") out[lang].title = v;
      else if (field === "back_title") out[lang].back_title = v;
      else if (field === "price") out[lang].price = v;
      else if (field && field.indexOf("tag") === 0) {
        var idx = parseInt(field.replace("tag", ""), 10);
        if (!isNaN(idx) && idx >= 0 && idx < 4) out[lang].tags[idx] = v;
      }
    });
    return out;
  }

  function loadArticles() {
    var list = document.getElementById("articles-list");
    var msg = document.getElementById("articles-msg");
    if (!list) return;
    setMsg(msg, "Загрузка…");
    db
      .from("articles")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error) {
          setMsg(msg, res.error.message, "err");
          return;
        }
        setMsg(msg, "");
        list.innerHTML = "";
        (res.data || []).forEach(function (a) {
          var item = document.createElement("div");
          item.className = "admin-list-item";
          item.innerHTML =
            "<div><strong>" +
            esc(a.title_ru || a.title_en || "Без заголовка") +
            '</strong><span class="meta">' +
            (a.published ? "опубликовано" : "черновик") +
            " · sort " +
            a.sort_order +
            "</span></div>" +
            '<div class="actions"><button type="button" class="btn-ghost" data-edit-article="' +
            a.id +
            '">Править</button><button type="button" class="btn-ghost" data-del-article="' +
            a.id +
            '">Удалить</button></div>';
          list.appendChild(item);
        });
        list.querySelectorAll("[data-edit-article]").forEach(function (b) {
          b.addEventListener("click", function () {
            openArticleEditor(b.getAttribute("data-edit-article"));
          });
        });
        list.querySelectorAll("[data-del-article]").forEach(function (b) {
          b.addEventListener("click", function () {
            var id = b.getAttribute("data-del-article");
            if (!confirm("Удалить статью?")) return;
            db
              .from("articles")
              .delete()
              .eq("id", id)
              .then(function (r2) {
                if (r2.error) alert(r2.error.message);
                else loadArticles();
              });
          });
        });
      });
  }

  function openArticleEditor(id) {
    var ed = document.getElementById("article-editor");
    var msg = document.getElementById("articles-msg");
    if (!ed) return;
    ed.hidden = false;
    if (!id) {
      ed.innerHTML = articleFormHtml({
        title_ru: "",
        title_en: "",
        body_ru: "",
        body_en: "",
        image_url: "",
        published: true,
        sort_order: 0
      });
      fillArticleBodies(ed, { body_ru: "", body_en: "" });
      bindArticleForm(ed, null);
      setMsg(msg, "");
      return;
    }
    setMsg(msg, "Загрузка…");
    db
      .from("articles")
      .select("*")
      .eq("id", id)
      .single()
      .then(function (res) {
        if (res.error) {
          setMsg(msg, res.error.message, "err");
          return;
        }
        setMsg(msg, "");
        ed.innerHTML = articleFormHtml(res.data);
        fillArticleBodies(ed, res.data);
        bindArticleForm(ed, id);
      });
  }

  function articleFormHtml(a) {
    return (
      '<label>Заголовок RU<input type="text" name="title_ru" value="' +
      escAttr(a.title_ru) +
      '" /></label>' +
      '<label>Заголовок EN<input type="text" name="title_en" value="' +
      escAttr(a.title_en) +
      '" /></label>' +
      '<label>Текст RU<textarea name="body_ru"></textarea></label>' +
      '<label>Текст EN<textarea name="body_en"></textarea></label>' +
      '<label>URL картинки (или загрузите файл ниже)<input type="text" name="image_url" value="' +
      escAttr(a.image_url || "") +
      '" /></label>' +
      '<label>Файл картинки (jpg/png/webp)<input type="file" name="image_file" accept="image/*" /></label>' +
      '<label>Порядок (число)<input type="number" name="sort_order" value="' +
      Number(a.sort_order || 0) +
      '" /></label>' +
      '<label><input type="checkbox" name="published" value="1"' +
      (a.published ? " checked" : "") +
      " /> Опубликовано</label>" +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn-primary" id="article-save">Сохранить</button><button type="button" class="btn-ghost" id="article-cancel">Отмена</button></div>'
    );
  }

  function fillArticleBodies(ed, a) {
    if (!ed || !a) return;
    var t1 = ed.querySelector("textarea[name=\"body_ru\"]");
    var t2 = ed.querySelector("textarea[name=\"body_en\"]");
    if (t1) t1.value = a.body_ru || "";
    if (t2) t2.value = a.body_en || "";
  }

  function bindArticleForm(ed, id) {
    var save = ed.querySelector("#article-save");
    var cancel = ed.querySelector("#article-cancel");
    if (cancel)
      cancel.addEventListener("click", function () {
        ed.hidden = true;
        ed.innerHTML = "";
      });
    if (save)
      save.addEventListener("click", function () {
        var fd = new FormData();
        ed.querySelectorAll("input[name],textarea[name]").forEach(function (inp) {
          if (inp.type === "checkbox") fd.set(inp.name, inp.checked ? "1" : "");
          else fd.set(inp.name, inp.value);
        });
        var fileInp = ed.querySelector('input[name="image_file"]');
        var file = fileInp && fileInp.files && fileInp.files[0];
        var payload = {
          title_ru: (fd.get("title_ru") || "").toString(),
          title_en: (fd.get("title_en") || "").toString(),
          body_ru: (fd.get("body_ru") || "").toString(),
          body_en: (fd.get("body_en") || "").toString(),
          image_url: (fd.get("image_url") || "").toString().trim() || null,
          published: fd.get("published") === "1",
          sort_order: parseInt((fd.get("sort_order") || "0").toString(), 10) || 0
        };

        function afterUrl(urlFinal) {
          if (urlFinal) payload.image_url = urlFinal;
          var msg = document.getElementById("articles-msg");
          if (id) {
            db
              .from("articles")
              .update(payload)
              .eq("id", id)
              .then(function (r2) {
                if (r2.error) setMsg(msg, r2.error.message, "err");
                else {
                  setMsg(msg, "Сохранено.", "ok");
                  ed.hidden = true;
                  ed.innerHTML = "";
                  loadArticles();
                }
              });
          } else {
            db
              .from("articles")
              .insert(payload)
              .then(function (r2) {
                if (r2.error) setMsg(msg, r2.error.message, "err");
                else {
                  setMsg(msg, "Создано.", "ok");
                  ed.hidden = true;
                  ed.innerHTML = "";
                  loadArticles();
                }
              });
          }
        }

        if (file) {
          var ext = (file.name.split(".").pop() || "jpg").toLowerCase();
          if (ext.length > 5) ext = "jpg";
          var path = "articles/" + rndPathSuffix() + "." + ext;
          db.storage
            .from("site-uploads")
            .upload(path, file, { upsert: true })
            .then(function (up) {
              if (up.error) {
                setMsg(document.getElementById("articles-msg"), up.error.message, "err");
                return;
              }
              var pub = db.storage.from("site-uploads").getPublicUrl(path);
              afterUrl(pub.data.publicUrl);
            });
        } else {
          afterUrl(null);
        }
      });
  }

  function loadReviews() {
    var list = document.getElementById("reviews-list");
    var msg = document.getElementById("reviews-msg");
    if (!list) return;
    setMsg(msg, "Загрузка…");
    db
      .from("reviews")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(function (res) {
        if (res.error) {
          setMsg(msg, res.error.message, "err");
          return;
        }
        setMsg(msg, "");
        list.innerHTML = "";
        (res.data || []).forEach(function (r) {
          var item = document.createElement("div");
          item.className = "admin-list-item";
          item.innerHTML =
            "<div><strong>" +
            esc(r.author_name || "Без имени") +
            '</strong><span class="meta">' +
            (r.published ? "виден на сайте" : "скрыт") +
            "</span></div>" +
            '<div class="actions"><button type="button" class="btn-ghost" data-edit-review="' +
            r.id +
            '">Править</button><button type="button" class="btn-ghost" data-del-review="' +
            r.id +
            '">Удалить</button></div>';
          list.appendChild(item);
        });
        list.querySelectorAll("[data-edit-review]").forEach(function (b) {
          b.addEventListener("click", function () {
            openReviewEditor(b.getAttribute("data-edit-review"));
          });
        });
        list.querySelectorAll("[data-del-review]").forEach(function (b) {
          b.addEventListener("click", function () {
            var id = b.getAttribute("data-del-review");
            if (!confirm("Удалить отзыв?")) return;
            db
              .from("reviews")
              .delete()
              .eq("id", id)
              .then(function (r2) {
                if (r2.error) alert(r2.error.message);
                else loadReviews();
              });
          });
        });
      });
  }

  function openReviewEditor(id) {
    var ed = document.getElementById("review-editor");
    var msg = document.getElementById("reviews-msg");
    if (!ed) return;
    ed.hidden = false;
    if (!id) {
      ed.innerHTML = reviewFormHtml({
        author_name: "",
        text_ru: "",
        text_en: "",
        published: true,
        sort_order: 0
      });
      bindReviewForm(ed, null);
      setMsg(msg, "");
      return;
    }
    setMsg(msg, "Загрузка…");
    db
      .from("reviews")
      .select("*")
      .eq("id", id)
      .single()
      .then(function (res) {
        if (res.error) {
          setMsg(msg, res.error.message, "err");
          return;
        }
        setMsg(msg, "");
        ed.innerHTML = reviewFormHtml(res.data);
        bindReviewForm(ed, id);
      });
  }

  function reviewFormHtml(r) {
    return (
      '<label>Автор<input type="text" name="author_name" value="' +
      escAttr(r.author_name) +
      '" /></label>' +
      '<label>Текст RU<textarea name="text_ru">' +
      escAttr(r.text_ru) +
      "</textarea></label>" +
      '<label>Текст EN<textarea name="text_en">' +
      escAttr(r.text_en) +
      "</textarea></label>" +
      '<label>Порядок<input type="number" name="sort_order" value="' +
      Number(r.sort_order || 0) +
      '" /></label>' +
      '<label><input type="checkbox" name="published" value="1"' +
      (r.published ? " checked" : "") +
      " /> Показывать на сайте</label>" +
      '<div style="display:flex;gap:8px"><button type="button" class="btn-primary" id="review-save">Сохранить</button><button type="button" class="btn-ghost" id="review-cancel">Отмена</button></div>'
    );
  }

  function bindReviewForm(ed, id) {
    var save = ed.querySelector("#review-save");
    var cancel = ed.querySelector("#review-cancel");
    if (cancel)
      cancel.addEventListener("click", function () {
        ed.hidden = true;
        ed.innerHTML = "";
      });
    if (save)
      save.addEventListener("click", function () {
        var fd = new FormData();
        ed.querySelectorAll("input[name],textarea[name]").forEach(function (inp) {
          if (inp.type === "checkbox") fd.set(inp.name, inp.checked ? "1" : "");
          else fd.set(inp.name, inp.value);
        });
        var payload = {
          author_name: (fd.get("author_name") || "").toString(),
          text_ru: (fd.get("text_ru") || "").toString(),
          text_en: (fd.get("text_en") || "").toString(),
          published: fd.get("published") === "1",
          sort_order: parseInt((fd.get("sort_order") || "0").toString(), 10) || 0
        };
        var msg = document.getElementById("reviews-msg");
        if (id) {
          db
            .from("reviews")
            .update(payload)
            .eq("id", id)
            .then(function (r2) {
              if (r2.error) setMsg(msg, r2.error.message, "err");
              else {
                setMsg(msg, "Сохранено.", "ok");
                ed.hidden = true;
                ed.innerHTML = "";
                loadReviews();
              }
            });
        } else {
          db
            .from("reviews")
            .insert(payload)
            .then(function (r2) {
              if (r2.error) setMsg(msg, r2.error.message, "err");
              else {
                setMsg(msg, "Создано.", "ok");
                ed.hidden = true;
                ed.innerHTML = "";
                loadReviews();
              }
            });
        }
      });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var fd = new FormData(loginForm);
      var email = (fd.get("email") || "").toString().trim();
      var password = (fd.get("password") || "").toString();
      setMsg(loginMsg, "Вход…");
      db.auth
        .signInWithPassword({ email: email, password: password })
        .then(function (res) {
          if (res.error) setMsg(loginMsg, res.error.message, "err");
          else setMsg(loginMsg, "");
        });
    });
  }

  db.auth.onAuthStateChange(function (_event, session) {
    if (session) {
      if (loginPanel) loginPanel.hidden = true;
      if (adminApp) adminApp.hidden = false;
      mountLogout();
      loadLeads();
      loadCards();
      loadArticles();
      loadReviews();
    } else {
      if (loginPanel) loginPanel.hidden = false;
      if (adminApp) adminApp.hidden = true;
      if (headActions) headActions.innerHTML = "";
    }
  });

  db.auth.getSession().then(function (res) {
    if (res.data && res.data.session) {
      if (loginPanel) loginPanel.hidden = true;
      if (adminApp) adminApp.hidden = false;
      mountLogout();
      loadLeads();
      loadCards();
      loadArticles();
      loadReviews();
    }
  });

  initTabs();

  var btnNewArt = document.getElementById("btn-new-article");
  if (btnNewArt) btnNewArt.addEventListener("click", function () {
    openArticleEditor(null);
  });

  var btnNewRev = document.getElementById("btn-new-review");
  if (btnNewRev) btnNewRev.addEventListener("click", function () {
    openReviewEditor(null);
  });
})();
