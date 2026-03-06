(function(){

  // ===== Dynamic CSS =====
  const circleCss = `
#circle-wrapper {
  z-index: 10;
  position: relative;
  aspect-ratio: 1/1;
  width: 90%;
}


#circle-wrapper svg {
  width: 100%;
  height: 100%;
  touch-action: none;
}

.wedge {
  fill: #d9d9d9;
  stroke: #111;
  stroke-width: 2;
}

.label {
  font-family: system-ui, sans-serif;
  font-weight: 700;
  font-size: 75px;
  text-anchor: middle;
  dominant-baseline: middle;
  pointer-events: none;
  user-select: none;
}

.outer-ring {
  fill: none;
  stroke: #111;
  stroke-width: 8;
}
`;
let visualRotation = 0;
let labelGroups = [];

  const style = document.createElement("style");
  style.textContent = circleCss;
  document.head.appendChild(style);

  // ===== Wrapper =====
  const wrapper = document.createElement("div");
  wrapper.id = "circle-wrapper";
  wrapper.style.flex = "0 0 auto"; // prevents shrinking if you want fixed width
document.getElementById("left-column").appendChild(wrapper);

  // ===== SVG =====
const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("viewBox", "0 0 800 800");
wrapper.appendChild(svg);

// ===== Rotating Group =====
const wheelGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
wheelGroup.setAttribute("id","wheel-group");
svg.appendChild(wheelGroup);

  // ===== Geometry =====
  const cx = 400, cy = 400;
  const outerRadius = 360, innerRadius = 200;
  const step = (Math.PI*2)/12;

  // ===== Cycles =====
  let rotationIndex = 0; // real, unbounded
const keyMap = {
  "-11": "G",
  "-10": "D",
  "-9":  "A",
  "-8":  "E",
  "-7":  "Cb",
  "-6":  "Gb",
  "-5":  "Db",
  "-4":  "Ab",
  "-3":  "Eb",
  "-2":  "Bb",
  "-1":  "F",
   "0":  "C",
   "1":  "G",
   "2":  "D",
   "3":  "A",
   "4":  "E",
   "5":  "B",
   "6":  "F#",
   "7":  "C#",
   "8":  "Ab",
   "9":  "Eb",
  "10":  "Bb",
  "11":  "F"
};
  let isDragging = false;
  let lastAngle = null;

  // ===== Helpers =====
  function polar(angle, r){
    return {
      x: cx + r*Math.cos(angle),
      y: cy + r*Math.sin(angle)
    };
  }

  function createWedge(start, end){
    const p1 = polar(start, outerRadius);
    const p2 = polar(end, outerRadius);
    const p3 = polar(end, innerRadius);
    const p4 = polar(start, innerRadius);

    return `
      M ${p1.x} ${p1.y}
      A ${outerRadius} ${outerRadius} 0 0 1 ${p2.x} ${p2.y}
      L ${p3.x} ${p3.y}
      A ${innerRadius} ${innerRadius} 0 0 0 ${p4.x} ${p4.y}
      Z
    `;
  }

  function normalizeIndex(i){
    return (i + 12) % 12;
  }

  function getAngle(x,y){
    const rect = svg.getBoundingClientRect();
    const px = x - rect.left;
    const py = y - rect.top;
    return Math.atan2(py - rect.height/2, px - rect.width/2);
  }

  function updateCenterAndBroadcast(){

  // 🔹 Use raw integer for key lookup
  const key = keyMap[rotationIndex];

  centerText.textContent = key;

  if (window.staffSetKey) {
    window.staffSetKey(key);
  }
}
function normalizeToCycle(n){
  let mod = n % 12;
  if(mod > 6) mod -= 12;
  if(mod < -6) mod += 12;
  return mod;
}
  function rotateWheel(delta){

  if(delta > 0){
    rotationIndex--;   // clockwise = negative
    visualRotation += 30;
  } else {
    rotationIndex++;   // counter-clockwise = positive
    visualRotation -= 30;
  }

  // rotate wheel physically
  wheelGroup.setAttribute(
    "transform",
    `rotate(${visualRotation} 400 400)`
  );

  // counter rotate labels
  labelGroups.forEach(group=>{
    group.setAttribute(
      "transform",
      group.getAttribute("transform").split(" rotate")[0] +
      ` rotate(${-visualRotation})`
    );
  });

  updateCenterAndBroadcast();
}

  // ===== Draw Outer Ring =====
  const outerCircle = document.createElementNS("http://www.w3.org/2000/svg","circle");
  outerCircle.setAttribute("cx",cx);
  outerCircle.setAttribute("cy",cy);
  outerCircle.setAttribute("r",outerRadius);
  outerCircle.setAttribute("class","outer-ring");
  wheelGroup.appendChild(outerCircle);

  // ===== Draw Wedges (visual only) =====
  const displayKeys = [
    { primary:"C" },
    { primary:"G" },
    { primary:"D" },
    { primary:"A" },
    { primary:"E" },
    { primary:"B", enharmonic:"C♭" },
    { primary:"F♯", enharmonic:"G♭" },
    { primary:"C♯", enharmonic:"D♭" },
    { primary:"A♭" },
    { primary:"E♭" },
    { primary:"B♭" },
    { primary:"F" }
  ];

  displayKeys.forEach((key,i)=>{
    const baseStart = -Math.PI/2 - step/2;
const start = baseStart + i * step;
const end = start + step;
const mid = start + step/2;

    const path=document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute("d",createWedge(start,end));
    path.setAttribute("class","wedge");
    wheelGroup.appendChild(path);

    const labelPos = polar(mid,(outerRadius+innerRadius)/2);

// Create label group
const labelGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
labelGroup.setAttribute("transform", `translate(${labelPos.x}, ${labelPos.y})`);

// Create text
const text=document.createElementNS("http://www.w3.org/2000/svg","text");
text.setAttribute("class","label");
text.setAttribute("x",0);
text.setAttribute("y",0);

if(key.enharmonic){
  const t1=document.createElementNS("http://www.w3.org/2000/svg","tspan");
  t1.setAttribute("x",0);
  t1.setAttribute("dy","-0.3em");
  t1.textContent=key.primary;

  const t2=document.createElementNS("http://www.w3.org/2000/svg","tspan");
  t2.setAttribute("x",0);
  t2.setAttribute("dy","0.85em");
  t2.textContent=key.enharmonic;

  text.appendChild(t1);
  text.appendChild(t2);
} else {
  text.textContent = key.primary;
}

labelGroup.appendChild(text);
wheelGroup.appendChild(labelGroup);

// Store for counter rotation
labelGroups.push(labelGroup);
  });

  // ===== Center Circle =====
  const centerButton = document.createElementNS("http://www.w3.org/2000/svg","circle");
  centerButton.setAttribute("cx",cx);
  centerButton.setAttribute("cy",cy);
  centerButton.setAttribute("r",innerRadius);
  centerButton.setAttribute("fill","#ffffff");
  centerButton.setAttribute("stroke","#111");
  centerButton.setAttribute("stroke-width","6");
  svg.appendChild(centerButton);

  const centerText = document.createElementNS("http://www.w3.org/2000/svg","text");
  centerText.setAttribute("x",cx);
  centerText.setAttribute("y",cy);
  centerText.setAttribute("text-anchor","middle");
  centerText.setAttribute("dy","0.35em");
  centerText.setAttribute("font-weight","700");
  centerText.setAttribute("font-family","system-ui, sans-serif");
  centerText.setAttribute("font-size",innerRadius*1);
  centerText.textContent = "C";
  svg.appendChild(centerText);
  centerText.style.userSelect = "none";

  // Initial broadcast
  updateCenterAndBroadcast();

// ===== Pointer Rotation =====

svg.addEventListener("pointerdown", (e) => {
  svg.setPointerCapture(e.pointerId);
  isDragging = true;
  lastAngle = getAngle(e.clientX, e.clientY);
});

svg.addEventListener("pointermove",(e)=>{
  if(!isDragging) return;

  const angle = getAngle(e.clientX, e.clientY);

  let delta = angle - lastAngle;

  // 🔥 Fix angle wrapping at -π / +π boundary
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;

  const deltaDeg = delta * (180 / Math.PI);

  visualRotation += deltaDeg;

  wheelGroup.setAttribute(
    "transform",
    `rotate(${visualRotation} 400 400)`
  );

  labelGroups.forEach(group=>{
    group.setAttribute(
      "transform",
      group.getAttribute("transform").split(" rotate")[0] +
      ` rotate(${-visualRotation})`
    );
  });

  lastAngle = angle;
});

svg.addEventListener("pointerup",()=>{
  if(!isDragging) return;
  isDragging = false;

  const stepAngle = 30;

  const snappedSteps = Math.round(visualRotation / stepAngle);

  // rotationIndex reflects real signed position
  rotationIndex = -snappedSteps;
  
if (rotationIndex < -11) rotationIndex = 0;
if (rotationIndex > 11) rotationIndex = 0;

  // visual rotation reflects exact snapped steps
  visualRotation = -rotationIndex * stepAngle;

  wheelGroup.setAttribute(
    "transform",
    `rotate(${visualRotation} 400 400)`
  );

  labelGroups.forEach(group=>{
    group.setAttribute(
      "transform",
      group.getAttribute("transform").split(" rotate")[0] +
      ` rotate(${-visualRotation})`
    );
  });

  updateCenterAndBroadcast();
});

svg.addEventListener("pointerleave",()=>{
  isDragging = false;
});

})();