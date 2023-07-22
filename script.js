const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let color = "#000000";
let brushSize = 5;
let zoomLevel = 1;
let brushType = "round";
let currentShape = null;
let startingPoint = null; 
const SPRAY_RADIUS = 20;
const SPRAY_DENSITY = 50;
const undoStack = [];
const redoStack = [];

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseout", stopDrawing);

document.getElementById("undo").addEventListener("click", undo);
document.getElementById("redo").addEventListener("click", redo);
document.getElementById("color-picker").addEventListener("input", updateColor);
document.getElementById("brush-size").addEventListener("input", updateBrushSize);
document.getElementById("eraser").addEventListener("click", useEraser);
document.getElementById("clear").addEventListener("click", clearCanvas);
document.getElementById("brush-type").addEventListener("change", function (e) { 
    brushType = e.target.value; 
    currentShape = null; 
});
document.getElementById("zoom-in").addEventListener("click", zoomIn);
document.getElementById("zoom-out").addEventListener("click", zoomOut);
document.getElementById("upload-image").addEventListener("change", handleImageInput);
document.getElementById("save").addEventListener("click", saveImage);
document.getElementById("shape-selector").addEventListener("click", function() {
  const shapeOptions = document.getElementById("shape-options");
  shapeOptions.style.display = shapeOptions.style.display === "none" ? "block" : "none";
});

document.getElementById("shape-select").addEventListener("change", function(e) {
  currentShape = e.target.value;
});

function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  if (currentShape) {
      startingPoint = { x: offsetX, y: offsetY };
      return;
  }

  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY);
}

function stopDrawing(e) {
  isDrawing = false;

  if (currentShape) {
      const rect = canvas.getBoundingClientRect();
      const endX = e.clientX - rect.left;
      const endY = e.clientY - rect.top;
      drawShape(startingPoint, { x: endX, y: endY });
      startingPoint = null;
      currentShape = null;  // Reset the currentShape
  } else {
      ctx.beginPath();
  }
}

function draw(e) {
  if (currentShape) return;  // Do not draw if a shape is selected

  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  if (offsetX < 0 || offsetX > canvas.width || offsetY < 0 || offsetY > canvas.height) return;

  ctx.lineWidth = brushSize;
  ctx.strokeStyle = color;
  ctx.lineCap = brushType === 'square' ? 'butt' : 'round';;

    switch (brushType) {
        case 'pen':
        case 'round':
        case 'square':
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            break;
        case 'brush':
            for (let i = -10; i < 10; i += 4) {
                ctx.lineTo(offsetX + i, offsetY + i);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(offsetX + i, offsetY + i);
            }
            break;
        case 'spray':
            for (let i = 0; i < SPRAY_DENSITY; i++) {
                const angle = getRandomFloat(0, 2 * Math.PI);
                const distance = getRandomFloat(0, SPRAY_RADIUS);
                ctx.fillRect(
                    offsetX + distance * Math.cos(angle),
                    offsetY + distance * Math.sin(angle),
                    1, 1
                );
            }
            break;
        }
}


function drawShape(start, end) {
  ctx.strokeStyle = color;
  ctx.lineWidth = brushSize;
  switch (currentShape) {
    case 'rectangle':
        ctx.strokeRect(startingPoint.x, startingPoint.y, endX - startingPoint.x, endY - startingPoint.y);
        break;
    case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startingPoint.x, 2) + Math.pow(endY - startingPoint.y, 2));
        ctx.beginPath();
        ctx.arc(startingPoint.x, startingPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
        break;
    case 'triangle':
        ctx.beginPath();
        ctx.moveTo(startingPoint.x, startingPoint.y);
        ctx.lineTo(endX, startingPoint.y);
        ctx.lineTo((startingPoint.x + endX) / 2, endY);
        ctx.closePath();
        ctx.stroke();
        break;
    case 'line':
        ctx.beginPath();
        ctx.moveTo(startingPoint.x, startingPoint.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        break;
    case 'ellipse':
        ctx.beginPath();
        ctx.ellipse((startingPoint.x + endX) / 2, (startingPoint.y + endY) / 2, Math.abs((endX - startingPoint.x) / 2), Math.abs((endY - startingPoint.y) / 2), 0, 0, 2 * Math.PI);
        ctx.stroke();
        break;
    case 'star':
        ctx.beginPath();
        const spikes = 5;
        const step = Math.PI / spikes;
        let rot = Math.PI / 2 * 3;
        let x = startingPoint.x;
        let y = startingPoint.y;
        const outerRadius = Math.sqrt(Math.pow(endX - startingPoint.x, 2) + Math.pow(endY - startingPoint.y, 2));
        const innerRadius = outerRadius / 2;
        for (let i = 0; i < spikes; i++) {
            x = startingPoint.x + Math.cos(rot) * outerRadius;
            y = startingPoint.y + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            x = startingPoint.x + Math.cos(rot) * innerRadius;
            y = startingPoint.y + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(startingPoint.x, startingPoint.y - outerRadius);
        ctx.stroke();
        break;
}
}


function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

function updateColor(e) {
    color = e.target.value;
}

function updateBrushSize(e) {
    brushSize = e.target.value;
}

function useEraser() {
    color = "#ffffff"; // Set the color to white for eraser
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function adjustCanvasPosition() {
    const offsetX = (canvas.width - canvas.width * zoomLevel) / 2;
    const offsetY = (canvas.height - canvas.height * zoomLevel) / 2;
    canvas.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
}

function zoomIn() {
    if (zoomLevel < 2) {
        zoomLevel += 0.1;
        adjustCanvasPosition();
    }
}

function zoomOut() {
    if (zoomLevel > 0.5) {
        zoomLevel -= 0.1;
        adjustCanvasPosition();
    }
}

function handleImageInput(e) {
  const file = e.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(evt) {
          const img = new Image();
          img.onload = function() {
              ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the image on the entire canvas
          }
          img.src = evt.target.result;
      }
      reader.readAsDataURL(file);
  }
}

function saveImage() {
  canvas.toBlob(function(blob) {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = 'saved_image.png';
      link.click();
      URL.revokeObjectURL(url); // Clean up
  }, 'image/png');
}