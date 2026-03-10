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

const pressedKeys = new Set();

document.addEventListener("keydown", function(e){

  const note = keyMap[e.key];
  if(!note) return;

  // prevent duplicate firing
  if(pressedKeys.has(e.key)) return;

  pressedKeys.add(e.key);

  e.preventDefault();
  pressPianoKey(note);

});

document.addEventListener("keyup", function(e){

  const note = keyMap[e.key];
  if(!note) return;

  pressedKeys.delete(e.key);

  releasePianoKey(note);

});

window.addEventListener("blur", function(){

  pressedKeys.forEach(key=>{
    const note = keyMap[key];
    if(note){
      releasePianoKey(note);
    }
  });

  pressedKeys.clear();

});

})();