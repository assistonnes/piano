// keyboard.js
(function(){

// ---------- SCALE DEGREE MAP ----------
const degreeMap = {
  "1": 0,
  "2": 2,
  "3": 4,
  "4": 5,
  "5": 7,
  "6": 9,
  "7": 11,

  "!": 1,
  "@": 3,
  "#": 6,
  "$": 8,
  "%": 10
};

// ---------- CHROMATIC NOTES ----------
const notes = [
"C","C#","D","D#","E","F","F#","G","G#","A","A#","B"
];

// ---------- STATE ----------
let currentKey = "C";
let currentOctave = 4;

const pressedKeys = new Set();

// ---------- KEY SELECTOR UI ----------

function createKeySelector(){

  const bar = document.createElement("div");
  bar.id = "key-selector";

  bar.style.display = "flex";
  bar.style.alignItems = "center";
  bar.style.gap = "0.5rem";
  bar.style.padding = "0.3rem 0.6rem";
  bar.style.fontFamily = "Arial";
  bar.style.fontSize = "1rem";

  const label = document.createElement("span");
  label.textContent = "Key:";

  const select = document.createElement("select");

  notes.forEach(n=>{
    const opt = document.createElement("option");
    opt.value = n;
    opt.textContent = n;
    select.appendChild(opt);
  });

  select.value = currentKey;

  select.addEventListener("change", ()=>{
    currentKey = select.value;
  });

  bar.appendChild(label);
  bar.appendChild(select);

  document.body.prepend(bar);
}

createKeySelector();

// ---------- NOTE CALCULATION ----------

function getNoteFromDegree(degree){

  const keyIndex = notes.indexOf(currentKey);

  const noteIndex = (keyIndex + degree) % 12;

  return notes[noteIndex];
}

// ---------- KEYBOARD INPUT ----------

document.addEventListener("keydown", function(e){

  // ----- OCTAVE LEFT -----

  if(e.key === "ArrowLeft"){

    e.preventDefault();

    if(!window.piano) return;

    const wrapper = window.piano.pianoWrapper;
    const keyWidth = window.piano.getKeyWidth();

    const newScroll = wrapper.scrollLeft - keyWidth * 7;

    if(newScroll < 0) return;

    wrapper.scrollLeft = newScroll;
    currentOctave--;

    return;
  }

  // ----- OCTAVE RIGHT -----

  if(e.key === "ArrowRight"){

    e.preventDefault();

    if(!window.piano) return;

    const wrapper = window.piano.pianoWrapper;
    const keyWidth = window.piano.getKeyWidth();

    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;

    const newScroll = wrapper.scrollLeft + keyWidth * 7;

    if(newScroll > maxScroll) return;

    wrapper.scrollLeft = newScroll;
    currentOctave++;

    return;
  }

  // ----- NOTE PLAY -----

  const degree = degreeMap[e.key];
  if(degree === undefined) return;

  if(pressedKeys.has(e.key)) return;

  const pitch = getNoteFromDegree(degree);
  const note = pitch + currentOctave;

  pressedKeys.add(e.key);

  e.preventDefault();
  pressPianoKey(note);

});

// ---------- KEY RELEASE ----------

document.addEventListener("keyup", function(e){

  const degree = degreeMap[e.key];
  if(degree === undefined) return;

  const pitch = getNoteFromDegree(degree);
  const note = pitch + currentOctave;

  pressedKeys.delete(e.key);

  releasePianoKey(note);

});

// ---------- WINDOW BLUR ----------

window.addEventListener("blur", function(){

  pressedKeys.forEach(key=>{
    const degree = degreeMap[key];
    if(degree !== undefined){
      const pitch = getNoteFromDegree(degree);
      const note = pitch + currentOctave;
      releasePianoKey(note);
    }
  });

  pressedKeys.clear();

});

})();