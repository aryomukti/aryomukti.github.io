(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  var bar = document.getElementById("bar");
  var numbers = document.querySelectorAll("[data-rot]");
  var mega = document.getElementById("mega");

  function paint() {
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? window.scrollY / max : 0;
      bar.style.width = (ratio * 100).toFixed(2) + "%";
    }

    if (!reduce && numbers.length) {
      var vh = window.innerHeight;
      numbers.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var offset = (rect.top + rect.height / 2 - vh / 2) / vh;
        var deg = -6 + offset * 9;
        el.style.setProperty("--rot", deg.toFixed(2) + "deg");
      });
    }

    if (!reduce && mega) {
      var y = Math.min(window.scrollY, window.innerHeight);
      mega.style.transform = "translateY(" + (y * 0.1).toFixed(1) + "px)";
      mega.style.opacity = Math.max(0.2, 1 - y / (window.innerHeight * 1.1)).toFixed(2);
    }
  }

  var queued = false;
  function onScroll() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      paint();
      queued = false;
    });
  }

  paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  var items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }
})();
