(function () {

  // Wait until staff is ready
  function init() {

    const ctx = window.__STAFF_CONTEXT__;
    if (!ctx) return requestAnimationFrame(init);

    const {
      svg,
      SVG_NS,
      W,
      trebleBottom,
      half,
      currentKey
    } = ctx;

    // Create ruler group INSIDE same SVG
    const rulerGroup = document.createElementNS(SVG_NS, "g");
    svg.appendChild(rulerGroup);

    function drawVerticalRuler(rootLetter = "C") {

  rulerGroup.innerHTML = "";

  const rulerWidth = 20;
  const rulerX = W - rulerWidth;

  // background panel
  const bg = document.createElementNS(SVG_NS, "rect");
bg.setAttribute("x", rulerX);
bg.setAttribute("y", 0);
bg.setAttribute("width", rulerWidth);
bg.setAttribute("height", svg.viewBox.baseVal.height);
bg.setAttribute("fill", "#e8e8e8");

  rulerGroup.appendChild(bg);

  const solfege = ["d","r","m","f","s","l","t"];
  const totalSteps = 40;

  for (let i = -totalSteps; i <= totalSteps; i++) {

    const stepY = trebleBottom - i * half;

    const tick = document.createElementNS(SVG_NS, "line");
    tick.setAttribute("x1", rulerX + 2);
    tick.setAttribute("x2", rulerX + 10);
    tick.setAttribute("y1", stepY);
    tick.setAttribute("y2", stepY);
    tick.setAttribute("stroke", "#000");
    tick.setAttribute("stroke-width", "1");
    rulerGroup.appendChild(tick);

    const middleCIndex = -2;
    const degree = ((i - middleCIndex) % 7 + 7) % 7;
    const label = solfege[degree];

    const text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("x", rulerX + 12);
    text.setAttribute("y", stepY + 4);
    text.setAttribute("font-size", 9);
    text.textContent = label;
    if (degree === 0) {
  text.setAttribute("font-weight", "bold");
}

    rulerGroup.appendChild(text);
  }
}

    // Initial draw
    drawVerticalRuler(currentKey());

    // Expose refresh method
    window.__STAFF_RULER__ = {
      redraw() {
        drawVerticalRuler(currentKey());
      }
    };
  }

  init();

})();