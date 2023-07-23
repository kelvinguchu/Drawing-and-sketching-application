'use strict';

// Get the canvas element and its 2D context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Variables to control drawing behavior and options
let isDrawing = false;
let color = "#000000"; // Default color is black
let brushSize = 5; // Default brush size is 5 pixels
let zoomLevel = 1; // Default zoom level is 1 (no zoom)
let brushType = "round"; // Default brush type is "round"
let startingPoint = null;

// Constants for spray brush settings
const SPRAY_RADIUS = 20;
const SPRAY_DENSITY = 50;

// Arrays to store canvas states for undo and redo
const undoStack = [];
const redoStack = [];

// Get the h1 element
const titleElement = document.getElementById("title");

// Function to apply inline styles to each character with individual colors
function applyRainbowEffect() {
  const rainbowColors = ['#e91e63', '#2196f3', '#4caf50', '#ff9800', '#9c27b0', '#f44336'];
  const titleText = titleElement.innerText;
  const characters = titleText.split('');
  
  let htmlWithStyledCharacters = '';
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    const colorIndex = i % rainbowColors.length;
    const characterStyle = `style="color: ${rainbowColors[colorIndex]}"`;
    htmlWithStyledCharacters += `<span ${characterStyle}>${character}</span>`;
  }
  
  titleElement.innerHTML = htmlWithStyledCharacters;
}

// Apply the rainbow effect initially
applyRainbowEffect();

// Apply the rainbow effect every 2 seconds (adjust duration as needed)
setInterval(applyRainbowEffect, 2000);


// Event Listeners for various user interactions
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
document.getElementById("brush-type").addEventListener("change", updateBrushType);
document.getElementById("zoom-in").addEventListener("click", zoomIn);
document.getElementById("zoom-out").addEventListener("click", zoomOut);
document.getElementById("upload-image").addEventListener("change", handleImageInput);
document.getElementById("save").addEventListener("click", saveImage);
document.getElementById("shape-selector").addEventListener("click", toggleShapeOptions);

// Function to start drawing on canvas
function startDrawing(e) {
  undoStack.push(canvas.toDataURL()); // Save the current canvas state before drawing starts
  isDrawing = true;
  const { offsetX, offsetY } = getCanvasOffset(e);
  ctx.beginPath();
  ctx.moveTo(offsetX, offsetY);
}

// Function to stop drawing on canvas
function stopDrawing(e) {
  if (isDrawing) {
    isDrawing = false;
    undoStack.push(canvas.toDataURL()); // Save the current canvas state after drawing stops
  }
  ctx.beginPath();
}

// Function to handle drawing on canvas
function draw(e) {
  if (!isDrawing) return;

  const { offsetX, offsetY } = getCanvasOffset(e);

  // Check if the mouse pointer is outside the canvas boundaries
  if (offsetX < 0 || offsetX > canvas.width || offsetY < 0 || offsetY > canvas.height) return;

  // Set drawing styles based on selected brush type
  ctx.lineWidth = brushType === 'pen' ? 1 : brushSize; // Set lineWidth to 1 for pen, otherwise use brushSize
  ctx.strokeStyle = color;
  ctx.fillStyle = color; // Set the fillStyle for the spray brush
  ctx.lineCap = brushType === 'square' ? 'butt' : 'round';

  // Different drawing logic for different brush types
  switch (brushType) {
    case 'pen':
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY);
      break;
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
        ctx.fillRect(offsetX + distance * Math.cos(angle), offsetY + distance * Math.sin(angle), 1, 1);
      }
      break;
  }
}

// Function to generate a random float number between min and max
function getRandomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Function to update the selected color for drawing
function updateColor(e) {
  color = e.target.value;
}

// Function to update the brush size based on user input
function updateBrushSize(e) {
  brushSize = e.target.value;
}

// Function to use the eraser by setting the color to white
function useEraser() {
  color = "#ffffff"; // Set the color to white for eraser
}

// Function to clear the entire canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Function to adjust the canvas position based on zoom level
function adjustCanvasPosition() {
  const offsetX = (canvas.width - canvas.width * zoomLevel) / 2;
  const offsetY = (canvas.height - canvas.height * zoomLevel) / 2;
  canvas.style.transform = `scale(${zoomLevel}) translate(${offsetX}px, ${offsetY}px)`;
}

// Function to zoom in on the canvas
function zoomIn() {
  if (zoomLevel < 2) {
    zoomLevel += 0.1;
    adjustCanvasPosition();
  }
}

// Function to zoom out from the canvas
function zoomOut() {
  if (zoomLevel > 0.5) {
    zoomLevel -= 0.1;
    adjustCanvasPosition();
  }
}

// Function to handle image input from the user
function handleImageInput(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (evt) {
      const img = new Image();
      img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Draw the image on the entire canvas
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Function to save the current canvas image as a PNG file
function saveImage() {
  canvas.toBlob(function (blob) {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'saved_image.png';
    link.click();
    URL.revokeObjectURL(url); // Clean up
  }, 'image/png');
}

// Function to undo the last drawing action
function undo() {
  if (undoStack.length > 1) { // Changed to check for at least 2 states in the undoStack
    const lastState = undoStack.pop(); // Pop the current state (last state) from the undo stack
    redoStack.push(lastState); // Save the current state for redo

    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = undoStack[undoStack.length - 1]; // Load the previous state for undo
  }
}

// Function to redo the previously undone drawing action
function redo() {
  if (redoStack.length > 0) {
    const lastState = redoStack.pop(); // Pop the last state from the redo stack
    undoStack.push(lastState); // Save the current state for undo

    const img = new Image();
    img.onload = function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = lastState;
  }
}

// Function to get the canvas offset from the mouse event
function getCanvasOffset(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    offsetX: e.clientX - rect.left,
    offsetY: e.clientY - rect.top
  };
}

// Function to update the selected brush type based on user input
function updateBrushType(e) {
  brushType = e.target.value;
}
