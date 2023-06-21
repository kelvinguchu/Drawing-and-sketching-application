const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let isDrawing = false;
let color = "#000";
let brushSize = 5;

canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseout", stopDrawing);

document.getElementById("color-picker").addEventListener("input", updateColor);
document.getElementById("brush-size").addEventListener("input", updateBrushSize);
document.getElementById("eraser").addEventListener("click", useEraser);
document.getElementById("clear").addEventListener("click", clearCanvas);

function startDrawing(e) {
  isDrawing = true;
  draw(e);
}

function stopDrawing() {
  isDrawing = false;
}

function draw(e) {
    if (!isDrawing) return;
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = color;
    ctx.lineCap = "round";
  
    const rect = canvas.getBoundingClientRect(); // Get the canvas boundaries
    const offsetX = e.clientX - rect.left; // Calculate the offset X
    const offsetY = e.clientY - rect.top; // Calculate the offset Y
  
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
    ctx.beginPath();
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
