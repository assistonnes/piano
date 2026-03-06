// keyboard.js
(function(){

const keyMap = {
  "1": "C4",
  "2": "D4",
  "3": "E4",
  "4": "F4",
  "5": "G4",
  "6": "A4",
  "7": "B4",

  "!": "C#4",
  "@": "D#4",
  "#": "F#4",
  "$": "G#4",
  "%": "A#4"
};

document.addEventListener("keydown", function(e){

  if(e.repeat) return;

  const note = keyMap[e.key];

  if(note){
    e.preventDefault();
    playPianoNote(note);
  }

});

document.addEventListener("keyup", function(e){

  const note = keyMap[e.key];

  if(note){
    stopPianoNote(note);
  }

});

})();