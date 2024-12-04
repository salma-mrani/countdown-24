import { createEngine } from "../../shared/engine.js";

const { renderer, run } = createEngine();
const { ctx, canvas } = renderer;

const gridSize = 4;
const cellWidth = canvas.width / gridSize;
const cellHeight = canvas.height / gridSize;

const offscreenCanvas = document.createElement("canvas");
offscreenCanvas.width = canvas.width;
offscreenCanvas.height = canvas.height;
const offscreenCtx = offscreenCanvas.getContext("2d");

offscreenCtx.textBaseline = "middle";
offscreenCtx.textAlign = "center";
offscreenCtx.font = `${canvas.height}px impact`;

// Dessiner le chiffre "1" normalement
offscreenCtx.fillStyle = "green";
offscreenCtx.fillText("1", canvas.width / 2, canvas.height / 2);

// Création des positions de départ en utilisant les coordonnées x, y
const originalPositions = [];
for (let y = 0; y < gridSize; y++) {
  for (let x = 0; x < gridSize; x++) {
    originalPositions.push({ x: x * cellWidth, y: y * cellHeight });
  }
}

let currentPositions = [...originalPositions];
shuffleArray(currentPositions);

let animationState = {
  allPiecesCorrect: false,
  disappearing: false,
  offsetY: 0,
};

canvas.addEventListener("click", (e) => {
  if (animationState.disappearing) return;

  const rect = canvas.getBoundingClientRect();
  const clickedCol = Math.floor((e.clientX - rect.left) / cellWidth);
  const clickedRow = Math.floor((e.clientY - rect.top) / cellHeight);

  const clickedIndex = currentPositions.findIndex(
    (p) => p.x === clickedCol * cellWidth && p.y === clickedRow * cellHeight
  );

  if (clickedIndex !== -1) {
    const originalPos = originalPositions[clickedIndex];

    // Trouver l'index de la case à la position originale
    const occupiedIndex = currentPositions.findIndex(
      (p) => p.x === originalPos.x && p.y === originalPos.y
    );

    if (occupiedIndex === -1 || occupiedIndex === clickedIndex) {
      // Déplacer le morceau vers sa position d'origine
      currentPositions[clickedIndex] = { ...originalPos };
    } else {
      // Échanger les morceaux si la position est occupée
      const temp = currentPositions[clickedIndex];
      currentPositions[clickedIndex] = currentPositions[occupiedIndex];
      currentPositions[occupiedIndex] = temp;
    }
  }

  // Vérifier si toutes les pièces sont à leur position d'origine
  animationState.allPiecesCorrect = currentPositions.every(
    (pos, index) =>
      pos.x === originalPositions[index].x &&
      pos.y === originalPositions[index].y
  );
});

run(() => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (animationState.allPiecesCorrect && !animationState.disappearing) {
    animationState.disappearing = true;
  }

  if (animationState.disappearing) {
    animateDisappearance();
  } else {
    // Dessiner chaque morceau de la lettre
    currentPositions.forEach((pos, index) => {
      const originalPos = originalPositions[index];
      ctx.drawImage(
        offscreenCanvas,
        originalPos.x,
        originalPos.y,
        cellWidth,
        cellHeight,
        pos.x,
        pos.y,
        cellWidth,
        cellHeight
      );
    });

    drawGrid();
  }
});

function drawGrid() {
  if (animationState.allPiecesCorrect) return; // Ne pas dessiner les grilles si tout est correct
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellWidth, 0);
    ctx.lineTo(i * cellWidth, canvas.height);
    ctx.moveTo(0, i * cellHeight);
    ctx.lineTo(canvas.width, i * cellHeight);
    ctx.stroke();
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function animateDisappearance() {
  // Déplacer le chiffre vers le haut
  animationState.offsetY -= 30;

  if (animationState.offsetY + canvas.height / 2 < 0) {
    // Si le chiffre a totalement disparu
    return;
  }

  // Dessiner le chiffre "1" qui se déplace
  ctx.save();
  ctx.translate(0, animationState.offsetY);
  ctx.drawImage(offscreenCanvas, 0, 0);
  ctx.restore();
}
