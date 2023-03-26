// Utility functions
function getMousePosition(evt) {
  let CTM = svg.getScreenCTM();
  return {
    x: (evt.clientX - CTM.e) / CTM.a,
    y: (evt.clientY - CTM.f) / CTM.d,
  };
}

// Create an SVG circle and add it to the canvas
let svg = document.getElementById("svgCanvas");
let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circle.setAttribute("cx", 50);
circle.setAttribute("cy", 50);
circle.setAttribute("r", 25);
circle.setAttribute("fill", "red");
svg.appendChild(circle);

// Variables to store the starting position and the object
let startPos = null;
let draggedObject = null;

// Event listeners
circle.addEventListener("mousedown", startDrag);
circle.addEventListener("mousemove", drag);
circle.addEventListener("mouseup", endDrag);
circle.addEventListener("mouseleave", endDrag);

function startDrag(event) {
  startPos = getMousePosition(event);
  draggedObject = event.target;
}

function drag(event) {
  if (draggedObject) {
    event.preventDefault();

    let mousePos = getMousePosition(event);
    let dx = mousePos.x - startPos.x;
    let dy = mousePos.y - startPos.y;
    let newX = parseFloat(draggedObject.getAttribute("cx")) + dx;
    let newY = parseFloat(draggedObject.getAttribute("cy")) + dy;

    // Check for canvas boundaries and expand if needed
    let radius = parseFloat(draggedObject.getAttribute("r"));
    let svgWidth = parseFloat(svg.getAttribute("width"));
    let svgHeight = parseFloat(svg.getAttribute("height"));

    if (newX + radius > svgWidth - 10) {
      svg.setAttribute("width", svgWidth + 50);
    } else if (newX - radius < 10) {
      svg.setAttribute("width", svgWidth + 50);
    }

    if (newY + radius > svgHeight - 10) {
      svg.setAttribute("height", svgHeight + 50);
    } else if (newY - radius < 10) {
      svg.setAttribute("height", svgHeight + 50);
    }

    // Update circle position
    draggedObject.setAttribute("cx", newX);
    draggedObject.setAttribute("cy", newY);

    startPos = mousePos;
  }
}

function endDrag() {
  startPos = null;
  draggedObject = null;
}
