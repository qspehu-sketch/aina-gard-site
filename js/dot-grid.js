/**
 * DotGrid — порт с React Bits (vanilla + GSAP core).
 * InertiaPlugin в бесплатном CDN нет: импульс = короткий power3 + elastic возврат.
 * resistance из оригинала влияет на «жёсткость» короткой фазы (duration).
 */
(function () {
  "use strict";

  var root = document.getElementById("dot-grid-root");
  if (!root) return;

  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.style.display = "none";
      return;
    }
  } catch (e0) {}

  var opts = {
    dotSize: 9,
    gap: 22,
    baseColor: "#2a4a6e",
    activeColor: "#6ec8ff",
    proximity: 120,
    speedTrigger: 100,
    shockRadius: 250,
    shockStrength: 0.12,
    maxSpeed: 5000,
    resistance: 750,
    returnDuration: 1.35
  };

  var pushDuration = Math.max(0.12, 0.35 - opts.resistance / 8000);

  var wrap = document.createElement("div");
  wrap.className = "dot-grid";
  var inner = document.createElement("div");
  inner.className = "dot-grid__wrap";
  var canvas = document.createElement("canvas");
  canvas.className = "dot-grid__canvas";
  canvas.setAttribute("aria-hidden", "true");
  inner.appendChild(canvas);
  wrap.appendChild(inner);
  root.appendChild(wrap);

  var ctx = null;
  var dpr = 1;
  var logicalW = 0;
  var logicalH = 0;
  var dots = [];
  var circlePath = null;
  var rafId = 0;
  var running = true;

  var pointer = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
    _inertiaInit: false
  };

  function throttle(fn, ms) {
    var last = 0;
    return function () {
      var now = performance.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(null, arguments);
      }
    };
  }

  function hexToRgb(hex) {
    var h = (hex || "").replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    var m = h.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
    if (!m) return { r: 80, g: 120, b: 180 };
    return {
      r: parseInt(m[1], 16),
      g: parseInt(m[2], 16),
      b: parseInt(m[3], 16)
    };
  }

  var baseRgb = hexToRgb(opts.baseColor);
  var activeRgb = hexToRgb(opts.activeColor);

  function hasGsap() {
    return typeof window.gsap !== "undefined" && window.gsap.to;
  }

  function settleDot(dot, fromHover) {
    dot._busy = false;
    if (fromHover) dot._inertiaApplied = false;
  }

  function impulseDot(dot, pushX, pushY, fromHover) {
    if (dot._busy) return;
    dot._busy = true;
    if (hasGsap()) {
      window.gsap.killTweensOf(dot);
      window.gsap.fromTo(
        dot,
        { xOffset: dot.xOffset, yOffset: dot.yOffset },
        {
          xOffset: dot.xOffset + pushX,
          yOffset: dot.yOffset + pushY,
          duration: pushDuration,
          ease: "power3.out",
          onComplete: function () {
            window.gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: opts.returnDuration,
              ease: "elastic.out(1,0.75)",
              onComplete: function () {
                settleDot(dot, fromHover);
              }
            });
          }
        }
      );
    } else {
      dot.xOffset += pushX * 0.25;
      dot.yOffset += pushY * 0.25;
      window.setTimeout(function () {
        dot.xOffset = 0;
        dot.yOffset = 0;
        settleDot(dot, fromHover);
      }, Math.round(opts.returnDuration * 1000) + 120);
    }
  }

  function buildGrid() {
    var rect = inner.getBoundingClientRect();
    logicalW = Math.max(1, Math.floor(rect.width));
    logicalH = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = logicalW * dpr;
    canvas.height = logicalH * dpr;
    canvas.style.width = logicalW + "px";
    canvas.style.height = logicalH + "px";
    ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var dotSize = logicalW < 640 ? 8 : opts.dotSize;
    var gap = logicalW < 640 ? 20 : opts.gap;
    var cell = dotSize + gap;
    var cols = Math.floor((logicalW + gap) / cell);
    var rows = Math.floor((logicalH + gap) / cell);
    var gridW = cell * cols - gap;
    var gridH = cell * rows - gap;
    var extraX = logicalW - gridW;
    var extraY = logicalH - gridH;
    var startX = extraX / 2 + dotSize / 2;
    var startY = extraY / 2 + dotSize / 2;

    dots = [];
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        dots.push({
          cx: startX + x * cell,
          cy: startY + y * cell,
          xOffset: 0,
          yOffset: 0,
          _busy: false,
          _inertiaApplied: false
        });
      }
    }

    if (typeof Path2D !== "undefined") {
      circlePath = new Path2D();
      circlePath.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    } else {
      circlePath = null;
    }
  }

  function drawFrame() {
    if (!ctx || !circlePath) {
      if (running) rafId = requestAnimationFrame(drawFrame);
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, logicalW, logicalH);

    var px = pointer.x;
    var py = pointer.y;
    var proxSq = opts.proximity * opts.proximity;
    var dotSize = logicalW < 640 ? 8 : opts.dotSize;

    for (var i = 0; i < dots.length; i++) {
      var dot = dots[i];
      var ox = dot.cx + dot.xOffset;
      var oy = dot.cy + dot.yOffset;
      var dx = dot.cx - px;
      var dy = dot.cy - py;
      var dsq = dx * dx + dy * dy;
      var style = opts.baseColor;
      if (dsq <= proxSq) {
        var dist = Math.sqrt(dsq);
        var t = 1 - dist / opts.proximity;
        var r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
        var g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
        var b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
        style = "rgb(" + r + "," + g + "," + b + ")";
      }
      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = style;
      if (circlePath) ctx.fill(circlePath);
      else {
        ctx.beginPath();
        ctx.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (running) rafId = requestAnimationFrame(drawFrame);
  }

  /* Координаты для подсветки рядом с курсором — каждый кадр; инерция точек — реже */
  function onPointerCoords(e) {
    var rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
    if (!pointer._inertiaInit) {
      pointer._inertiaInit = true;
      pointer.lastX = e.clientX;
      pointer.lastY = e.clientY;
      pointer.lastTime = performance.now();
    }
  }

  function onMoveInertia(e) {
    var now = performance.now();
    var pr = pointer;
    var dt = pr.lastTime ? now - pr.lastTime : 16;
    var dx = e.clientX - pr.lastX;
    var dy = e.clientY - pr.lastY;
    var vx = (dx / dt) * 1000;
    var vy = (dy / dt) * 1000;
    var speed = Math.hypot(vx, vy);
    if (speed > opts.maxSpeed) {
      var sc = opts.maxSpeed / speed;
      vx *= sc;
      vy *= sc;
      speed = opts.maxSpeed;
    }
    pr.lastTime = now;
    pr.lastX = e.clientX;
    pr.lastY = e.clientY;
    pr.vx = vx;
    pr.vy = vy;
    pr.speed = speed;

    if (speed <= opts.speedTrigger) return;

    for (var j = 0; j < dots.length; j++) {
      var dot = dots[j];
      if (dot._busy || dot._inertiaApplied) continue;
      var dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
      if (dist < opts.proximity) {
        dot._inertiaApplied = true;
        var pushX = dot.cx - pr.x + vx * 0.00035;
        var pushY = dot.cy - pr.y + vy * 0.00035;
        impulseDot(dot, pushX, pushY, true);
      }
    }
  }

  function onClick(e) {
    var rect = canvas.getBoundingClientRect();
    var cx = e.clientX - rect.left;
    var cy = e.clientY - rect.top;
    for (var k = 0; k < dots.length; k++) {
      var dot = dots[k];
      if (dot._busy) continue;
      var dist = Math.hypot(dot.cx - cx, dot.cy - cy);
      if (dist < opts.shockRadius) {
        var falloff = Math.max(0, 1 - dist / opts.shockRadius);
        var pushX = (dot.cx - cx) * opts.shockStrength * falloff * 18;
        var pushY = (dot.cy - cy) * opts.shockStrength * falloff * 18;
        impulseDot(dot, pushX, pushY, false);
      }
    }
  }

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e1) {}

  function start() {
    buildGrid();
    running = !reduce;
    rafId = requestAnimationFrame(drawFrame);

    var ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(buildGrid) : null;
    if (ro) ro.observe(inner);
    else window.addEventListener("resize", buildGrid, { passive: true });

    if (!reduce) {
      window.addEventListener("mousemove", onPointerCoords, { passive: true });
      window.addEventListener("mousemove", throttle(onMoveInertia, 48), { passive: true });
      window.addEventListener("click", onClick);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  window.addEventListener(
    "pagehide",
    function () {
      running = false;
      cancelAnimationFrame(rafId);
    },
    { once: true }
  );
})();
