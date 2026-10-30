// Shared behaviour for every page of the site.
document.documentElement.classList.add("js");

// Show clean addresses: "/#contact" instead of "/index.html#contact".
// Only on a real web server; file:// pages can't change their path.
if (/^https?:$/.test(location.protocol) && /\/index\.html$/.test(location.pathname) && history.replaceState) {
  history.replaceState(null, "", location.pathname.replace(/index\.html$/, "") + location.search + location.hash);
}

document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu
  const menuBtn = document.getElementById("menuButton");
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      const open = document.body.classList.toggle("nav-open");
      menuBtn.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll(".mobile-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        menuBtn.setAttribute("aria-expanded", false);
      });
    });
  }

  // Header shadow once the page scrolls
  const header = document.querySelector(".site-header");
  const onScroll = function () {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Footer year
  document.querySelectorAll(".current-year").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Reveal sections as they scroll into view
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -60px 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Fonts and images can shift the layout after the browser jumps to a
  // #section link, so jump again once everything has loaded.
  window.addEventListener("load", function () {
    let target = location.hash && document.getElementById(location.hash.slice(1));
    if (target && target.classList.contains("year-panel")) target = target.closest(".results-viewer");
    if (target) target.scrollIntoView();
    // Smooth scrolling only after the first jump, so it can't overshoot
    document.documentElement.classList.add("smooth");
  });

  initScrollSpy();
  initResultsTable();
  initSummary();
  initResultsViewer();
  initPlayer();
});

// Highlight the navbar link of the section currently on screen
function initScrollSpy() {
  const sections = document.querySelectorAll("[data-nav]");
  const links = document.querySelectorAll("[data-nav-link]");
  if (!sections.length || !("IntersectionObserver" in window)) return;

  const setActive = function (key) {
    links.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("data-nav-link") === key);
    });
  };
  const spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) setActive(entry.target.getAttribute("data-nav"));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(function (section) { spy.observe(section); });
}

// Results tables: show grades as soft marks and add labels so the table
// can collapse into cards on phones.
function initResultsTable() {
  document.querySelectorAll(".results-table").forEach(function (table) {
    const labels = Array.from(table.querySelectorAll("thead th")).map(function (th) {
      return th.textContent.trim();
    });
    const rows = table.querySelectorAll("tbody tr");
    const aggs = Array.from(rows).map(function (tr) {
      return parseInt(tr.cells[tr.cells.length - 1].textContent, 10);
    });
    const best = Math.min.apply(null, aggs);

    rows.forEach(function (tr) {
      Array.from(tr.cells).forEach(function (td, i) {
        td.setAttribute("data-label", labels[i] || "");
        const value = td.textContent.trim();
        if (i >= 2 && i < tr.cells.length - 1) {
          td.innerHTML = '<span class="g g' + value + '">' + value + "</span>";
        } else if (i === tr.cells.length - 1) {
          td.innerHTML = '<span class="agg' + (parseInt(value, 10) === best ? " top" : "") + '">' + value + "</span>";
        }
      });
    });
  });
}

// Results: draw each year's division distribution bar from its stat cards.
function initSummary() {
  const colors = { 1: "#16a34a", 2: "#5cab8f", 3: "#f97316", 4: "#d2691e", u: "#dc2626", x: "#9ca3af" };

  document.querySelectorAll(".summary-card").forEach(function (card) {
    const bar = card.querySelector(".dist-bar");
    const legend = card.querySelector(".dist-legend");
    const totalEl = card.querySelector('[data-key="total"] strong');
    const total = totalEl ? parseInt(totalEl.textContent, 10) : 0;
    if (!bar || !total) return;

    card.querySelectorAll(".stat").forEach(function (stat) {
      const key = stat.getAttribute("data-key");
      const count = parseInt(stat.querySelector("strong").textContent, 10);
      if (key === "total" || !count) return;
      const label = stat.querySelector("span").textContent;
      const pct = (count / total) * 100;
      const seg = document.createElement("span");
      seg.style.width = pct + "%";
      seg.style.background = colors[key];
      seg.title = label + ": " + count;
      bar.appendChild(seg);
      if (legend) {
        const item = document.createElement("span");
        item.innerHTML = '<i style="background:' + colors[key] + '"></i>' + label + " — " + Math.round(pct) + "%";
        legend.appendChild(item);
      }
    });
  });
}

