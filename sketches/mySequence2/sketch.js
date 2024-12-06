import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, run, input, finish } = createEngine();
const { ctx, canvas } = renderer;

let particles = []; // Tableau des particules
let exploded = false; // Indicateur d'explosion
let canExplode = true; // Variable pour empêcher une nouvelle explosion
let explosionSound; // Variable pour le son
let explosionSoundPlayed = false; // Indicateur pour éviter de rejouer le son

// Charger le son après une interaction utilisateur
document.addEventListener("click", () => {
  if (!explosionSound) {
    explosionSound = new Audio("feu.mp3");
    console.log("Son chargé !");
  }
});

const springX = new Spring({
  position: 0,
  frequency: 2.4,
  halfLife: 0.54,
});
const springY = new Spring({
  position: 0,
  frequency: 2.4,
  halfLife: 0.54,
});

// Fonction pour créer des particules à partir de la forme du texte existant
function createParticlesFromExistingText(x, y, scaleX, scaleY, text) {
  const textCanvas = document.createElement("canvas");
  const textCtx = textCanvas.getContext("2d");

  // Adapter la taille du canvas temporaire
  textCanvas.width = canvas.width;
  textCanvas.height = canvas.height;

  // Dessiner le texte sur le canvas temporaire
  textCtx.fillStyle = "white";
  textCtx.textBaseline = "middle";
  textCtx.textAlign = "center";
  textCtx.font = `${canvas.height}px impact`;
  textCtx.translate(x, y); // Déplacer à la position actuelle
  textCtx.scale(scaleX, scaleY); // Appliquer l'échelle actuelle
  textCtx.fillText(text, 0, 0);

  // Récupérer les données des pixels
  const imageData = textCtx.getImageData(
    0,
    0,
    textCanvas.width,
    textCanvas.height
  );
  const data = imageData.data;

  // Générer des particules à partir des pixels visibles
  for (let i = 0; i < data.length; i += 200) {
    const alpha = data[i + 3];
    if (alpha > 128) {
      const px = (i / 4) % textCanvas.width;
      const py = Math.floor(i / 4 / textCanvas.width);
      particles.push({
        x: px,
        y: py,
        vx: Math.random() * 100 - 2, // Vitesse aléatoire en x
        vy: Math.random() * 50 - 10, // Vitesse aléatoire en y
        size: Math.random() * 7 + 1.5, // Taille des particules
        life: Math.random() * 10 + 100, // Durée de vie
      });
    }
  }
}

// Fonction principale de mise à jour
run((deltaTime) => {
  // Effacer le canvas avec un fond noir
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const mouseX = input.getX();
  const mouseY = input.getY();

  if (!exploded) {
    // Configurer le style du texte
    ctx.fillStyle = "green";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${canvas.height}px impact`;
    const metrics = ctx.measureText("2");

    // Gérer les interactions de la souris
    if (input.hasStarted() && canExplode) {
      springX.target = Math.abs(mouseX - canvas.width / 2) * 2 * 2;
      springY.target = Math.abs(mouseY - canvas.height / 2) * 2 * 2;
    }

    springX.step(deltaTime);
    springY.step(deltaTime);

    const scaleX = springX.position / metrics.width;
    const scaleY =
      springY.position /
      (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);

    // Dessiner la lettre "2" avec les dimensions ajustées
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY); // Appliquer l'échelle
    ctx.fillText("2", 0, 0); // Dessiner la lettre
    ctx.restore();

    // Déclencher l'explosion lorsque la taille atteint le seuil
    if (springX.position >= canvas.width && springY.position >= canvas.height) {
      exploded = true;
      canExplode = false; // Empêcher toute nouvelle explosion
      createParticlesFromExistingText(x, y, scaleX, scaleY, "2");

      // Jouer le son d'explosion
      if (explosionSound && !explosionSoundPlayed) {
        explosionSound.play().catch((error) => {
          console.error("Erreur lors de la lecture du son :", error);
        });
        explosionSoundPlayed = true;
      }
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
        ctx.fillStyle = "green"; // Couleur verte pour les particules
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        particles.splice(index, 1); // Supprimer les particules expirées
      }
    });

    // Arrêter l'animation si toutes les particules ont disparu
    if (particles.length === 0) {
      finish();
    }
  }
});
