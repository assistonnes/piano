// keyboard.js
(function(){

const NOTES = [
"C","C#","D","D#","E","F",
"F#","G","G#","A","A#","B"
];

const MAJOR_STEPS = [0,2,4,5,7,9,11];

const FLAT_TO_SHARP = {
"Db":"C#",
"Eb":"D#",
"Gb":"F#",
"Ab":"G#",
"Bb":"A#"
};

let currentKey = "C";
let scale = [];

let currentOctave = 4;

const pressedKeys = new Set();

// keyboard → scale degree
const keyMap = {
"1":0,"2":1,"3":2,"4":3,"5":4,"6":5,"7":6,
"!":0,"@":1,"#":3,"$":4,"%":5
};

function normalizeKey(key){

if(!key) return "C";

key = key.trim();

if(FLAT_TO_SHARP[key]) return FLAT_TO_SHARP[key];

return key;

}

function buildScale(key){

key = normalizeKey(key);

const rootIndex = NOTES.indexOf(key);

if(rootIndex === -1){
scale = ["C","D","E","F","G","A","B"];
return;
}

scale = MAJOR_STEPS.map(step=>{
return NOTES[(rootIndex + step) % 12];
});

}

// initial scale
buildScale(currentKey);

// subscribe to key changes
if (window.__KEY_STATE__) {

  // Initial key
  currentKey = normalizeKey(window.__KEY_STATE__.key);
  buildScale(currentKey);

  console.log("Keyboard initial key:", currentKey);

  // Listen for updates
  window.__KEY_STATE__.subscribe((newKey, source) => {

    const normalized = normalizeKey(newKey);

    currentKey = normalized;
    buildScale(currentKey);

    console.log("Keyboard updated key:", currentKey, "from", source);

  });

}

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

const scaleIndex = keyMap[e.key];

if(scaleIndex === undefined) return;

if(pressedKeys.has(e.key)) return;

const pitch = scale[scaleIndex];

if(!pitch) return;

const note = pitch + currentOctave;

pressedKeys.add(e.key);

e.preventDefault();

pressPianoKey(note);

});

document.addEventListener("keyup", function(e){

const scaleIndex = keyMap[e.key];

if(scaleIndex === undefined) return;

const pitch = scale[scaleIndex];

if(!pitch) return;

const note = pitch + currentOctave;

pressedKeys.delete(e.key);

releasePianoKey(note);

});

window.addEventListener("blur", function(){

pressedKeys.forEach(key=>{

const scaleIndex = keyMap[key];

if(scaleIndex === undefined) return;

const pitch = scale[scaleIndex];

if(!pitch) return;

const note = pitch + currentOctave;

releasePianoKey(note);

});

pressedKeys.clear();

});

})();