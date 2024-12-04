import { createEngine } from "../../shared/engine.js";

const { renderer, run, input } = createEngine();
const { ctx, canvas } = renderer;

let isRevealed = false; // Flag to check if the number area has been revealed
const revealRadius = 10; // Radius of the area around the number to scratch

// Function to generate random coordinates
function getRandomPosition() {
  const x = Math.random() * (canvas.width - 100) + 30; // Prevent the number from being too close to the edges
  const y = Math.random() * (canvas.height - 100) + 30;
  return { x, y };
}

const scratchCanvas = new OffscreenCanvas(canvas.width, canvas.height);
const scratchCtx = scratchCanvas.getContext("2d");
scratchCtx.globalCompositeOperation = "source-over";
scratchCtx.fillStyle = "green";
scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

let prevMouseX;
let prevMouseY;

// Random position
const { x, y } = getRandomPosition();

run(() => {
  // Mouse position
  const mouseX = input.getX();
  const mouseY = input.getY();

  // If the number is fully revealed, animate it to grow and disappear
  let scale = 1;
  if (isRevealed) {
    const animationSpeed = 0.1;

    if (scale < 5) {
      // Increase the size
      scale += animationSpeed;
    }
  }
  // Check if the area around the number has been completely scratched
  //if (!isRevealed && isAreaRevealed()) {
  //isRevealed = true;
  // Black background disappears
  // ctx.clearRect(0, 0, canvas.width, canvas.height);
  //}

  ///ctx.globalCompositeOperation = "source-over";

  // Set the context to apply scaling
  ctx.save();
  ctx.translate(x, y); // Move the canvas origin to the text center
  ctx.scale(scale, scale); // Apply scaling

  // Draw the number "3" with scaling
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `${canvas.height / 2}px impact`;
  ctx.fillStyle = "black";
  ctx.fillText("3", 0, 0);

  ctx.restore();

  // Fill the canvas background with a color (e.g., green) that does not work

  if (input.hasStarted() && input.isPressed()) {
    scratchCtx.globalCompositeOperation = "destination-out"; // Erase mode

    scratchCtx.fillStyle = "red";
    scratchCtx.lineJoin = "round";
    scratchCtx.lineCap = "round";
    scratchCtx.beginPath();
    scratchCtx.lineWidth = 50;
    if (input.isd()) scratchCtx.moveTo(prevMouseX, prevMouseY);
    scratchCtx.lineTo(mouseX, mouseY);
    scratchCtx.stroke();
  }

  ctx.drawImage(scratchCanvas, 0, 0);

  prevMouseX = mouseX;
  prevMouseY = mouseY;
});
