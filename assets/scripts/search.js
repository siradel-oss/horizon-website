import Fuse from "fuse.js";

function renderResults(results, container) {
  if (results.length === 0) {
    container.hidden = true;
    container.innerHTML = "";
    return;
  }
  container.innerHTML = results
    .map(
      ({ item }) =>
        `<li role="option">
           <a href="${item.url}"
              class="block px-lg py-sm text-body-md text-on-surface
                     hover:bg-primary-accent
                     focus-visible:bg-primary-accent
                     focus-visible:outline-2 focus-visible:-outline-offset-2
                     focus-visible:outline-secondary">
             ${item.title}
           </a>
         </li>`,
    )
    .join("");
  container.hidden = false;
}

export function initSearch(baseUrl, searchData, input) {
  const container = document.getElementById("doc-search-results");
  const status = document.getElementById("doc-search-status");
  const form = document.getElementById("doc-search");

  form.addEventListener("submit", (e) => e.preventDefault());

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "k" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });

  const fuse = new Fuse(searchData, {
    keys: ["title"],
    useTokenSearch: true,
    tokenMatch: "all",
    threshold: 0.1,
  });

  function clearResults() {
    renderResults([], container);
    input.setAttribute("aria-expanded", "false");
    if (status) status.textContent = "";
  }

  input.addEventListener("input", () => {
    const query = input.value.trim();
    if (query.length < 3) {
      clearResults();
      return;
    }
    const results = fuse.search(query).slice(0, 10);
    renderResults(results, container);
    input.setAttribute("aria-expanded", results.length > 0 ? "true" : "false");
    if (status)
      status.textContent =
        results.length === 0
          ? "No results found."
          : `${results.length} result${results.length > 1 ? "s" : ""} found. Use arrow keys to navigate.`;
  });

  input.addEventListener("keydown", (e) => {
    if (container.hidden) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      container.querySelector("a")?.focus();
    } else if (e.key === "Escape") {
      clearResults();
    }
  });

  container.addEventListener("keydown", (e) => {
    const links = [...container.querySelectorAll("a")];
    const idx = links.indexOf(document.activeElement);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      links[idx + 1]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      idx === 0 ? input.focus() : links[idx - 1]?.focus();
    } else if (e.key === "Escape") {
      clearResults();
      input.focus();
    }
  });

  document.addEventListener("click", (e) => {
    if (!input.closest(".doc-search-wrapper").contains(e.target))
      clearResults();
  });

  document.addEventListener("focusin", (e) => {
    if (!input.closest(".doc-search-wrapper").contains(e.target))
      clearResults();
  });
}
