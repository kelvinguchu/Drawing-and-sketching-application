const canvas = document.getElementById("canvas"); // Get the canvas element
const ctx = canvas.getContext("2d"); // Get the 2D rendering context

let isDrawing = false; // Flag to indicate if the user is currently drawing
let color = "#000"; // Default color for drawing
let brushSize = 5; // Default brush size

canvas.addEventListener("mousedown", startDrawing); // Start drawing when the mouse button is pressed down
canvas.addEventListener("mouseup", stopDrawing); // Stop drawing when the mouse button is released
canvas.addEventListener("mousemove", draw); // Draw when the mouse moves
canvas.addEventListener("mouseout", stopDrawing); // Stop drawing when the mouse leaves the canvas

document.getElementById("color-picker").addEventListener("input", updateColor); // Update the drawing color when the color picker value changes
document.getElementById("brush-size").addEventListener("input", updateBrushSize); // Update the brush size when the input range value changes
document.getElementById("eraser").addEventListener("click", useEraser); // Activate the eraser mode when the eraser button is clicked
document.getElementById("clear").addEventListener("click", clearCanvas); // Clear the canvas when the clear button is clicked

function startDrawing(e) {
  isDrawing = true; // Set the drawing flag to true
  draw(e); // Start drawing
}

function stopDrawing() {
  isDrawing = false; // Set the drawing flag to false
}

function draw(e) {
    if (!isDrawing) return; // If not drawing, exit the function
    ctx.lineWidth = brushSize; // Set the brush size
    ctx.strokeStyle = color; // Set the drawing color
    ctx.lineCap = "round"; // Set the line cap style to round
  
    const rect = canvas.getBoundingClientRect(); // Get the canvas boundaries
    const offsetX = e.clientX - rect.left; // Calculate the offset X
    const offsetY = e.clientY - rect.top; // Calculate the offset Y
  
    ctx.lineTo(offsetX, offsetY); // Draw a line to the current mouse position
    ctx.stroke(); // Stroke the line
    ctx.beginPath(); // Start a new path
    ctx.moveTo(offsetX, offsetY); // Move the drawing position to the current mouse position
}

function updateColor(e) {
  color = e.target.value; // Update the drawing color with the selected color
}

function updateBrushSize(e) {
  brushSize = e.target.value; // Update the brush size with the selected value
}

function useEraser() {
  color = "#fff"; // Set the drawing color to white, effectively acting as an eraser
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the entire canvas
}
