(function () {

  if (!window.piano) {
    console.error("Ruler requires piano.js loaded first.");
    return;
  }

  // ===== CSS =====
  const css = `
  #measure-wrapper {
    position: relative;
    width: 100%;
    height: 18%;
    overflow: hidden;
    background: #fff;
    border-bottom: 0.01rem solid #bbb;
    cursor: grab;
    z-index: 10;
    margin-bottom: -1rem;
    box-shadow: 0 3px 6px rgba(0,0,0,0.2);
    font-size: 1rem;
  }
  #measure-wrapper:active { cursor: grabbing; }
  
  #measure-tape {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    font-size: 1rem;
  }
  
  
  .measure-tick {
    position: absolute;
    bottom: 0;
    width: 0.15rem;
    background: #333;
  }
  .measure-tick.major { height: 45%; }
  .measure-label {
    position: absolute;
    bottom: 45%;
    font-size: 1.5rem;
    color: #333;
    transform: translateX(-50%);
    white-space: nowrap;
  }
  
  .measure-label.tonic {
  font-weight: bold;
}

.measure-tick.tonic {
  width: 0.3rem;
  background: #000;
}

.measure-label sup {
  font-size: 0.6rem;
  position: relative;
  top: -0.15rem;
}

.measure-label sub {
  font-size: 0.6rem;
  position: relative;
  top: -0.15rem;
}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  // ===== DOM =====
  const measureWrapper = document.createElement("div");
  measureWrapper.id = "measure-wrapper";

  const measureTape = document.createElement("div");
  measureTape.id = "measure-tape";

  measureWrapper.appendChild(measureTape);

  // insert after scrollbar container
  const pianoUnit = document.getElementById("piano-unit");
  pianoUnit.insertBefore(measureWrapper, window.piano.pianoWrapper);

  // ===== Scale config =====
const SCALES = {

  chromatic: [
    { interval: 0,  solfege: "d",  number: "1" },
    { interval: 1,  solfege: "di", number: "#1" },
    { interval: 2,  solfege: "r",  number: "2" },
    { interval: 3,  solfege: "ri", number: "#2" },
    { interval: 4,  solfege: "m",  number: "3" },
    { interval: 5,  solfege: "f",  number: "4" },
    { interval: 6,  solfege: "fi", number: "#4" },
    { interval: 7,  solfege: "s",  number: "5" },
    { interval: 8,  solfege: "si", number: "#5" },
    { interval: 9,  solfege: "l",  number: "6" },
    { interval: 10, solfege: "li", number: "#6" },
    { interval: 11, solfege: "t",  number: "7" }
  ],

  diatonic: [
    { interval: 0,  solfege: "d", number: "1" },
    { interval: 2,  solfege: "r", number: "2" },
    { interval: 4,  solfege: "m", number: "3" },
    { interval: 5,  solfege: "f", number: "4" },
    { interval: 7,  solfege: "s", number: "5" },
    { interval: 9,  solfege: "l", number: "6" },
    { interval: 11, solfege: "t", number: "7" }
  ],

  pentatonic: [
    { interval: 0, solfege: "d", number: "1" },
    { interval: 2, solfege: "r", number: "2" },
    { interval: 4, solfege: "m", number: "3" },
    { interval: 7, solfege: "s", number: "5" },
    { interval: 9, solfege: "l", number: "6" }
  ],

  blues: [
    { interval: 0,  solfege: "d", number: "1" },
    { interval: 3,  solfege: "m", number: "b3" },
    { interval: 5,  solfege: "f", number: "4" },
    { interval: 6,  solfege: "fi", number: "#4" },
    { interval: 7,  solfege: "s", number: "5" },
    { interval: 10, solfege: "t", number: "b7" }
  ]

};
  let rulerScale = "diatonic";
  let rulerRoot = "C";
  let rulerDisplayLabel = "R";
  let visualOffset = -0.25;
  let tapeUserOffset = visualOffset;
  let rulerLabelMode = "solfege"; // "solfege" | "number" | future modes
  
  // ===== Public API =====
window.rulerSetScale = function(scaleName){
  if (!SCALES[scaleName]) {
    console.warn("Unknown scale:", scaleName);
    return;
  }

  rulerScale = scaleName;
  renderMeasurementTape();
};

  function pitchClass(note) {
    return note.replace(/[0-9]/g, "");
  }

  function noteInScale(note, root, scaleName) {

  const scale = SCALES[scaleName];
  if (!scale) return false;

  const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  const notePC = pitchClass(note);
  const rootIndex = NOTES.indexOf(root);
  const noteIndex = NOTES.indexOf(notePC);

  if (rootIndex === -1 || noteIndex === -1) return false;

  const interval = (noteIndex - rootIndex + 12) % 12;

  return scale.some(deg => deg.interval === interval);
}

  function getSemitoneUnit() {
    const keyWidth = window.piano.getKeyWidth();
    const spacing = window.piano.getWhiteKeySpacing();
    return (keyWidth + spacing) * (7 / 12);
  }
function formatRegister(label, register) {

  if (register === 0) {
    return label;
  }

  const abs = Math.abs(register);

  if (register > 0) {
    return `${label}<sup>${abs}</sup>`;
  } else {
    return `${label}<sub>${abs}</sub>`;
  }
}
function getNearestKeyFromX(x) {
    const keyOrder = window.piano.keyOrder;
    const SEMITONE_UNIT = getSemitoneUnit();
    const cMid = window.piano.getCMidpoint();
    const c4Index = keyOrder.indexOf("C4");

    let nearestIndex = 0;
    let minDist = Infinity;

    keyOrder.forEach((note, i) => {
        const keyX = (i - c4Index) * SEMITONE_UNIT + cMid;
        const dist = Math.abs(keyX - x);
        if (dist < minDist) {
            minDist = dist;
            nearestIndex = i;
        }
    });

    return keyOrder[nearestIndex]; // returns note like "E4"
}
  function renderMeasurementTape() {

  const keyOrder = window.piano.keyOrder;
  const cMid = window.piano.getCMidpoint();
  const SEMITONE_UNIT = getSemitoneUnit();
  const c4Index = keyOrder.indexOf("C4");

  measureTape.innerHTML = "";

  measureTape.style.width =
    Math.max(
      window.piano.getScrollWidth(),
      keyOrder.length * SEMITONE_UNIT
    ) + "px";

  keyOrder.forEach((note, i) => {

    if (!noteInScale(note, rulerRoot, rulerScale)) return;

    const x = cMid + (i - c4Index) * SEMITONE_UNIT;


   // ---- LABEL LOGIC ----

const scale = SCALES[rulerScale];

const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const notePC = pitchClass(note);
const rootIndex = NOTES.indexOf(rulerRoot);
const noteIndex = NOTES.indexOf(notePC);

const interval = (noteIndex - rootIndex + 12) % 12;
const tick = document.createElement("div");
tick.className = "measure-tick major";

if (interval === 0) {
  tick.classList.add("tonic");
}

tick.style.left = x + "px";
measureTape.appendChild(tick);
// find degree object
const degree = scale.find(d => d.interval === interval);

if (degree) {

  const rootReferenceIndex = keyOrder.findIndex(n => n === rulerRoot + "4");
  const semitoneDistance = i - rootReferenceIndex;
  const octaveOffset = Math.floor(semitoneDistance / 12);

  const baseLabel = degree[rulerLabelMode];

  const finalLabel = formatRegister(baseLabel, octaveOffset);

  const label = document.createElement("div");
label.className = "measure-label";

if (interval === 0) {
  label.classList.add("tonic");
}
  label.style.left = x + "px";
  label.innerHTML = finalLabel;

  measureTape.appendChild(label);
}

  });

  positionMeasurementTape(); // ← call position after render
}
function positionMeasurementTape() {
  const scrollLeft = window.piano.getScrollLeft();
  const SEMITONE_UNIT = getSemitoneUnit();

  measureTape.style.left =
    (-scrollLeft + tapeUserOffset * SEMITONE_UNIT) + "px";
}

  // ===== Drag Logic =====
  let dragging = false;
  let startX = 0;
  let startOffset = 0;

  measureWrapper.addEventListener("mousedown", e => {
    dragging = true;
    startX = e.clientX;
    startOffset = tapeUserOffset;
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    const dx = e.clientX - startX;

    tapeUserOffset = startOffset + dx / getSemitoneUnit();
    positionMeasurementTape();

    // --- new: update rulerRoot to nearest key ---
    const tonicX = window.piano.getCMidpoint() + tapeUserOffset * getSemitoneUnit();
    const nearestKey = getNearestKeyFromX(tonicX);
    rulerRoot = pitchClass(nearestKey);  // update tonic dynamically
});

  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;

    const tonicX = window.piano.getCMidpoint() + tapeUserOffset * getSemitoneUnit();
    const nearestKey = getNearestKeyFromX(tonicX);
    const tonicIndex = window.piano.keyOrder.indexOf(nearestKey);
    const c4Index = window.piano.keyOrder.indexOf("C4");

    tapeUserOffset = tonicIndex - c4Index + visualOffset; // ← apply visual tweak
    rulerRoot = pitchClass(nearestKey);
    positionMeasurementTape();
});
  
  window.addEventListener("blur", () => dragging = false);
document.addEventListener("mouseleave", () => dragging = false);
  
  measureWrapper.addEventListener("touchstart", e => {
  e.preventDefault();
  e.stopPropagation();

  dragging = true;
  startX = e.touches[0].clientX;
  startOffset = tapeUserOffset;
}, { passive: false });

document.addEventListener("touchmove", e => {
  if (!dragging) return;

  e.preventDefault();
  e.stopPropagation();

  const dx = e.touches[0].clientX - startX;
  tapeUserOffset = startOffset + dx / getSemitoneUnit();
  positionMeasurementTape();
  
  const tonicX = window.piano.getCMidpoint() + tapeUserOffset * getSemitoneUnit();
    const nearestKey = getNearestKeyFromX(tonicX);
    rulerRoot = pitchClass(nearestKey);
}, { passive: false });

document.addEventListener("touchend", e => {
    if (!dragging) return;
    e.preventDefault(); e.stopPropagation();
    dragging = false;

    const tonicX = window.piano.getCMidpoint() + tapeUserOffset * getSemitoneUnit();
    const nearestKey = getNearestKeyFromX(tonicX);
    const tonicIndex = window.piano.keyOrder.indexOf(nearestKey);
    const c4Index = window.piano.keyOrder.indexOf("C4");

    tapeUserOffset = tonicIndex - c4Index + visualOffset; // ← apply visual tweak
    rulerRoot = pitchClass(nearestKey);
    positionMeasurementTape();
});

  // ===== Subscribe to piano =====
  window.piano.onLayoutChange(() => {
  renderMeasurementTape();
});
  // initial render
  renderMeasurementTape();

})();