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
  { slug: "event-session", file: "event-session.json" },
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
