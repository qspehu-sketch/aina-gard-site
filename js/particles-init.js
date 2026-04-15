(function () {
  function startParticles() {
    if (typeof window.particlesJS !== "function") {
      setTimeout(startParticles, 100);
      return;
    }

    window.particlesJS("particles-js", {
      particles: {
        number: { value: 90, density: { enable: true, value_area: 800 } },
        color: { value: "#a855f7" },
        shape: { type: "circle", stroke: { width: 0.3, color: "#6d28d9" } },
        opacity: {
          value: 0.5,
          random: true,
          anim: { enable: true, speed: 0.6, opacity_min: 0.1 }
        },
        size: {
          value: 2.5,
          random: true,
          anim: { enable: true, speed: 1, size_min: 0.5 }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#7c3aed",
          opacity: 0.15,
          width: 0.8
        },
        move: {
          enable: true,
          speed: 0.8,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "bounce",
          bounce: false
        }
      },
      interactivity: {
        detect_on: "window",
        events: {
          onhover: { enable: true, mode: "grab" },
          onclick: { enable: false },
          resize: true
        },
        modes: {
          grab: { distance: 160, line_linked: { opacity: 0.35 } }
        }
      },
      retina_detect: true
    });
  }

  if (document.readyState === "complete") {
    startParticles();
  } else {
    window.addEventListener("load", startParticles);
  }
})();
