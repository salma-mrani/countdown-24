import { createEngine } from "../../shared/engine.js";

const { renderer, run, input } = createEngine();
const { ctx, canvas } = renderer;

let letterWidth = 50; // Largeur initiale
let letterHeight = 50; // Hauteur initiale
let particles = []; // Tableau des particules
let exploded = false; // Indicateur d'explosion

// Fonction pour créer des particules
function createParticles(x, y, count = 100) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: x,
      y: y,
      vx: Math.random() * 4 - 2, // Vitesse aléatoire en x
      vy: Math.random() * 4 - 2, // Vitesse aléatoire en y
      size: Math.random() * 4 + 1, // Taille aléatoire
      life: Math.random() * 100 + 50, // Durée de vie
    });
  }
}

// Fonction principale de mise à jour
run(() => {
  // Effacer le canvas avec un fond noir
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!exploded) {
    const mouseX = input.getX();
    const mouseY = input.getY();

    if (mouseX !== null && mouseY !== null) {
      letterWidth = Math.abs(mouseX - canvas.width / 2) * 2;
      letterHeight = Math.abs(mouseY - canvas.height / 2) * 2;
    }

    if (letterWidth >= canvas.width || letterHeight >= canvas.height) {
      exploded = true;
      createParticles(canvas.width / 2, canvas.height / 2);
    } else {
      // Configurer le style du texte
      ctx.fillStyle = "green";
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.font = `${letterHeight}px impact`;

      // Dessiner la lettre "2" avec les dimensions ajustées
      const x = canvas.width / 2;
      const y = canvas.height / 2;
      ctx.save();
      ctx.scale(letterWidth / 100, 1); // Étirement horizontal
      ctx.fillText("2", x / (letterWidth / 100), y); // Ajuster le positionnement en fonction de l'étirement
      ctx.restore();
    }
  }

  // Gérer les particules après explosion
  if (exploded) {
    particles.forEach((particle, index) => {
      // Mettre à jour la position des particules
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life--;

      // Dessiner les particules
      if (particle.life > 0) {
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        particles.splice(index, 1); // Supprimer les particules expirées
      }
    });

    // Arrêter l'animation si toutes les particules ont disparu
    if (particles.length === 0) {
      exploded = false; // Réinitialiser pour une autre interaction, si nécessaire
    }
  }
});
