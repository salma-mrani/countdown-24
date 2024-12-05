import { createEngine } from "../../shared/engine.js";

const { renderer, run } = createEngine();
const { ctx, canvas } = renderer;

// Configuration de la grille
const rows = 10; // Nombre de lignes
const cols = 20; // Nombre de colonnes
const circleRadius = Math.min(canvas.width / cols, canvas.height / rows) * 0.5; // Taille des cercles
const colors = ["#263b05", "#79ba14", "#596e39"]; // Couleurs pour chaque ligne

// Variables pour l'animation de la disparition progressive
let mouseY = 0; // Position verticale de la souris

// Génération des cercles
const circles = [];
for (let row = 0; row < rows; row++) {
  const rowCircles = [];
  for (let col = 0; col < cols; col++) {
    const x = (col + 0.5) * (canvas.width / cols);
    const y = (row + 0.5) * (canvas.height / rows);
    rowCircles.push({
      x,
      y,
      row,
      col,
      flipped: false, // Statut de retournement
      rotation: 0, // Angle de rotation (en degrés)
      flipping: false, // Indique si une animation de retournement est en cours
    });
  }
  circles.push(rowCircles); // Grouper les cercles par ligne
}

// Écouteur d'événements pour la souris
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseY = e.clientY - rect.top; // Mise à jour de la position verticale de la souris
});

// Fonction principale de rendu
run(update);

function update(dt) {
  // Effacer le canvas
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Dessiner le grand "0" dans un canvas temporaire (une seule fois)
  const offscreenCanvas = document.createElement("canvas");
  offscreenCanvas.width = canvas.width;
  offscreenCanvas.height = canvas.height;
  const offscreenCtx = offscreenCanvas.getContext("2d");

  const bigZeroFontSize = canvas.height * 1.2; // Taille du "0"
  offscreenCtx.font = `${bigZeroFontSize}px impact`;
  offscreenCtx.fillStyle = "green";
  offscreenCtx.textBaseline = "middle";
  offscreenCtx.textAlign = "center";
  offscreenCtx.fillText("0", canvas.width / 2, canvas.height / 2);

  // Calculer l'index de la ligne à retourner en fonction de la position de la souris
  const hoveredRow = Math.floor((mouseY / canvas.height) * rows);

  // Retourner les cercles des lignes correspondantes
  circles.forEach((rowCircles) => {
    rowCircles.forEach((circle) => {
      const { row, flipped, rotation } = circle;

      // Si la ligne est au-dessus de la ligne "hoveredRow", ne pas faire l'animation
      if (row <= hoveredRow && !flipped) {
        // Animation de rotation
        circle.flipping = true; // Déclencher l'animation de retournement

        if (circle.flipping) {
          circle.rotation += 1; // Augmenter l'angle progressivement
          if (circle.rotation >= 180) {
            circle.rotation = 180;
            circle.flipped = true; // La rotation est complète
            circle.flipping = false; // L'animation est terminée
          }
        }
      }
    });
  });

  // Dessiner chaque cercle avec animation
  circles.forEach((rowCircles) => {
    rowCircles.forEach((circle) => {
      const { x, y, row, col, flipped, rotation } = circle;

      // Dessin du cercle
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180); // Appliquer la rotation
      ctx.beginPath();
      ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);

      if (flipped) {
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
  });
}
