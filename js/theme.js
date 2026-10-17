/* Theme toggle: remembers light/dark, follows the system until the reader chooses. */
(function () {
  var root = document.documentElement;
  var key = "hha-theme";
  var media = window.matchMedia("(prefers-color-scheme: dark)");
  var button = document.querySelector("[data-theme-toggle]");

  function stored() {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function current() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return media.matches ? "dark" : "light";
  }

  function label() {
    if (!button) return;
    var dark = current() === "dark";
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    button.textContent = dark ? "\u2600" : "\u263D";
  }

  /* Applied before first paint by the inline snippet in each page head. */
  function sync() {
    root.setAttribute("data-theme", current());
    label();
  }

  sync();

  if (media.addEventListener) {
    media.addEventListener("change", function () {
      if (!stored()) sync();
    });
  } else if (media.addListener) {
    media.addListener(function () {
      if (!stored()) sync();
    });
  }

  if (!button) return;

  button.addEventListener("click", function () {
    var next = current() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(key, next); } catch (e) {}
    label();
  });
})();