import { createEngine } from "../../shared/engine.js";

const { renderer, run, pixelRatio, finish } = createEngine();
const { ctx, canvas } = renderer;

const gridSize = 4; // Nombre de lignes et colonnes
const cellWidth = canvas.width / gridSize;
const cellHeight = canvas.height / gridSize;

const bumpSize = 100; // Taille des bosses et creux

const offscreenCanvas = document.createElement("canvas");
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext("2d");

offscreenCtx.textBaseline = "middle";
offscreenCtx.textAlign = "center";
offscreenCtx.font = `${canvas.height}px impact`;
offscreenCtx.fillStyle = "green";
offscreenCtx.fillText("1", canvas.width / 2, canvas.height / 2);

const originalPositions = [];
for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    originalPositions.push({
      x: x * cellWidth,
      y: y * cellHeight,
      gridX: x,
      gridY: y,
    });
  }
}

let currentPositions = [...originalPositions];
shuffleArray(currentPositions);

let isPuzzleStarted = false; // Indique si le puzzle est affiché
let isPuzzleComplete = false; // Indique si le puzzle est résolu

// Crée l'élément audio et charge le fichier
const chessSound = new Audio("./Chess.mp3");

// Ajouter un gestionnaire d'événement pour jouer le son lors du clic
canvas.addEventListener("click", (event) => {
  // Joue le son chaque fois que l'utilisateur clique
  chessSound.play();

  if (!isPuzzleStarted) {
    isPuzzleStarted = true;
    return;
  }

  if (!isPuzzleComplete) {
    const rect = canvas.getBoundingClientRect();
    const clickX = (event.clientX - rect.left) * pixelRatio;
    const clickY = (event.clientY - rect.top) * pixelRatio;

    const clickedCol = Math.floor(clickX / cellWidth);
    const clickedRow = Math.floor(clickY / cellHeight);

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

    // Vérifie si toutes les pièces sont à leur position d'origine
    isPuzzleComplete = currentPositions.every((pos, index) => {
      const ok =
        originalPositions[index].gridX === 0 ||
        originalPositions[index].gridX === 3 ||
        (pos.x === originalPositions[index].x &&
          pos.y === originalPositions[index].y);
      return ok;
    });

    if (isPuzzleComplete) {
      setTimeout(() => {
        finish();
      }, 1000);
      // Si le puzzle est complet, nettoie l'écran
    }
  }
});

run(() => {
  // Nettoyage du canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Si le puzzle n'a pas commencé, rien n'est affiché
  if (!isPuzzleStarted) return;

  // Dessiner les pièces de puzzle
  currentPositions.forEach((pos, index) => {
    const originalPos = originalPositions[index];
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

  // Dessiner les contours des pièces
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

  // Dessiner le contour du puzzle
  drawOutlineRectangle();
});

function drawPuzzlePieceFill(sourceCanvas, sx, sy, sw, sh, dx, dy, index) {
  ctx.save();
  ctx.translate(dx, dy);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sw / 2 - bumpSize, 0);
  ctx.quadraticCurveTo(sw / 2, -bumpSize, sw / 2 + bumpSize, 0);
  ctx.lineTo(sw, 0);
  ctx.lineTo(sw, sh / 2 - bumpSize);
  ctx.quadraticCurveTo(sw + bumpSize, sh / 2, sw, sh / 2 + bumpSize);
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

  ctx.restore();
}

function drawPuzzlePieceLine(sourceCanvas, sx, sy, sw, sh, dx, dy, index) {
  ctx.save();
  ctx.translate(dx, dy);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(sw / 2 - bumpSize, 0);
  ctx.quadraticCurveTo(sw / 2, -bumpSize, sw / 2 + bumpSize, 0);
  ctx.lineTo(sw, 0);
  ctx.lineTo(sw, sh / 2 - bumpSize);
  ctx.quadraticCurveTo(sw + bumpSize, sh / 2, sw, sh / 2 + bumpSize);
  ctx.lineTo(sw, sh);

  ctx.strokeStyle = "white";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.restore();
}

function drawOutlineRectangle() {
  ctx.strokeStyle = "white";
  ctx.lineWidth = 4;
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
