export function initFilters(galleryDemos) {
  // View setup ------------------------------------------------------------------

  let filtersList = document.getElementById("filters-list");
  let demosGrid = document.getElementById("demos-grid");

  class Tag {
    constructor(name, button) {
      this.name = name;
      this.count = 0;
      this.button = button;
      this.selected = false;
    }

    updateView() {
      this.button.innerText = `${this.name} (${this.count})`;
      this.button.disabled = this.count === 0;
      this.button.ariaPressed = this.selected;
    }
  }

  function makeTag(name) {
    let li = document.createElement("li");
    let button = document.createElement("button");
    button.type = "button";
    button.className = "tag tag--filter";
    button.innerText = name;

    li.appendChild(button);

    return new Tag(name, button);
  }

  class Demo {
    constructor(card, tags) {
      this.card = card;
      this.tags = new Set(tags);
      this.selected = true;
      this.matchingTagsCount = 0;
    }

    updateView() {
      if (this.selected) {
        this.card.style.display = "";
      } else {
        this.card.style.display = "none";
      }
    }
  }

  function makeDemo(demoName, demo) {
    let article = document.createElement("article");
    article.className = "demo-card";

    let imgDiv = document.createElement("div");
    let img = document.createElement("img");
    img.src = "assets/thumbnails/" + demo.thumbnailFile;
    imgDiv.appendChild(img);

    let contentDiv = document.createElement("div");
    let h3 = document.createElement("h3");
    let a = document.createElement("a");
    a.href = demoName + ".html";
    a.innerText = demo.title;
    h3.appendChild(a);
    contentDiv.appendChild(h3);

    let ul = document.createElement("ul");
    for (let tag of demo.tags) {
      let li = document.createElement("li");
      let span = document.createElement("span");
      span.className = "tag tag--outlined-small";
      span.innerText = tag;
      li.appendChild(span);
      ul.appendChild(li);
    }
    contentDiv.appendChild(ul);

    article.appendChild(imgDiv);
    article.appendChild(contentDiv);

    return new Demo(article, demo.tags);
  }

  let allTag = makeTag("All");
  let tags = {};
  let demos = {};

  for (let [demoName, demo] of Object.entries(galleryDemos)) {
    for (let tagName of demo.tags) {
      if (!tags[tagName]) {
        tags[tagName] = makeTag(tagName);
      }
      tags[tagName].count++;
    }
    allTag.count++;
    demos[demoName] = makeDemo(demoName, demo);
  }

  filtersList.appendChild(allTag.button.parentElement);
  for (let tagName of Object.keys(tags).sort()) {
    filtersList.appendChild(tags[tagName].button.parentElement);
  }

  for (let demoName of Object.keys(demos).sort()) {
    demosGrid.appendChild(demos[demoName].card);
  }

  // View update -------------------------------------------------------------------

  function updateView() {
    allTag.updateView();
    for (let tag of Object.values(tags)) {
      tag.updateView();
    }
    for (let demo of Object.values(demos)) {
      demo.updateView();
    }
  }

  updateView();

  // Filtering logic -------------------------------------------------------------------

  let selectedTagsCount = 0;

  function updateDemoMatchingTag(tagName, delta) {
    for (let demo of Object.values(demos)) {
      if (demo.tags.has(tagName)) {
        demo.matchingTagsCount += delta;
      }
      demo.selected = demo.matchingTagsCount === selectedTagsCount;
    }
  }

  function updateTagsDemoCount() {
    for (let tagName of Object.keys(tags)) {
      let count = 0;
      for (let demo of Object.values(demos)) {
        if (demo.tags.has(tagName) && demo.selected) {
          count++;
        }
      }
      tags[tagName].count = count;
    }
  }

  function toggleTag(tagName) {
    let tag = tags[tagName];
    if (tag.selected) {
      selectedTagsCount--;
      tag.selected = false;
      updateDemoMatchingTag(tagName, -1);
    } else {
      selectedTagsCount++;
      tag.selected = true;
      updateDemoMatchingTag(tagName, 1);
    }
    updateTagsDemoCount();
    updateView();
  }

  function resetFilters() {
    selectedTagsCount = 0;
    for (let tag of Object.values(tags)) {
      tag.selected = false;
    }
    for (let demo of Object.values(demos)) {
      demo.selected = true;
      demo.matchingTagsCount = 0;
    }
    updateTagsDemoCount();
    updateView();
  }

  for (let tag of Object.values(tags)) {
    tag.button.addEventListener("click", () => {
      toggleTag(tag.name);
    });
  }

  allTag.button.addEventListener("click", resetFilters);
}
