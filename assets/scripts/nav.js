const burger = document.getElementById("header__burger");
const menu = document.getElementById("header__mobile-menu");

function openMenu() {
  menu.removeAttribute("inert");
  menu.classList.remove("opacity-0", "scale-95", "pointer-events-none");
  burger.setAttribute("aria-expanded", "true");
  burger.setAttribute("aria-label", "Fermer le menu");
  document.body.style.overflow = "hidden";
  const firstLink = menu.querySelector("a, button");
  if (firstLink) firstLink.focus();
}

function closeMenu() {
  menu.setAttribute("inert", "");
  menu.classList.add("opacity-0", "scale-95", "pointer-events-none");
  burger.setAttribute("aria-expanded", "false");
  burger.setAttribute("aria-label", "Menu");
  document.body.style.overflow = "";
  burger.focus();
}

if (burger && menu) {
  burger.addEventListener("click", () => {
    burger.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true")
      closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || burger.getAttribute("aria-expanded") !== "true")
      return;
    const focusable = [
      burger,
      ...menu.querySelectorAll("a[href], button:not([disabled])"),
    ];
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  menu
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
}

const heroModal = document.getElementById("hero-modal");
if (heroModal) {
  const getFocusable = () => [
    ...heroModal.querySelectorAll(
      'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ];

  let invoker = null;
  document.querySelectorAll('[popovertarget="hero-modal"]').forEach((btn) => {
    if (btn.getAttribute("popovertargetaction") === "hide") return;
    btn.addEventListener("click", () => {
      invoker = btn;
    });
  });

  heroModal.addEventListener("toggle", (e) => {
    if (e.newState === "open") {
      const focusable = getFocusable();
      if (focusable[0]) focusable[0].focus();
    } else if (e.newState === "closed" && invoker) {
      invoker.focus();
      invoker = null;
    }
  });

  heroModal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
