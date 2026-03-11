// keyboard.js
(function(){

// scale degrees
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

// chromatic scale
const notes = [
"C","C#","D","D#","E","F","F#","G","G#","A","A#","B"
];

// selectable key (default C)
let currentKey = "E";

let currentOctave = 4;

const pressedKeys = new Set();

// change key externally
window.setKeyboardKey = function(key){
  if(notes.includes(key)){
    currentKey = key;
  }
};

// convert degree -> note
function getNoteFromDegree(degree){

  const keyIndex = notes.indexOf(currentKey);

  const noteIndex = (keyIndex + degree) % 12;

  return notes[noteIndex];
}

document.addEventListener("keydown", function(e){

  // ----- OCTAVE SHIFT LEFT -----

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

  // ----- OCTAVE SHIFT RIGHT -----

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

document.addEventListener("keyup", function(e){

  const degree = degreeMap[e.key];
  if(degree === undefined) return;

  const pitch = getNoteFromDegree(degree);
  const note = pitch + currentOctave;

  pressedKeys.delete(e.key);

  releasePianoKey(note);

});

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