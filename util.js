export function qs(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

export function getParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

export function setThemeVars(theme) {
  const root = document.documentElement;
  for (const k of ["bg", "panel", "border", "accent", "text", "font"]) {
    const v = theme?.[k];
    if (typeof v === "string" && v.trim()) root.style.setProperty(`--${k}`, v.trim());
  }
}

export function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}