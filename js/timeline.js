(function () {
  var lock = document.querySelector("[data-year-lock]");
  var display = document.querySelector("[data-year-display]");
  var title = document.querySelector("[data-year-title]");
  var stops = Array.prototype.slice.call(document.querySelectorAll(".stop"));
  var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-rail]"));
  var motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var ticking = false;

  function indexAt(probe) {
    var index = -1;
    for (var i = 0; i < stops.length; i += 1) {
      if (stops[i].offsetTop <= probe) index = i;
    }
    return index;
  }

  function paint() {
    ticking = false;
    var probe = window.scrollY + (window.innerWidth <= 980 ? 88 : 1);
    var index = indexAt(probe);

    if (index < 0) {
      lock.classList.remove("is-on");
      lock.setAttribute("aria-hidden", "true");
      stops.forEach(function (stop) {
        stop.classList.remove("is-active");
      });
      buttons.forEach(function (button) {
        button.removeAttribute("aria-current");
      });
      return;
    }

    var current = stops[index];
    var next = stops[index + 1];
    var from = Number(current.getAttribute("data-year"));
    var shown = from;

    if (next && !motion.matches) {
      var start = current.offsetTop;
      var end = next.offsetTop;
      var span = end - start || 1;
      var t = Math.min(1, Math.max(0, (probe - start) / span));
      var to = Number(next.getAttribute("data-year"));
      shown = Math.round(from + (to - from) * t);
    }

    lock.classList.add("is-on");
    lock.setAttribute("aria-hidden", "false");
    display.textContent = String(shown);
    title.textContent = current.getAttribute("data-title");

    stops.forEach(function (stop, i) {
      stop.classList.toggle("is-active", i === index);
    });
    buttons.forEach(function (button, i) {
      if (i === index) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function requestPaint() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(paint);
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      var target = document.getElementById(button.getAttribute("data-rail"));
      if (!target) return;
      target.scrollIntoView({ behavior: motion.matches ? "auto" : "smooth" });
    });
  });

  window.addEventListener("scroll", requestPaint, { passive: true });
  window.addEventListener("resize", requestPaint);
  if (motion.addEventListener) motion.addEventListener("change", requestPaint);
  paint();
})();
