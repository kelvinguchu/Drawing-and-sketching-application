const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let color = "#000";
let brushSize = 5;

// Add event listeners to the canvas
canvas.addEventListener("mousedown", startDrawing); // Start drawing when mouse button is pressed down
canvas.addEventListener("mouseup", stopDrawing); // Stop drawing when mouse button is released
canvas.addEventListener("mousemove", draw); // Draw as the mouse moves
canvas.addEventListener("mouseout", stopDrawing); // Stop drawing when the mouse moves out of the canvas

// Add event listeners to the controls
document.getElementById("color-picker").addEventListener("input", updateColor); // Update the selected color
document.getElementById("brush-size").addEventListener("input", updateBrushSize); // Update the brush size
document.getElementById("eraser").addEventListener("click", useEraser); // Use the eraser tool
document.getElementById("clear").addEventListener("click", clearCanvas); // Clear the canvas

function startDrawing(e) {
  isDrawing = true;
  draw(e);
}

function stopDrawing() {
  isDrawing = false;
  ctx.beginPath(); // Clear the current path
}

function draw(e) {
  if (!isDrawing) return;

  ctx.lineWidth = brushSize;
  ctx.strokeStyle = color;
  ctx.lineCap = "round";

  const rect = canvas.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const offsetY = e.clientY - rect.top;

  ctx.lineTo(offsetX, offsetY);
  ctx.stroke();
  ctx.beginPath(); // Start a new path
  ctx.moveTo(offsetX, offsetY);
}

function updateColor(e) {
  color = e.target.value;
}

function updateBrushSize(e) {
  brushSize = e.target.value;
}

function useEraser() {
  color = "#fff";
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
