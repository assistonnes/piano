// keyboard.js
(function(){

const keyMap = {
  "1": "C",
  "2": "D",
  "3": "E",
  "4": "F",
  "5": "G",
  "6": "A",
  "7": "B",

  "!": "C#",
  "@": "D#",
  "#": "F#",
  "$": "G#",
  "%": "A#"
};

let currentOctave = 4;

const pressedKeys = new Set();

document.addEventListener("keydown", function(e){

  // ----- OCTAVE SHIFT LEFT -----

  if(e.key === "ArrowLeft"){

    e.preventDefault();

    if(!window.piano) return;

    const wrapper = window.piano.pianoWrapper;
    const keyWidth = window.piano.getKeyWidth();

    const newScroll = wrapper.scrollLeft - keyWidth * 7;

    // stop if already at edge
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

    // stop if already at edge
    if(newScroll > maxScroll) return;

    wrapper.scrollLeft = newScroll;
    currentOctave++;

    return;
  }

  // ----- NOTE PLAY -----

  const pitch = keyMap[e.key];
  if(!pitch) return;

  if(pressedKeys.has(e.key)) return;

  const note = pitch + currentOctave;

  pressedKeys.add(e.key);

  e.preventDefault();
  pressPianoKey(note);

});

document.addEventListener("keyup", function(e){

  const pitch = keyMap[e.key];
  if(!pitch) return;

  const note = pitch + currentOctave;

  pressedKeys.delete(e.key);

  releasePianoKey(note);

});

window.addEventListener("blur", function(){

  pressedKeys.forEach(key=>{
    const pitch = keyMap[key];
    if(pitch){
      const note = pitch + currentOctave;
      releasePianoKey(note);
    }
  });

  pressedKeys.clear();

});

})();