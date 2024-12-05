import { createEngine } from "../../shared/engine.js";

const { renderer, run, pixelRatio } = createEngine();
const { ctx, canvas } = renderer;

const gridSize = 4; // Nombre de lignes et colonnes
const cellWidth = canvas.width / gridSize;
const cellHeight = canvas.height / gridSize;

const bumpSize = 100; // Taille des bosses et creux

const offscreenCanvas = document.createElement("canvas");
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext("2d");

// Dessiner la lettre "1" sur le canvas hors écran
offscreenCtx.textBaseline = "middle";
offscreenCtx.textAlign = "center";
offscreenCtx.font = `${canvas.height}px impact`;
offscreenCtx.fillStyle = "green";
offscreenCtx.fillText("1", canvas.width / 2, canvas.height / 2);

// Générer les positions originales des pièces
const originalPositions = [];
for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    originalPositions.push({ x: x * cellWidth, y: y * cellHeight });
  }
}

// Mélanger les positions

let currentPositions = [...originalPositions];
shuffleArray(currentPositions);

canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  console.log((e.clientX - rect.left) * 2);

  let clickX = (e.clientX - rect.left) * pixelRatio;
  let clickY = (e.clientY - rect.top) * pixelRatio;

  const clickedCol = Math.floor(clickX / cellWidth);
  const clickedRow = Math.floor(clickY / cellHeight);
  // const clickedCol = Math.floor((e.clientX - rect.left) / cellWidth);
  // const clickedRow = Math.floor((e.clientY - rect.top) / cellHeight);

  const clickedIndex = currentPositions.findIndex(
    (p) => p.x === clickedCol * cellWidth && p.y === clickedRow * cellHeight
  );

  if (clickedIndex !== -1) {
    const originalPos = originalPositions[clickedIndex];
    const occupiedIndex = currentPositions.findIndex(
      (p) => p.x === originalPos.x && p.y === originalPos.y
    );

    if (occupiedIndex === -1 || occupiedIndex === clickedIndex) {
      currentPositions[clickedIndex] = { ...originalPos };
    } else {
      const temp = currentPositions[clickedIndex];
      currentPositions[clickedIndex] = currentPositions[occupiedIndex];
      currentPositions[occupiedIndex] = temp;
    }
  }
});

run(() => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner les pièces de puzzle
  currentPositions.forEach((pos, index) => {
    const originalPos = originalPositions[index];
    // console.log(originalPos);

    drawPuzzlePieceFill(
      offscreenCanvas,
      originalPos.x,
      originalPos.y,
      cellWidth,
      cellHeight,
      pos.x,
      pos.y,
      index
    );
  });
  currentPositions.forEach((pos, index) => {
    const originalPos = originalPositions[index];
    drawPuzzlePieceLine(
      offscreenCanvas,
      originalPos.x,
      originalPos.y,
      cellWidth,
      cellHeight,
      pos.x,
      pos.y,
      index
    );
  });
});

// function drawPuzzlePiece(sourceCanvas, sx, sy, sw, sh, dx, dy, index) {
//   const col = index % gridSize;
//   const row = Math.floor(index / gridSize);

//   ctx.save();
//   ctx.translate(dx, dy);

//   ctx.beginPath();

//   // Haut
//   ctx.moveTo(0, 0);
//   if (row > 0) {
//     ctx.lineTo(sw / 2 - bumpSize, 0);
//     ctx.quadraticCurveTo(sw / 2, -bumpSize, sw / 2 + bumpSize, 0);
//   }
//   ctx.lineTo(sw, 0);

//   Droite
//   ctx.lineTo(sw, sh / 2 - bumpSize);
//   if (col < gridSize - 1) {
//     ctx.quadraticCurveTo(sw + bumpSize, sh / 2, sw, sh / 2 + bumpSize);
//   }
//   ctx.lineTo(sw, sh);

//   Bas
//   if (row < gridSize - 1) {
//     ctx.lineTo(sw / 2 + bumpSize, sh);
//     ctx.quadraticCurveTo(sw / 2, sh + bumpSize, sw / 2 - bumpSize, sh);
//   }
//   ctx.lineTo(0, sh);

//   // Gauche
//   if (col > 0) {
//     ctx.lineTo(0, sh / 2 + bumpSize);
//     ctx.quadraticCurveTo(-bumpSize, sh / 2, 0, sh / 2 - bumpSize);
//   }
//   ctx.lineTo(0, 0);

//   ctx.closePath();
//   ctx.clip();

//   ctx.drawImage(sourceCanvas, sx, sy, sw, sh, 0, 0, sw, sh);

//   ctx.strokeStyle = "white";
//   ctx.lineWidth = 6;
//   ctx.stroke();

//   ctx.restore();
// }

function drawPuzzlePieceFill(sourceCanvas, sx, sy, sw, sh, dx, dy, index) {
  const col = index % gridSize;
  const row = Math.floor(index / gridSize);

  ctx.save();
  ctx.translate(dx, dy);

  ctx.beginPath();

  // Haut
  ctx.moveTo(0, 0);
  if (row > 1) {
    ctx.lineTo(sw / 2 - bumpSize, 0);
    ctx.quadraticCurveTo(sw / 2, -bumpSize, sw / 2 + bumpSize, 0);
  }
  ctx.lineTo(sw, 0);

  //Droite;
  ctx.lineTo(sw, sh / 2 - bumpSize);
  if (col < gridSize - 1) {
    ctx.quadraticCurveTo(sw + bumpSize, sh / 2, sw, sh / 2 + bumpSize);
  }
  ctx.lineTo(sw, sh);

  ctx.lineTo(0, sh);

  ctx.lineTo(0, 0);

  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    sourceCanvas,
    sx,
    sy,
    sw + bumpSize,
    sh + bumpSize,
    0,
    0,
    sw + bumpSize,
    sh + bumpSize
  );

  // ctx.fillStyle = `rgb(${Math.random() * 255},${Math.random() * 255},${
  //   Math.random() * 255
  // })`;

  // //ctx.fillRect(0, 0, 3000, 3000);

  ctx.restore();
}

function drawPuzzlePieceLine(sourceCanvas, sx, sy, sw, sh, dx, dy, index) {
  const col = index % gridSize;
  const row = Math.floor(index / gridSize);

  ctx.save();
  ctx.translate(dx, dy);

  ctx.beginPath();

  // Haut
  ctx.moveTo(0, 0);
  if (row > 0) {
    ctx.lineTo(sw / 2 - bumpSize, 0);
    ctx.quadraticCurveTo(sw / 2, -bumpSize, sw / 2 + bumpSize, 0);
  }
  ctx.lineTo(sw, 0);

  //Droite;
  ctx.lineTo(sw, sh / 2 - bumpSize);
  if (col < gridSize - 1) {
    ctx.quadraticCurveTo(sw + bumpSize, sh / 2, sw, sh / 2 + bumpSize);
  }
  ctx.lineTo(sw, sh);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.restore();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
