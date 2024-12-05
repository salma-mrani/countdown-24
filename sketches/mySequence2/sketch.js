import { createEngine } from "../../shared/engine.js";
import { Spring } from "../../shared/spring.js";

const { renderer, run, input } = createEngine();
const { ctx, canvas } = renderer;

let particles = [];
let exploded = false;
let canExplode = true;

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

function createParticlesFromExistingText(x, y, scaleX, scaleY, text) {
  const textCanvas = document.createElement("canvas");
  const textCtx = textCanvas.getContext("2d");

  textCanvas.width = canvas.width;
  textCanvas.height = canvas.height;

  textCtx.fillStyle = "white";
  textCtx.textBaseline = "middle";
  textCtx.textAlign = "center";
  textCtx.font = `${canvas.height}px impact`;
  textCtx.translate(x, y);
  textCtx.scale(scaleX, scaleY);
  textCtx.fillText(text, 0, 0);

  const imageData = textCtx.getImageData(
    0,
    0,
    textCanvas.width,
    textCanvas.height
  );
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 300) {
    const alpha = data[i + 3];
    if (alpha > 128) {
      const px = (i / 4) % textCanvas.width;
      const py = Math.floor(i / 4 / textCanvas.width);
      particles.push({
        x: px,
        y: py,
        vx: (Math.random() - 0.5) * 100,
        vy: (Math.random() - 0.5) * 100,
        size: Math.random() * 3 + 2,
        life: Math.random() * 150 + 50,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      });
    }
  }
}

run((deltaTime) => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const mouseX = input.getX();
  const mouseY = input.getY();

  if (!exploded) {
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = `${canvas.height}px impact`;

    const gradient = ctx.createLinearGradient(
      canvas.width / 2 - canvas.height / 2,
      0,
      canvas.width / 2 + canvas.height / 2,
      0
    );
    gradient.addColorStop(0, "green");
    gradient.addColorStop(0.5, "yellow");
    gradient.addColorStop(1, "green");

    ctx.fillStyle = gradient;
    ctx.shadowColor = "rgba(0, 255, 255, 0.4)";
    ctx.shadowBlur = 50;

    const metrics = ctx.measureText("2");

    if (input.hasStarted() && canExplode) {
      springX.target = Math.abs(mouseX - canvas.width / 2) * 2;
      springY.target = Math.abs(mouseY - canvas.height / 2) * 2;
    }

    springX.step(deltaTime);
    springY.step(deltaTime);

    const scaleX = springX.position / metrics.width;
    const scaleY =
      springY.position /
      (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);

    const x = canvas.width / 2;
    const y = canvas.height / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.fillText("2", 0, 0);
    ctx.restore();

    if (springX.position >= canvas.width && springY.position >= canvas.height) {
      exploded = true;
      canExplode = false;
      createParticlesFromExistingText(x, y, scaleX, scaleY, "2");
    }
  }

  if (exploded) {
    particles.forEach((particle, index) => {
      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
      particle.life -= deltaTime * 100;

      if (particle.life > 0) {
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        particles.splice(index, 1);
      }
    });

    if (particles.length === 0) {
      exploded = false;
    }
  }
});
