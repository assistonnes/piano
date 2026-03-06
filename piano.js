/* piano.js - Fully self-contained piano UI + scrollbar + zoom + keys + audio    
   Designed so index.htm only needs: <script src="piano.js"></script>    
*/    
    
(function() {    
  // --- Inject CSS ---    
  const css = `    
html, body { height: 100%; margin: 0; padding: 0; overflow-x: hidden; box-sizing: border-box; font-family: Arial, sans-serif; background: #f4f4f4; }    

/* Scrollbar + buttons layout */    
#scrollbar-container {
  display: flex;
  align-items: stretch;
  justify-content: space-between; /* ← KEY CHANGE */
  gap: 0.3rem;
  margin: 0 0 0.2rem 0;  
  width: 100%;
  flex: 0 0 12%;
  padding: 0 1%;
  box-sizing: border-box;
  
}
#piano-unit
{position:relative;
  width: 100%;
  height: 60%;
  display: flex;
   flex-direction: column;
}

 @media (orientation: portrait) {
    #piano-unit {
    width: 100%;
      aspect-ratio: 1.7/1;
      height: auto;
      
    }
  }
  @media (orientation: landscape) {
    #piano-unit {
      width: 100%;
      height: 60%;
      
    }
  }

#piano-scrollbar {
  height: 100%;              /* taller = easier thumb grab */
  background: #ccc;
  border-radius: 1rem;
  flex: 6;                 /* <-- KEY CHANGE: less width */
  position: relative;
  cursor: pointer;
}
#piano-scroll-thumb {
  height: 100%;
  background: #888;
  border-radius: 1rem;
  position: absolute;
  left: 0;
  min-width: 0rem;
}

.scroll-group {
  display: flex;
  align-items: stretch;
  gap: 0.3rem;
}

#scroll-left-key, #scroll-right-key,
#scroll-left-octave, #scroll-right-octave, #zoom-out, #zoom-in   {
flex: 1;
  aspect-ratio: 1/1;
  font-size: 2rem;
  cursor: pointer;
}

#zoom-out, #zoom-in,
#scroll-left-key, #scroll-right-key,
#scroll-left-octave, #scroll-right-octave {

  -webkit-appearance: none;
  appearance: none;

  border: 0.05em solid #999;
  border-radius: 0.3rem;

  padding: 0rem;
  margin: 0rem;

  background: #eee;

  display: flex;
  align-items: center;
  justify-content: center;

  box-sizing: border-box;

  font-weight: normal;
  color: #000;
}

/* Piano wrapper and keys */    
#piano-wrapper {
    width: 100%;
    display: flex;
    align-items: flex-start;
    flex:1;
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    position: relative;
    margin: 0rem;
    padding-bottom: 1rem; 
  font-size: 2rem;
}   
    

#piano-wrapper::-webkit-scrollbar { display: none; }    
#piano-container { 
position: relative;
height: 100%;
width: fit-content;
    margin: 0;
    padding: 0;      
}    
/* ---------- White Keys ---------- */
.white-key {
  position: absolute;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  bottom: 0;
  height: 100%;
  border-radius: 0.25rem;
  border: 0.06rem solid #999;

  /* 3D Gradient Base */
  background:
    linear-gradient(to bottom, #ffffff 0%, #e0e0e0 100%),
    radial-gradient(circle at top center, rgba(255,255,255,0.6) 0%, transparent 40%);

  /* Depth */
  box-shadow:
    inset 0rem -0.25rem 0.4rem rgba(0,0,0,0.1),
    0rem 0.15rem 0.3rem rgba(0,0,0,0.2);

  transition: background 0.1s, box-shadow 0.1s, transform 0.08s;
}

/* Key label */
.white-key .key-label {
  pointer-events: none;
  position: absolute;
  bottom: 0.6rem;
  width: 100%;
  text-align: center;
  line-height: 1;
  font-size: var(--key-label-size);
  color: #000;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Press animation */
.white-key.pressed {
  background:
    linear-gradient(to bottom, #dcdcdc 0%, #bfbfbf 100%),
    radial-gradient(circle at top center, rgba(255,255,255,0.3) 0%, transparent 40%);

  box-shadow:
    inset 0 -0.15rem 0.25rem rgba(0,0,0,0.25);

  transform: translateY(0.05em);
}

/* ---------- Black Keys ---------- */
.black-key {
  position: absolute;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  cursor: pointer;
  user-select: none;

  height: 65%;
  z-index: 1;
  color: #fff;

  

  border-radius: 0.2em;

  /* 3D Gradient Base */
  background:
    linear-gradient(to bottom, #111 0%, #333 100%),
    radial-gradient(circle at top center, rgba(255,255,255,0.15) 0%, transparent 20%);

  box-shadow:
    inset 0 -0.08em 0.05em rgba(255,255,255,0.6),
    0.05em 0.05em 0.12em rgba(0,0,0,0.5);

  transition: background 0.1s, box-shadow 0.1s, transform 0.08s;
}

/* Black key label */
.black-key .key-label {
  pointer-events: none;
  position: absolute;
  bottom: 0.5em;
  width: 100%;
  text-align: center;
  line-height: 1;
  font-size: calc(var(--key-label-size) * 0.75);
  color: #fff;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Press animation */
.black-key.pressed {
  background:
    linear-gradient(to bottom, #000 0%, #222 100%),
    radial-gradient(circle at top center, rgba(255,255,255,0.05) 0%, transparent 40%);

  box-shadow:
    inset 0 -0.12em 0.08em rgba(255,255,255,0.4);

  transform: translateY(0.04em);
}
  `;    
  const styleEl = document.createElement('style');    
  styleEl.textContent = css;    
  document.head.appendChild(styleEl); 
    
  // --- Create DOM ---    
  const pianoUnit = document.createElement('div'); pianoUnit.id = 'piano-unit'; document.body.appendChild(pianoUnit);    
  const scrollbarContainer = document.createElement('div'); scrollbarContainer.id = 'scrollbar-container';    
  const leftGroup = document.createElement('div'); leftGroup.className = 'scroll-group';    
  const btnScrollLeftOct = document.createElement('button'); btnScrollLeftOct.id='scroll-left-octave'; btnScrollLeftOct.textContent='<<';    
  const btnScrollLeftKey = document.createElement('button'); btnScrollLeftKey.id='scroll-left-key'; btnScrollLeftKey.textContent='<';    
  const btnZoomOut = document.createElement('button'); btnZoomOut.id='zoom-out'; btnZoomOut.textContent='-';    
  leftGroup.append(btnScrollLeftOct, btnScrollLeftKey, btnZoomOut);    
  
    
  const scrollBar = document.createElement('div'); scrollBar.id='piano-scrollbar';    
  const scrollThumb = document.createElement('div'); scrollThumb.id='piano-scroll-thumb'; scrollBar.appendChild(scrollThumb);    
    
  const rightGroup = document.createElement('div'); rightGroup.className='scroll-group';    
  const btnZoomIn = document.createElement('button'); btnZoomIn.id='zoom-in'; btnZoomIn.textContent='+';    
  const btnScrollRightKey = document.createElement('button'); btnScrollRightKey.id='scroll-right-key'; btnScrollRightKey.textContent='>';    
  const btnScrollRightOct = document.createElement('button'); btnScrollRightOct.id='scroll-right-octave'; btnScrollRightOct.textContent='>>';    
  rightGroup.append(btnZoomIn, btnScrollRightKey, btnScrollRightOct);    
    
  scrollbarContainer.append(leftGroup, scrollBar, rightGroup);    
  pianoUnit.appendChild(scrollbarContainer);
  
    
  const pianoWrapper = document.createElement('div'); pianoWrapper.id='piano-wrapper';    
  const pianoContainer = document.createElement('div'); pianoContainer.id='piano-container';    
  pianoWrapper.appendChild(pianoContainer);    
  pianoUnit.appendChild(pianoWrapper);    
    
  window.pianoWrapper = pianoWrapper;    
  window.scrollBar = scrollBar;    
  window.scrollThumb = scrollThumb;    
    
  // --- Audio & keys ---    
  let audioCtx;    
  const activeNotes = new Map(); // noteName → noteObj    
  let keyWidth, blackKeyWidth, whiteKeySpacing = 1; ;


  const whiteKeys = [], blackKeys = [];    
  const keyOrder = [    
    "A0","A#0","B0","C1","C#1","D1","D#1","E1","F1","F#1","G1","G#1",    
    "A1","A#1","B1","C2","C#2","D2","D#2","E2","F2","F#2","G2","G#2",    
    "A2","A#2","B2","C3","C#3","D3","D#3","E3","F3","F#3","G3","G#3",    
    "A3","A#3","B3","C4","C#4","D4","D#4","E4","F4","F#4","G4","G#4",    
    "A4","A#4","B4","C5","C#5","D5","D#5","E5","F5","F#5","G5","G#5",    
    "A5","A#5","B5","C6","C#6","D6","D#6","E6","F6","F#6","G6","G#6",    
    "A6","A#6","B6","C7","C#7","D7","D#7","E7","F7","F#7","G7","G#7",    
    "A7","A#7","B7","C8"    
  ];    
    
  const noteFrequencies = {};    
  const A4=440;    
  keyOrder.forEach((note,i)=>{ const n=i-48; noteFrequencies[note]=+(A4*Math.pow(2,n/12)).toFixed(2); });    
  
function generateKeysOnce() {    
  pianoContainer.innerHTML = '';    
  whiteKeys.length = 0; blackKeys.length = 0;    
  const whiteNoteToIndex = {};    
  let whiteIndex = 0;    
    
  keyOrder.forEach(note => {    
    if (!note.includes('#')) {    
      const wk = document.createElement('div');    
      wk.className = 'white-key';    
      wk.dataset.note = note;   
      wk.dataset.wIndex = whiteIndex;
      const label = document.createElement('span'); label.className = 'key-label'; label.textContent = note;    
      wk.appendChild(label);    
      pianoContainer.appendChild(wk);    
      whiteKeys.push(wk);    
      whiteNoteToIndex[note] = whiteIndex;    
      whiteIndex++;    
    }    
  });    
    
  keyOrder.forEach(note => {    
    if (note.includes('#')) {    
      const bk = document.createElement('div');    
      bk.className = 'black-key';    
      bk.dataset.note = note;   
      const label = document.createElement('span'); label.className = 'key-label'; label.textContent = note;    
      bk.appendChild(label);    
      pianoContainer.appendChild(bk);    
      blackKeys.push(bk);    
    }    
  });    
    
  attachKeyEvents();    
  
  return whiteNoteToIndex;    
}    
  
let __whiteNoteToIndex = generateKeysOnce();


// --- Responsive key sizing ---
function setInitialKeyWidth() {

const fitKeyWidth = getExactFitKeyWidth();
keyWidth = Math.max(pianoWrapper.clientWidth * 0.09, fitKeyWidth);
keyWidth = Math.min(keyWidth, 110);

  // Black keys proportional
  blackKeyWidth = keyWidth * 0.65;
  updateKeyLabelSize();

}

function updateKeyLabelSize() {
  document.documentElement.style.setProperty(
    "--key-label-size",
    (keyWidth * 0.25) + "px"
  );
}

// --- Layout white & black keys ---
function updateKeyLayout() {
  // Layout white keys sequentially
  let left = 0;
  whiteKeys.forEach((wk) => {
    wk.style.width = keyWidth + 'px';
    wk.style.left = left + 'px';
    wk.dataset.leftPx = left;
    left += keyWidth + whiteKeySpacing; // spacing
  });

  // Black key ratios for positioning between adjacent white keys
  const blackKeyRatio = { 'C#': 0.97, 'D#': 1.12, 'F#': 0.88, 'G#': 1.05, 'A#': 1.15 };

  blackKeys.forEach(bk => {
    const note = bk.dataset.note;

    // Find adjacent white keys
    const leftW = whiteKeys.find(w => w.dataset.note === findLeftWhite(note));
    const rightW = whiteKeys[whiteKeys.findIndex(w => w.dataset.note === findRightWhite(note))];

    if (!leftW || !rightW) return;

    const ratio = blackKeyRatio[note[0] + '#'] || 0.57;

    // Compute left position of black key
    const center = parseFloat(leftW.dataset.leftPx) + (parseFloat(rightW.dataset.leftPx) - parseFloat(leftW.dataset.leftPx)) * ratio;
    bk.style.width = blackKeyWidth + 'px';
    bk.style.left = (center - blackKeyWidth / 2) + 'px';
  });

  // Set piano container width
  const totalWidth =   whiteKeys.length * keyWidth +   (whiteKeys.length - 1) * whiteKeySpacing; // spacing
  pianoContainer.style.width = totalWidth + 'px';
}

function applyLayout({ preserveCenter = false, centerGeometry = false } = {}) {

  let ratio = null;

  if (preserveCenter) {
    ratio = getCenterRatio();
  }

  // 1. Layout keys
  updateKeyLayout();

  // 2. Decide centering strategy
  if (centerGeometry) {
    pianoWrapper.scrollLeft =
      (pianoWrapper.scrollWidth - pianoWrapper.clientWidth) / 2;
  }
  else if (preserveCenter && ratio !== null) {
    restoreCenterFromRatio(ratio);
  }

  // 3. Update scrollbar thumb
  updateThumb();
}

// --- Helpers to find adjacent white notes ---
function findLeftWhite(note) {
  const idx = keyOrder.indexOf(note);
  for (let i = idx - 1; i >= 0; i--) if (!keyOrder[i].includes('#')) return keyOrder[i];
}
function findRightWhite(note) {
  const idx = keyOrder.indexOf(note);
  for (let i = idx + 1; i < keyOrder.length; i++) if (!keyOrder[i].includes('#')) return keyOrder[i];
}   

setInitialKeyWidth();

  function playNote(note, velocity = 0.8) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  const freq = noteFrequencies[note];
  if (!freq) return;

  const now = audioCtx.currentTime;

  // --- Master gain with envelope based on velocity ---
  const masterGain = audioCtx.createGain();

  // Slight pan for realism
  const panNode = audioCtx.createStereoPanner();
  panNode.pan.value = (Math.random() - 0.5) * 0.2; // ±0.1 pan

  // Dynamic envelope
  const attack = 0.01;           // quick attack
  const decay = 0.12;            // decay
  const release = 0.35 + (0.15 * (1 - velocity)); // softer velocity = slightly longer release

  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(velocity * 0.5, now + attack); // attack
  masterGain.gain.linearRampToValueAtTime(velocity * 0.35, now + decay); // decay
  masterGain.gain.linearRampToValueAtTime(0, now + decay + release);      // release

  masterGain.connect(panNode).connect(audioCtx.destination);

  // --- Oscillators with subtle detune ---
  const osc1 = audioCtx.createOscillator();
  osc1.type = "triangle";
  osc1.frequency.setValueAtTime(freq, now);
  osc1.detune.value = (Math.random() - 0.5) * 4; // ±2 cents
  osc1.connect(masterGain);
  osc1.start(now);

  const osc2 = audioCtx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(freq, now);
  osc2.detune.value = (Math.random() - 0.5) * 4; // ±2 cents
  const gain2 = audioCtx.createGain();
  gain2.gain.value = velocity * 0.4;
  osc2.connect(gain2).connect(masterGain);
  osc2.start(now);

  const noteObj = { osc1, osc2, gainNode: masterGain, panNode };

  // Stop function: faster release for rapid key presses
  noteObj.stop = function() {
    const t = audioCtx.currentTime;
    this.gainNode.gain.cancelScheduledValues(t);
    this.gainNode.gain.linearRampToValueAtTime(0, t + 0.3);
    setTimeout(() => {
  try {
    this.gainNode.disconnect();
    this.panNode.disconnect();
  } catch(e) {}
}, 400);
    try { this.osc1.stop(t + 0.3); this.osc2.stop(t + 0.3); } catch(e) {}
  };

  activeNotes.set(note, noteObj);

if (window.staffNoteOn) window.staffNoteOn(note);
}

function stopNote(note) {
  const noteObj = activeNotes.get(note);
  if (!noteObj) return;

  noteObj.stop();
  activeNotes.delete(note);

  if (window.staffNoteOff) window.staffNoteOff(note);
}

window.playPianoNote = playNote;
window.stopPianoNote = stopNote;
    
  function attachKeyEvents() {
  [...whiteKeys, ...blackKeys].forEach(k => {
    const note = k.dataset.note;

    // Mouse
    k.addEventListener("mousedown", e => {
  e.preventDefault();
  k.classList.add("pressed");
  playNote(note);
});

k.addEventListener("mouseup", e => {
  e.preventDefault();
  k.classList.remove("pressed");
  stopNote(note);
});

k.addEventListener("mouseleave", () => {
  k.classList.remove("pressed");
  stopNote(note);
});

// Touch events
k.addEventListener("touchstart", e => {
  e.preventDefault();
  k.classList.add("pressed");
  playNote(note);
}, { passive: false });

k.addEventListener("touchend", e => {
  e.preventDefault();
  k.classList.remove("pressed");
  stopNote(note);
});

    k.addEventListener("touchcancel", () => {
      stopNote(note);
    });
  });
}
    
  // helper: get visual center of piano content
function getCenterRatio() {
  const centerX = pianoWrapper.scrollLeft + pianoWrapper.clientWidth / 2;
  return centerX / pianoWrapper.scrollWidth;
}

function restoreCenterFromRatio(ratio) {
  const newCenterX = ratio * pianoWrapper.scrollWidth;
  const newScroll = newCenterX - pianoWrapper.clientWidth / 2;

  const maxScroll =
    pianoWrapper.scrollWidth - pianoWrapper.clientWidth;

  pianoWrapper.scrollLeft = Math.min(
    Math.max(newScroll, 0),
    maxScroll
  );
}

function getExactFitKeyWidth() {
  return (
    pianoWrapper.clientWidth
    - (whiteKeys.length - 1) * whiteKeySpacing
  ) / whiteKeys.length;
}

function zoomKeys(factor) {
  const centerRatio = getCenterRatio();

  const MAX_KEY_WIDTH = 110;

  let newKeyWidth = keyWidth * factor;

  const fitKeyWidth = getExactFitKeyWidth();

  // ✅ Clamp ONLY to full-fit size when zooming out
  if (newKeyWidth < fitKeyWidth) {
    newKeyWidth = fitKeyWidth;
  }

  // ✅ Clamp max
  if (newKeyWidth > MAX_KEY_WIDTH) {
    newKeyWidth = MAX_KEY_WIDTH;
  }

  keyWidth = newKeyWidth;
  
  blackKeyWidth = keyWidth * 0.65;
  updateKeyLabelSize();   // ← ADD THIS


  applyLayout({ preserveCenter: true });
  
window.piano.notifyLayoutChange();
}
    
  document.getElementById('zoom-in').onclick=()=>zoomKeys(1.2);    
  document.getElementById('zoom-out').onclick=()=>zoomKeys(1/1.2);    
    
  // --- Scroll / Thumb logic ---    
   
  function updateThumb(){    
    const trackWidth=scrollBar.clientWidth;    
    const ratio=pianoWrapper.clientWidth/pianoWrapper.scrollWidth;    
    scrollThumb.style.width=Math.max(ratio*trackWidth,20)+'px';    
    const maxScroll=pianoWrapper.scrollWidth-pianoWrapper.clientWidth;    
    const clampedScroll = Math.min(Math.max(pianoWrapper.scrollLeft, 0), maxScroll);
    scrollThumb.style.left=(clampedScroll/Math.max(maxScroll,1))*(trackWidth-scrollThumb.clientWidth)+'px';    
  }    
    
  pianoWrapper.addEventListener('scroll', function () {
  updateThumb();
  window.piano.notifyLayoutChange();
});
    
  let isDragging=false, startX, startLeft;    
  function startDrag(x){ isDragging=true; startX=x; startLeft=parseFloat(scrollThumb.style.left)||0; }    
  function moveDrag(x){ if(!isDragging) return; const dx=x-startX; const trackWidth=scrollBar.clientWidth; const newLeft=Math.min(Math.max(startLeft+dx,0),trackWidth-scrollThumb.clientWidth); scrollThumb.style.left=newLeft+'px'; pianoWrapper.scrollLeft=(newLeft/(trackWidth-scrollThumb.clientWidth))*(pianoWrapper.scrollWidth-pianoWrapper.clientWidth); }    
  function endDrag(){ isDragging=false; }    
  scrollThumb.addEventListener('mousedown', e=>{startDrag(e.clientX); e.preventDefault();});    
  document.addEventListener('mousemove', e=>moveDrag(e.clientX));    
  document.addEventListener('mouseup', endDrag);    
  scrollThumb.addEventListener('touchstart', e=>{startDrag(e.touches[0].clientX); e.preventDefault();});    
  document.addEventListener('touchmove', e=>{if(isDragging){moveDrag(e.touches[0].clientX); e.preventDefault();}}, {passive:false});    
  document.addEventListener('touchend', endDrag);    
  scrollBar.addEventListener('click', e=>{ if(e.target===scrollThumb) return; const rect=scrollBar.getBoundingClientRect(); const clickX=e.clientX-rect.left; const trackWidth=scrollBar.clientWidth; const thumbW=scrollThumb.clientWidth; const newLeft=Math.min(Math.max(clickX-thumbW/2,0),trackWidth-thumbW); scrollThumb.style.left=newLeft+'px'; pianoWrapper.scrollLeft=(newLeft/(trackWidth-thumbW))*(pianoWrapper.scrollWidth-pianoWrapper.clientWidth); });    
    
  btnScrollLeftOct.onclick = () => {
  pianoWrapper.scrollLeft = Math.max(
    pianoWrapper.scrollLeft - keyWidth * 7,
    0
  );
  updateThumb();
};

btnScrollRightOct.onclick = () => {
  const maxScroll = pianoWrapper.scrollWidth - pianoWrapper.clientWidth;
  pianoWrapper.scrollLeft = Math.min(
    pianoWrapper.scrollLeft + keyWidth * 7,
    maxScroll
  );
  updateThumb();
};

btnScrollLeftKey.onclick = () => {
  pianoWrapper.scrollLeft = Math.max(
    pianoWrapper.scrollLeft - keyWidth,
    0
  );
  updateThumb();
};

btnScrollRightKey.onclick = () => {
  const maxScroll = pianoWrapper.scrollWidth - pianoWrapper.clientWidth;
  pianoWrapper.scrollLeft = Math.min(
    pianoWrapper.scrollLeft + keyWidth,
    maxScroll
  );
  updateThumb();
};


  window.addEventListener('load', () => {
  applyLayout({ centerGeometry: true });
});
window.addEventListener('resize', () => {
  setInitialKeyWidth();
  applyLayout({ centerGeometry: true });
});
  // --- Access individual key attributes ---    
  function getKeyAttributes(note){    
    const key=[...whiteKeys,...blackKeys].find(k=>k.dataset.note===note);    
    if(!key) return null;    
    return {    
      note: key.dataset.note,    
      width: parseFloat(key.style.width),    
      height: parseFloat(key.style.height),    
      left: parseFloat(key.style.left),    
      top: parseFloat(key.style.top)||0,    
      midPoint: parseFloat(key.style.left)+parseFloat(key.style.width)/2    
    };    
  }    
  
    
  window.piano = {
  // layout
  whiteKeys,
  blackKeys,
  keyOrder,
  pianoWrapper,
  pianoContainer,

  // measurements
  getKeyWidth: () => keyWidth,
  getWhiteKeySpacing: () => whiteKeySpacing,
  getScrollLeft: () => pianoWrapper.scrollLeft,
  getScrollWidth: () => pianoWrapper.scrollWidth,
  getClientWidth: () => pianoWrapper.clientWidth,

  // layout helpers
  getCMidpoint: function () {
    const c4 = whiteKeys.find(k => k.dataset.note === 'C4');
    if (!c4) return 0;
    return parseFloat(c4.style.left) + keyWidth / 2;
  },

  onLayoutChange: function (fn) {
    this._layoutCallback = fn;
  },

  notifyLayoutChange: function () {
    if (this._layoutCallback) this._layoutCallback();
  }
};
      
})();
