// buttons.js — Hardware Navigation Buttons

(function () {

  const MODES = ["staff", "scales", "keys"];

  function getNextMode(current, direction) {
    let index = MODES.indexOf(current);
    if (index === -1) index = 0;

    if (direction === "right") {
      index = (index + 1) % MODES.length;
    }

    if (direction === "left") {
      index = (index - 1 + MODES.length) % MODES.length;
    }

    return MODES[index];
  }

  /* ==========================
     CREATE BUTTON CONTAINER
  ========================== */

  const wrapper = document.createElement("div");
  wrapper.id = "nav-buttons";

  wrapper.style.display = "flex";
  wrapper.style.justifyContent = "center";
  wrapper.style.gap = "40px";
  wrapper.style.marginTop = "10px";

  /* ==========================
     CREATE BUTTON FACTORY
  ========================== */

  function createButton(direction) {
    const btn = document.createElement("div");

    btn.style.width = "0";
    btn.style.height = "0";
    btn.style.borderTop = "20px solid transparent";
    btn.style.borderBottom = "20px solid transparent";
    btn.style.cursor = "pointer";

    if (direction === "left") {
      btn.style.borderRight = "30px solid #333";
    }

    if (direction === "right") {
      btn.style.borderLeft = "30px solid #333";
    }

    btn.addEventListener("click", () => {
      if (!window.__UI__) return;

      const current = __UI__.getMode();
      const next = getNextMode(current, direction);
      __UI__.setMode(next);
    });

    return btn;
  }

  const leftBtn = createButton("left");
  const rightBtn = createButton("right");

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(wrapper);
  });

})();