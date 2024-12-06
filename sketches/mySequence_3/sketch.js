import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, run, input, math, finish, audio } = createEngine();
const { ctx, canvas } = renderer;

let isRevealed = false; // Flag pour vérifier si le numéro a été révélé
const revealRadius = 10; // Rayon autour du numéro à gratter

const fontSize = canvas.height / 4;

// Charger l'image
const coinImage = new Image();
coinImage.src = "./coin.png"; // Chemin vers l'image

let volume = 0;
// Charger le son
const scratchSoundFile = await audio.load({
  src: "./gratte.wav",
  loop: true,
}); // Chemin vers le fichier audio
const scratchSound = scratchSoundFile.play();
scratchSound.setVolume(volume);
// Fonction pour générer des coordonnées aléatoires
function getRandomPosition() {
  const paddingX = fontSize * 0.3;
  const paddingY = fontSize * 0.45;
  const x = math.lerp(paddingX, canvas.width - paddingX, Math.random());
  const y = math.lerp(paddingY, canvas.height - paddingY, Math.random());
  return { x, y };
}

// Fonction pour générer un chiffre aléatoire sauf 3
function getRandomDigitExcludingThree() {
  let value;
  do {
    value = Math.floor(Math.random() * 10); // Générer un chiffre entre 0 et 9
  } while (value === 3); // Réessayer si le chiffre est 3
  return value;
}

// Ajouter à la liste des chiffres aléatoires
const randomNumbers = Array.from({ length: 5 }, () => ({
  value: getRandomDigitExcludingThree(), // Générer un chiffre aléatoire sauf 3
  position: getRandomPosition(), // Générer une position aléatoire
}));

const scratchCanvas = new OffscreenCanvas(canvas.width, canvas.height);
const scratchCtx = scratchCanvas.getContext("2d");
scratchCtx.globalCompositeOperation = "source-over";
scratchCtx.fillStyle = "black";
scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

let prevMouseX;
let prevMouseY;

let isFinished = false;
let finishedTime = 0;

let canvasY = 0;
let canvasYSpeed = 0;

// Position aléatoire pour le texte
const { x, y } = getRandomPosition();

let glowPhase = 0; // Phase pour l'animation de brillance

run((deltaTime) => {
  // Mise à jour de la phase de brillance
  glowPhase += deltaTime * 3; // Augmenter la vitesse de l'effet de brillance
  if (glowPhase > Math.PI * 2) glowPhase -= Math.PI * 2;

  // Position de la souris
  const mouseX = input.getX();
  const mouseY = input.getY();

  if (isFinished) finishedTime += deltaTime;
  if (finishedTime > 1) {
    canvasYSpeed += 1000 * deltaTime;
  }
  canvasY += canvasYSpeed * deltaTime;

  if (canvasY > 2000) {
    finish();
  }

  ctx.translate(0, canvasY);

  // Dessiner les chiffres aléatoires
  ctx.save();
  ctx.fillStyle = "green"; // Couleur verte pour les chiffres aléatoires
  ctx.font = `${fontSize / 1}px impact`; // Taille plus petite pour différencier
  randomNumbers.forEach(({ value, position }) => {
    ctx.fillText(value, position.x, position.y);
  });
  ctx.restore();

  // Sauvegarde du contexte
  ctx.save();
  ctx.translate(x, y); // Déplace l'origine vers le centre du texte

  // Dessiner le texte avec effet de brillance
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = `${fontSize}px impact`;

  // Dégradé animé pour l'effet de brillance
  const gradient = ctx.createLinearGradient(-fontSize, 0, fontSize, 0);
  const glowPosition = (Math.sin(glowPhase) + 1) / 2; // Position oscillante entre 0 et 1
  gradient.addColorStop(0, "yellow");
  gradient.addColorStop(glowPosition, "orange"); // Couleur brillante
  gradient.addColorStop(1, "yellow");

  ctx.fillStyle = gradient;

  // Ajouter un effet de lumière avec ombres
  ctx.shadowColor = "rgba(255, 255, 0, 0.6)";
  ctx.shadowBlur = 20;

  // Dessiner le texte
  ctx.fillText("3", 0, 0);

  const metrics = ctx.measureText("3");
  ctx.restore();
  let targetVolume = 0;
  // Grattage (scratch) sur le canvas secondaire
  if (input.hasStarted() && input.isPressed()) {
    scratchCtx.globalCompositeOperation = "destination-out"; // Mode effaçage
    scratchCtx.fillStyle = "red";
    scratchCtx.lineJoin = "round";
    scratchCtx.lineCap = "round";
    scratchCtx.beginPath();
    scratchCtx.lineWidth = 50;

    if (input.isDown()) {
      scratchCtx.moveTo(mouseX + 1, mouseY);
      // Jouer le son si la souris est maintenue
    } else {
      scratchCtx.moveTo(prevMouseX, prevMouseY);
    }
    scratchCtx.lineTo(mouseX, mouseY);
    scratchCtx.stroke();

    const speed = math.dist(prevMouseX, prevMouseY, mouseX, mouseY) / deltaTime;
    targetVolume = math.mapClamped(speed, 0, 800, 0, 1);
    console.log(targetVolume);
  }

  volume = math.lerp(volume, targetVolume, 0.2);
  scratchSound.setVolume(volume);
  scratchSound.setRate(math.lerp(0, 1.5, volume));

  ctx.fillRect(0, -canvas.height * 10 + 1, canvas.width, canvas.height * 10);
  ctx.drawImage(scratchCanvas, 0, 0);

  const textWidth = metrics.width;
  const textHeight =
    metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const textX = x - textWidth / 2;
  const textY = y - metrics.actualBoundingBoxAscent;
  const imageData = scratchCtx.getImageData(
    textX,
    textY,
    textWidth,
    textHeight
  );

  const data = imageData.data;
  let count = 0;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a > 0) count++;
  }

  const totalCount = data.length / 4;
  const fill = count / totalCount;

  // Si plus de 94% de la zone a été grattée
  if (fill < 0.06) {
    isFinished = true;
    isRevealed = true;
    // Appel à la fonction finish() lorsque l'animation est terminée
  }

  prevMouseX = mouseX;
  prevMouseY = mouseY;

  // Dessiner l'image `coin.png` sous le curseur
  const coinSize = 100; // Taille de l'image de la pièce
  if (coinImage.complete) {
    ctx.drawImage(
      coinImage,
      mouseX - coinSize / 2,
      mouseY - coinSize / 2,
      coinSize,
      coinSize
    );
  }
});
