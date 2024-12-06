import { createEngine } from "../../shared/engine.js";
import { Spring, createSpringSettings } from "../../shared/spring.js";
const { renderer, run, math, input, finish } = createEngine();
const { ctx, canvas } = renderer;

// Configuration de la grille
const rows = 10; // Nombre de lignes
const cols = 20; // Nombre de colonnes
const circleRadius = Math.min(canvas.width / cols, canvas.height / rows) * 0.5; // Taille des cercles
const colors = ["#596e39", "#79ba14", "#263b05"]; // Couleurs pour chaque ligne

// Variables pour l'animation de la disparition progressive
let lineFadeIndex = 0;
let state = "starting";
let stateTime = 0;

// Dessiner le grand "0" dans un canvas temporaire (une seule fois)
const offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
const offscreenCtx = offscreenCanvas.getContext("2d");

const bigZeroFontSize = canvas.height * 1.2; // Taille du "0"
offscreenCtx.font = `${bigZeroFontSize}px Helvetica Neue, Helvetica, bold`;
offscreenCtx.fillStyle = "green";
offscreenCtx.textBaseline = "middle";
offscreenCtx.textAlign = "center";
offscreenCtx.fillText("0", canvas.width / 2, canvas.height / 2);

// Génération des cercles
const circles = [];
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x = (col + 0.5) * (canvas.width / cols);
    const y = (row + 0.5) * (canvas.height / rows);
    circles.push({
      x,
      y,
      row,
      col,
      rotationSpring: new Spring({
        position: 90,
        frequency: math.lerp(1.5, 2.5, Math.random()),
        halfLife: math.lerp(0.1, 0.2, Math.random()),
      }),
    });
  }
}

// Charger le son "flip.mp3"
let clickSound = new Audio("flip.mp3");

// Fonction principale de rendu
run(update);

function update(deltaTime) {
  const mouseX = input.getX();
  const mouseY = input.getY();

  stateTime += deltaTime;

  // update state
  let newState;
  switch (state) {
    case "starting": {
      if (stateTime > 1.5) {
        newState = "playing";
      }
      break;
    }
    case "playing": {
      // Vérifier la position de la souris et retourner toute la ligne correspondante
      const rowHeight = canvas.height / rows;
      const hoveredRow = Math.floor(mouseY / rowHeight); // Trouver la ligne survolée

      // Retourner toute la ligne correspondante
      if (input.isPressed()) {
        // Jouer le son de clic lorsque la souris est cliquée
        clickSound.play().catch((error) => {
          console.error("Erreur lors de la lecture du son de clic :", error);
        });

        circles.forEach((circle) => {
          if (circle.row === hoveredRow) {
            circle.rotationSpring.target = 0;
          }
        });
      }
      if (circles.every((circle) => circle.rotationSpring.target === 0)) {
        newState = "waitForDisappear";
      }
      break;
    }
    case "waitForDisappear": {
      if (stateTime > 1) {
        newState = "disappear";
      }
      break;
    }
    case "disappear": {
      if (stateTime > 1) {
        newState = "finish";
      }
      break;
    }
  }

  if (newState !== undefined) {
    stateTime = 0;
    state = newState;

    // entered a new state
    switch (state) {
      case "starting": {
        break;
      }
      case "playing": {
        circles.forEach((circle) => {
          circle.rotationSpring.target = 180;
        });
        break;
      }
      case "disappear": {
        circles.forEach((circle) => {
          circle.rotationSpring.target = -90;
          circle.rotationSpring.settings = createSpringSettings({
            frequency: math.lerp(3, 4, Math.random()),
            halfLife: math.lerp(0.04, 0.07, Math.random()),
          });
        });
        break;
      }
      case "finish": {
        finish();
        break;
      }
    }
  }

  // Effacer le canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  circles.forEach((circle) => {
    circle.rotationSpring.step(deltaTime);
  });

  // Dessiner chaque cercle avec animation
  circles.forEach((circle) => {
    const { x, y, row, col } = circle;

    // Dessin du cercle
    ctx.save();
    ctx.translate(x, y);
    const angleRad = math.toRadian(circle.rotationSpring.position + 90);
    ctx.scale(Math.abs(Math.sin(angleRad)), 1);
    ctx.beginPath();
    ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);

    if (circle.rotationSpring.position < 90) {
      // Découper le morceau du grand "0" à afficher dans ce cercle
      ctx.fillStyle = "#dae3ca";
      ctx.fill();
      ctx.clip(); // Appliquer le masque pour n'afficher qu'une partie du "0"

      // Dessiner la portion du "0" correspondant à ce cercle
      ctx.drawImage(
        offscreenCanvas,
        col * (canvas.width / cols), // Décalage selon la colonne
        row * (canvas.height / rows), // Décalage selon la ligne
        canvas.width / cols, // Largeur de la portion
        canvas.height / rows, // Hauteur de la portion
        -circleRadius, // Décalage pour centrer
        -circleRadius, // Décalage pour centrer
        circleRadius * 2, // Largeur de la portion
        circleRadius * 2 // Hauteur de la portion
      );
    } else {
      // Couleur avant retournement
      ctx.fillStyle = colors[row % colors.length];
      ctx.fill();
    }
    ctx.restore();
  });

  // Si toutes les lignes sont disparues, tout devient noir
  if (lineFadeIndex >= rows) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}
