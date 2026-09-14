function createTabbedFigure(tabbedFigure) {
  let buttons = tabbedFigure.querySelectorAll(".tabbed-figure__tabs > button");
  let figures = tabbedFigure.querySelectorAll(".tabbed-figure__content > *");

  if (buttons.length != figures.length) {
    console.error(
      "Number of buttons and figures do not match in tabbed figure",
      tabbedFigure,
    );
  }

  for (let figure of figures) {
    figure.style.display = "none";
  }

  buttons.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      btn.ariaSelected = "true";
      buttons.forEach((b) => {
        if (b !== btn) {
          b.ariaSelected = "false";
        }
      });

      figures.forEach((f) => (f.style.display = "none"));
      figures[index].style.display = "block";
    });
  });

  if (buttons.length > 0) {
    buttons[0].click();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tabbedFigures = document.querySelectorAll(".tabbed-figure");
  tabbedFigures.forEach(createTabbedFigure);
});
