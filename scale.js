// scale.js
(function(){

  // ===== CSS =====
  const keyCss = `
#scale-select-wrapper {
  position: absolute;
  left: 50%;
  top: 0%;
  transform: translateX(-185%) translateY(750%);
  z-index: 9999;
  padding: 4px 8px;
  border-radius: 8px;
}

#global-scale-selector {
  border: none;
  color: #000;
  background: #d9d9d9;
  font-size: 1.5rem;
  outline: none;
  width: 14rem;
  display: inline-block;
}
`;
  const style = document.createElement("style");
  style.textContent = keyCss;
  document.head.appendChild(style);

  // ===== DOM =====
  const wrapper = document.createElement("div");
  wrapper.id = "scale-select-wrapper";

  wrapper.innerHTML = `
    <select id="global-scale-selector">
      <option value="chromatic">Chromatic</option>
      <option value="diatonic">Diatonic</option>
      <option value="pentatonic">Pentatonic</option>
      <option value="blues">Blues</option>
    </select>
  `;

  document.body.appendChild(wrapper);

  const selector = document.getElementById("global-scale-selector");

  // ===== State =====
  let currentScale = selector.value;

  // ===== Notify listeners =====
  function notify(scale){
    if (window.rulerSetScale) window.rulerSetScale(scale);
    if (window.pianoSetKey) window.pianoSetKey(scale);
    if (window.staffSetKey) window.staffSetKey(scale);
    if (window.keySetKey) window.keySetKey(scale);
  }

  // ===== Event listener =====
  selector.addEventListener("change", e => {
    currentScale = e.target.value;
    notify(currentScale);
  });

  // ===== Initial broadcast =====
  notify(currentScale);

})();