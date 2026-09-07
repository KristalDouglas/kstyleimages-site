const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "assets", "data");

const site = JSON.parse(fs.readFileSync(path.join(DATA_DIR, "site.json")));
site.accentColor = site.accentColor || "#b08d57";
site.backgroundColor = site.backgroundColor || "#14140f";
site.textColor = site.textColor || "#ede9e0";

function lighten(hex, amt) {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}
const accentBright = lighten(site.accentColor, 30);
const SESSIONS = [
  { slug: "headshot-session", file: "headshot-session.json" },
  { slug: "studio-creative-session", file: "studio-creative-session.json" },
  { slug: "outdoor-lifestyle-session", file: "outdoor-lifestyle-session.json" },
];
const sessionData = {};
SESSIONS.forEach((s) => {
  sessionData[s.slug] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, s.file)));
});

function navHTML(activeSlug) {
  const dropdown = SESSIONS.map((s) => {
    const label = sessionData[s.slug].title;
    const cls = s.slug === activeSlug ? ' class="active"' : "";
    return `<a href="${s.slug}.html"${cls}>${label}</a>`;
  }).join("");
  return `
<nav class="site-nav">
  <a href="index.html" class="nav-mark">K Styles Images</a>
  <button class="nav-toggle" aria-label="Menu">&#9776;</button>
  <div class="nav-links">
    <div class="work-dropdown">
      <a href="index.html#work">Portfolios</a>
      <div class="work-dropdown-panel">${dropdown}</div>
    </div>
    <a href="${site.calendlyUrl}" target="_blank" rel="noopener" class="nav-book">Book a session</a>
  </div>
</nav>`;
}

function footerHTML() {
  return `
<footer>
  <div class="foot-mark">K Styles Images</div>
  <div class="foot-links">
    <a href="${site.calendlyUrl}" target="_blank" rel="noopener">Book a session</a>
    <a href="${site.instagramUrl}" target="_blank" rel="noopener">Instagram</a>
    <a href="${site.linktreeUrl}" target="_blank" rel="noopener">Linktree</a>
  </div>
  <div>&copy; 2026 K Styles Images</div>
</footer>`;
}

function pageShell(title, body, activeSlug) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="K Styles Images — portrait and fashion photography portfolio.">
<link rel="stylesheet" href="assets/style.css">
<style>:root{--accent:${site.accentColor};--accent-bright:${accentBright};--bg:${site.backgroundColor};--text:${site.textColor};}</style>
<script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
<script>if(window.netlifyIdentity){window.netlifyIdentity.on("init",function(user){if(!user){window.netlifyIdentity.on("login",function(){document.location.href="/admin/";});}});}</script>
</head>
<body>
${navHTML(activeSlug)}
${body}
${footerHTML()}
<script src="assets/site.js"></script>
</body>
</html>
`;
}

function figuresHTML(imgs, label) {
  return imgs
    .map((src, i) => `<figure><img src="${src}" alt="${label} photo ${i + 1}" loading="lazy"></figure>`)
    .join("");
}

// ---------- Home page ----------
let homeFigs = "";
SESSIONS.forEach((s) => {
  const data = sessionData[s.slug];
  const label = data.title;
  const imgs = data.images || [];
  const step = Math.max(1, Math.ceil(imgs.length / 6));
  const sample = imgs.length <= 6 ? imgs : imgs.filter((_, idx) => idx % step === 0).slice(0, 6);
  sample.forEach((src) => {
    homeFigs += `<figure><a href="${s.slug}.html"><img src="${src}" alt="${label}" loading="lazy"><figcaption>${label}</figcaption></a></figure>`;
  });
});

const homeBody = `
<section class="hero">
  <img src="${site.heroImage}" alt="K Styles Images featured portrait">
  <div class="hero-content">
    <h1>K Styles Images</h1>
    <p>${site.tagline}</p>
    <div class="hero-actions">
      <a href="${site.calendlyUrl}" target="_blank" rel="noopener" class="btn">Book a session</a>
    </div>
  </div>
</section>
<section id="work" class="wall home">
${homeFigs}
</section>`;

fs.writeFileSync(path.join(ROOT, "index.html"), pageShell("K Styles Images — Portrait & Fashion Photography", homeBody));

// ---------- Category pages ----------
SESSIONS.forEach((s) => {
  const data = sessionData[s.slug];
  const mainImgs = data.images || [];
  const productImgs = data.productImages || [];
  const total = mainImgs.length + productImgs.length;

  let body = `
<header class="cat-bar">
  <a class="back-link" href="index.html#work">&#8592; All work</a>
  <h1>${data.title}</h1>
  <span class="count">${total} images</span>
  <div class="pkg">${data.price} — ${data.description}</div>
</header>
<section class="wall gallery">${figuresHTML(mainImgs, data.title)}</section>`;

  if (productImgs.length) {
    body += `
<div class="section-divider"><span>Product Photography</span></div>
<section class="wall gallery">${figuresHTML(productImgs, "Product Photography")}</section>`;
  }

  fs.writeFileSync(path.join(ROOT, `${s.slug}.html`), pageShell(`${data.title} — K Styles Images`, body, s.slug));
});

console.log("Site built:", ["index.html", ...SESSIONS.map((s) => s.slug + ".html")].join(", "));