// Results: clicking a year opens its results right below the year cards.
function initResultsViewer() {
  const viewer = document.querySelector(".results-viewer");
  if (!viewer) return;
  const panels = viewer.querySelectorAll(".year-panel");
  const cards = document.querySelectorAll(".year-card");
  const pills = viewer.querySelectorAll(".year-switch button");
  const title = viewer.querySelector(".viewer-title");
  let current = null;

  const open = function (year, scroll) {
    const panel = document.getElementById("year-" + year);
    if (!panel) return;
    current = year;
    viewer.hidden = false;
    panels.forEach(function (p) { p.hidden = p !== panel; });
    cards.forEach(function (c) { c.setAttribute("aria-expanded", c.dataset.year === year); });
    pills.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.year === year); });
    title.textContent = year + " PLE Best Pupils";
    if (history.replaceState) history.replaceState(null, "", "#year-" + year);
    if (scroll) viewer.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const close = function () {
    viewer.hidden = true;
    current = null;
    cards.forEach(function (c) { c.setAttribute("aria-expanded", false); });
    if (history.replaceState) history.replaceState(null, "", "#results");
    document.getElementById("results").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      if (current === card.dataset.year) close();
      else open(card.dataset.year, true);
    });
  });
  viewer.querySelectorAll("[data-year]").forEach(function (btn) {
    if (btn.classList.contains("year-panel")) return;
    btn.addEventListener("click", function () { open(btn.dataset.year, true); });
  });
  viewer.querySelector(".viewer-close").addEventListener("click", close);

  // Links like index.html#year-2025 (the old results pages) open that year
  const fromHash = function () {
    const match = location.hash.match(/^#year-(\d{4})$/);
    if (match) open(match[1], true);
  };
  window.addEventListener("hashchange", fromHash);
  fromHash();
}

// Choir songs player
function initPlayer() {
  const player = document.querySelector("[data-player]");
  if (!player) return;

  const audio = new Audio();
  audio.preload = "metadata";
  const tracks = Array.from(player.querySelectorAll(".track"));
  const title = player.querySelector(".np-title");
  const seek = player.querySelector(".seek");
  const cur = player.querySelector(".t-cur");
  const dur = player.querySelector(".t-dur");
  const download = player.querySelector(".np-download a");
  let index = 0;

  const fmt = function (s) {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return m + ":" + (sec < 10 ? "0" : "") + sec;
  };

  const load = function (i) {
    index = (i + tracks.length) % tracks.length;
    const t = tracks[index];
    tracks.forEach(function (x) { x.classList.toggle("active", x === t); });
    audio.src = t.dataset.src;
    title.textContent = t.dataset.title;
    download.href = t.dataset.src;
    download.setAttribute("download", "");
    seek.value = 0;
    seek.style.setProperty("--p", "0%");
    cur.textContent = "0:00";
  };

  const play = function () { audio.play(); };
  const toggle = function () { audio.paused ? play() : audio.pause(); };

  tracks.forEach(function (t, i) {
    t.querySelector(".track-btn").addEventListener("click", function () {
      if (i === index && audio.src) { toggle(); return; }
      load(i);
      play();
    });

    // Show each song's length in the playlist
    const probe = new Audio();
    probe.preload = "metadata";
    probe.src = t.dataset.src;
    probe.addEventListener("loadedmetadata", function () {
      t.querySelector(".track-time").textContent = fmt(probe.duration);
    });
  });

  player.querySelector(".ctrl-play").addEventListener("click", toggle);
  player.querySelector(".ctrl-prev").addEventListener("click", function () { load(index - 1); play(); });
  player.querySelector(".ctrl-next").addEventListener("click", function () { load(index + 1); play(); });

  audio.addEventListener("play", function () { player.classList.add("is-playing"); });
  audio.addEventListener("pause", function () { player.classList.remove("is-playing"); });
  audio.addEventListener("ended", function () { load(index + 1); play(); });
  audio.addEventListener("loadedmetadata", function () { dur.textContent = fmt(audio.duration); });
  audio.addEventListener("timeupdate", function () {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seek.value = pct;
    seek.style.setProperty("--p", pct + "%");
    cur.textContent = fmt(audio.currentTime);
  });
  seek.addEventListener("input", function () {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  });

  load(0);
}
