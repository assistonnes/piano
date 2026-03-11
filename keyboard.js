// keyboard.js
(function(){

const MAJOR_SCALE = [0,2,4,5,7,9,11];

const NOTES = [
"C","C#","D","D#","E","F",
"F#","G","G#","A","A#","B"
];

let currentKey = "C";
let scaleNotes = [];

let currentOctave = 4;

const pressedKeys = new Set();

const keyMap = {
  "1":0,"2":1,"3":2,"4":3,"5":4,"6":5,"7":6,
  "!":0,"@":1,"#":3,"$":4,"%":5
};

// Build scale for current key
function buildScale(key){

  const rootIndex = NOTES.indexOf(key);
  if(rootIndex === -1) return;

  scaleNotes = MAJOR_SCALE.map(step=>{
    return NOTES[(rootIndex + step) % 12];
  });

}

// Subscribe to key changes
if(window.__KEY_STATE__){

  currentKey = window.__KEY_STATE__.key;
  buildScale(currentKey);

  window.__KEY_STATE__.subscribe(function(newKey){
    currentKey = newKey;
    buildScale(newKey);
  });

}

// ----- KEYBOARD INPUT -----

document.addEventListener("keydown", function(e){

  // OCTAVE LEFT
  if(e.key === "ArrowLeft"){

    if(!window.piano) return;

    const wrapper = window.piano.pianoWrapper;
    const keyWidth = window.piano.getKeyWidth();

    const newScroll = wrapper.scrollLeft - keyWidth * 7;

    if(newScroll < 0) return;

    wrapper.scrollLeft = newScroll;
    currentOctave--;

    e.preventDefault();
    return;
  }

  // OCTAVE RIGHT
  if(e.key === "ArrowRight"){

    if(!window.piano) return;

    const wrapper = window.piano.pianoWrapper;
    const keyWidth = window.piano.getKeyWidth();

    const maxScroll = wrapper.scrollWidth - wrapper.clientWidth;
    const newScroll = wrapper.scrollLeft + keyWidth * 7;

    if(newScroll > maxScroll) return;

    wrapper.scrollLeft = newScroll;
    currentOctave++;

    e.preventDefault();
    return;
  }

  const scaleIndex = keyMap[e.key];
  if(scaleIndex === undefined) return;

  if(pressedKeys.has(e.key)) return;

  const pitch = scaleNotes[scaleIndex];
  const note = pitch + currentOctave;

  pressedKeys.add(e.key);

  e.preventDefault();
  pressPianoKey(note);

});

document.addEventListener("keyup", function(e){

  const scaleIndex = keyMap[e.key];
  if(scaleIndex === undefined) return;

  const pitch = scaleNotes[scaleIndex];
  const note = pitch + currentOctave;

  pressedKeys.delete(e.key);

  releasePianoKey(note);

});

window.addEventListener("blur", function(){

  pressedKeys.forEach(key=>{
    const scaleIndex = keyMap[key];
    if(scaleIndex !== undefined){
      const pitch = scaleNotes[scaleIndex];
      const note = pitch + currentOctave;
      releasePianoKey(note);
    }
  });

  pressedKeys.clear();

});

})();