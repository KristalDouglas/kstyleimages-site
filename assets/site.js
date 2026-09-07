document.addEventListener("DOMContentLoaded", function () {
  var nav = document.querySelector(".site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");

  function onScroll() {
    if (window.scrollY > 40) nav.classList.add("solid");
    else nav.classList.remove("solid");
  }
  window.addEventListener("scroll", onScroll);
  onScroll();

  if (toggle) {
    toggle.addEventListener("click", function () {
      links.classList.toggle("mobile-open");
    });
  }

  // Portfolios dropdown: click to open/close (not hover, which was unreliable)
  var dropdown = document.querySelector(".work-dropdown");
  var trigger = document.querySelector(".dropdown-trigger");
  if (dropdown && trigger) {
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var isOpen = dropdown.classList.toggle("open");
      trigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        dropdown.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Homepage photo rotation: pick a fresh random mix from the full pool on every visit
  if (window.HOME_POOL && window.HOME_POOL.length) {
    var pool = window.HOME_POOL.slice();
    for (var i = pool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = pool[i]; pool[i] = pool[j]; pool[j] = tmp;
    }
    var count = Math.min(18, pool.length);
    var picked = pool.slice(0, count);
    var wall = document.querySelector(".wall.home");
    if (wall) {
      var html = picked.map(function (item, idx) {
        var loadAttr = idx < 6 ? "eager" : "lazy";
        return '<figure><a href="' + item.slug + '.html"><img src="' + item.src + '" alt="' + item.label + '" loading="' + loadAttr + '"><figcaption>' + item.label + '</figcaption></a></figure>';
      }).join("");
      wall.innerHTML = html;
    }
  }

  // Lightbox
  var figures = document.querySelectorAll(".wall.gallery img");
  if (figures.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.innerHTML =
      '<button class="lightbox-close" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Previous">&#8249;</button>' +
      '<img src="" alt="">' +
      '<button class="lightbox-next" aria-label="Next">&#8250;</button>';
    document.body.appendChild(lb);

    var imgEl = lb.querySelector("img");
    var current = 0;
    var srcs = Array.prototype.map.call(figures, function (im) { return im.getAttribute("src"); });

    function show(i) {
      current = (i + srcs.length) % srcs.length;
      imgEl.src = srcs[current];
    }
    function open(i) {
      show(i);
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function close() {
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }

    figures.forEach(function (im, i) {
      im.parentElement.addEventListener("click", function () { open(i); });
    });

    lb.querySelector(".lightbox-close").addEventListener("click", close);
    lb.querySelector(".lightbox-prev").addEventListener("click", function () { show(current - 1); });
    lb.querySelector(".lightbox-next").addEventListener("click", function () { show(current + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }
});
