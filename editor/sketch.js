// RECEIPT!
// This is the file to edit. p5.js reference: https://p5js.org/reference/
import JsBarcode from "jsbarcode";
import dogPhotoUrl from "./assets/dog-cherry-blossoms.jpg";

export const receipt = {
  height: 1610, // 240–2000 px. Width is fixed by the printer.
  seed: 201212219,
};

// SIGNAL GARDEN — a beacon transmits, a photo comes through the static, a
// waveform carries it, and a networked garden of circuit-vines grows to
// receive it. Everything below is editable.
export function drawReceipt(p) {
  const { width: w } = p;
  const margin = 24;

  drawHeader(p, w, margin);
  dashedLine(p, margin, 86, w - margin, 86, 6, 5);

  drawSky(p, w, margin, 96, 360);
  dashedLine(p, margin, 370, w - margin, 370, 6, 5);

  drawPolaroid(p, w, margin, 380);
  dashedLine(p, margin, 857, w - margin, 857, 6, 5);

  drawWaveform(p, w, margin, 867, 947);
  dashedLine(p, margin, 957, w - margin, 957, 6, 5);

  drawGarden(p, w, margin, 967, 1427);
  dashedLine(p, margin, 1455, w - margin, 1455, 6, 5);

  const barcodeValue = "receipt.hackclub.com";
  drawBarcode(p, barcodeValue, w / 2, 1467);
  p.noStroke();
  p.fill(0);
  p.textFont("monospace");
  p.textAlign(p.CENTER, p.TOP);
  p.textStyle(p.NORMAL);
  p.textSize(10);
  p.text(barcodeValue, w / 2, 1531);

  dashedLine(p, margin, 1563, w - margin, 1563, 4, 4);
  p.textSize(9);
  p.text(`SIGNAL RECEIVED · CH ${String(receipt.seed).padStart(3, "0")}`, w / 2, 1575);
}

function drawHeader(p, w, margin) {
  p.noStroke();
  p.fill(0);
  p.textFont("monospace");
  p.textAlign(p.CENTER, p.TOP);
  p.textStyle(p.BOLD);
  p.textSize(28);
  p.text("SIGNAL GARDEN", w / 2, 26);

  p.textStyle(p.NORMAL);
  p.textSize(10);
  p.text(`FREQ ${receipt.seed}.0 MHz — SOMETHING IS GROWING IN THE STATIC`, w / 2, 62);
  void margin;
}

// A beacon pulses at the center of a dithered sky. Dot density is built from
// a soft glow ring plus a noise field, so it reads like halftone shading on
// a printer that only understands pure black or pure white.
function drawSky(p, w, margin, top, bottom) {
  const bx = w / 2;
  const by = top + (bottom - top) * 0.42;
  const beaconR = 28;

  stipple(p, margin, top, w - margin, bottom, 6, (x, y) => {
    const d = p.dist(x, y, bx, by);
    if (d < beaconR + 6) return 0;
    const ring = Math.exp(-((d - 70) * (d - 70)) / 2400) * 0.55;
    const vertical = p.map(y, top, bottom, 0.02, 0.16);
    const mottle = p.noise(x * 0.01, y * 0.012) * 0.22;
    return p.constrain(ring + vertical + mottle, 0, 0.85);
  });

  for (let i = 0; i < 8; i += 1) {
    const a = p.random(Math.PI * 2);
    const d = p.random(beaconR + 45, (w - margin * 2) / 2);
    const x = p.constrain(bx + Math.cos(a) * d, margin + 4, w - margin - 4);
    const y = p.constrain(by + Math.sin(a) * d * 0.6, top + 6, bottom - 6);
    p.noStroke();
    p.fill(0);
    p.rect(x - 3, y, 7, 1);
    p.rect(x, y - 3, 1, 7);
  }

  dashedRing(p, bx, by, beaconR + 16, 0.26, 0.2, 1.5);
  dashedRing(p, bx, by, beaconR + 30, 0.2, 0.26, 1.2);
  dashedRing(p, bx, by, beaconR + 46, 0.14, 0.3, 1);

  p.noStroke();
  p.fill(0);
  p.circle(bx, by, beaconR * 2);
  p.fill(255);
  p.circle(bx, by, beaconR * 0.9);
  p.fill(0);
  p.circle(bx, by, beaconR * 0.35);
}

// A Polaroid-style frame for a real photo, dithered down to pure black and
// white so it survives the printer's 1-bit conversion as a proper halftone
// instead of a crushed silhouette. The image loads async, so the first
// frame or two may show a "developing" placeholder until it's ready.
function drawPolaroid(p, w, margin, top) {
  const innerPad = 16;
  const photoW = w - margin * 2 - innerPad * 2;
  const photoH = Math.round(photoW / DOG_PHOTO_ASPECT);
  const photoX = margin + innerPad;
  const photoY = top + innerPad;
  const captionY = photoY + photoH + 10;

  ensureDogImage(p);

  if (ditheredDogPhoto) {
    p.image(ditheredDogPhoto, photoX, photoY, photoW, photoH);
  } else {
    stipple(p, photoX, photoY, photoX + photoW, photoY + photoH, 8, () => 0.05);
    p.noStroke();
    p.fill(0);
    p.textFont("monospace");
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(11);
    p.text("DEVELOPING…", photoX + photoW / 2, photoY + photoH / 2);
  }

  p.noFill();
  p.stroke(0);
  p.strokeWeight(2);
  p.rect(photoX, photoY, photoW, photoH);

  const tick = 10;
  p.strokeWeight(2);
  [
    [photoX - 6, photoY - 6, 1, 1],
    [photoX + photoW + 6, photoY - 6, -1, 1],
    [photoX - 6, photoY + photoH + 6, 1, -1],
    [photoX + photoW + 6, photoY + photoH + 6, -1, -1],
  ].forEach(([cx, cy, dx, dy]) => {
    p.line(cx, cy, cx + tick * dx, cy);
    p.line(cx, cy, cx, cy + tick * dy);
  });

  p.noStroke();
  p.fill(0);
  p.textFont("monospace");
  p.textAlign(p.CENTER, p.TOP);
  p.textStyle(p.BOLD);
  p.textSize(12);
  p.text("EXHIBIT A — GOOD DOG, FULL BLOOM", w / 2, captionY);
  p.textStyle(p.NORMAL);
}

const DOG_PHOTO_ASPECT = 1125 / 1500; // source photo's width / height

let dogImage = null;
let dogImageRequested = false;
let ditheredDogPhoto = null;

function ensureDogImage(p) {
  if (dogImage || dogImageRequested) return;
  dogImageRequested = true;
  p.loadImage(
    dogPhotoUrl,
    (img) => {
      dogImage = img;
      buildDitheredDogPhoto(p);
      if (typeof p.redraw === "function") p.redraw();
    },
    (err) => {
      console.error("Failed to load dog photo", err);
    }
  );
}

// Floyd–Steinberg error-diffusion dithering, computed once and cached in an
// offscreen graphics buffer so it doesn't redo the pixel math on every draw.
function buildDitheredDogPhoto(p) {
  const targetW = 304;
  const targetH = Math.round(targetW / DOG_PHOTO_ASPECT);
  const g = p.createGraphics(targetW, targetH);
  g.pixelDensity(1);
  g.image(dogImage, 0, 0, targetW, targetH);
  g.loadPixels();

  const count = targetW * targetH;
  const lum = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    const o = i * 4;
    lum[i] = 0.2126 * g.pixels[o] + 0.7152 * g.pixels[o + 1] + 0.0722 * g.pixels[o + 2];
  }

  for (let y = 0; y < targetH; y += 1) {
    for (let x = 0; x < targetW; x += 1) {
      const i = y * targetW + x;
      const oldVal = lum[i];
      const newVal = oldVal < 128 ? 0 : 255;
      const err = oldVal - newVal;
      lum[i] = newVal;
      if (x + 1 < targetW) lum[i + 1] += err * (7 / 16);
      if (y + 1 < targetH) {
        if (x > 0) lum[i + targetW - 1] += err * (3 / 16);
        lum[i + targetW] += err * (5 / 16);
        if (x + 1 < targetW) lum[i + targetW + 1] += err * (1 / 16);
      }
    }
  }

  for (let i = 0; i < count; i += 1) {
    const o = i * 4;
    const v = lum[i] < 128 ? 0 : 255;
    g.pixels[o] = v;
    g.pixels[o + 1] = v;
    g.pixels[o + 2] = v;
    g.pixels[o + 3] = 255;
  }
  g.updatePixels();

  ditheredDogPhoto = g;
}

// A carrier wave for the beacon's transmission, amplitude driven by two
// stacked noise octaves so it reads as speech-like rather than mechanical.
function drawWaveform(p, w, margin, top, bottom) {
  const midY = top + (bottom - top) / 2;
  const maxAmp = (bottom - top) / 2 - 6;
  p.stroke(0);
  for (let x = margin; x <= w - margin; x += 3) {
    const envelope = 0.35 + 0.65 * p.noise(x * 0.012, 12);
    const wobble = p.noise(x * 0.06, 40) - 0.5;
    const amp = wobble * maxAmp * envelope;
    p.strokeWeight(x % 12 === 0 ? 2.2 : 1.2);
    p.line(x, midY - amp, x, midY + amp);
  }
}

// A field of recursive vines rooted on the ground line. Every tip is either
// a bud or a hollow circuit node, and nearby tips across different plants
// get wired together — nature and network sharing one root system.
function drawGarden(p, w, margin, top, groundY) {
  const plantCount = 5;
  const tips = [];

  for (let i = 0; i < plantCount; i += 1) {
    const x = p.map(i, 0, plantCount - 1, margin + 40, w - margin - 40) + p.random(-10, 10);
    const startAngle = p.random(-0.14, 0.14);
    const startLen = p.random(50, 74);
    const maxDepth = Math.floor(p.random(3, 5));
    growBranch(p, x, groundY, startAngle, startLen, 0, maxDepth, tips);
  }

  p.strokeWeight(0.5);
  for (let i = 0; i < tips.length; i += 1) {
    for (let j = i + 1; j < tips.length; j += 1) {
      const d = p.dist(tips[i].x, tips[i].y, tips[j].x, tips[j].y);
      if (d < 40 && p.random() < 0.1) {
        p.stroke(0);
        p.line(tips[i].x, tips[i].y, tips[j].x, tips[j].y);
      }
    }
  }

  p.strokeWeight(2);
  p.stroke(0);
  p.line(margin, groundY, w - margin, groundY);
  stipple(p, margin, groundY + 2, w - margin, groundY + 18, 5, () => 0.4);

  void top;
}

function growBranch(p, x, y, angle, len, depth, maxDepth, tips) {
  const nx = x + Math.sin(angle) * len;
  const ny = y - Math.cos(angle) * len;

  p.stroke(0);
  p.strokeWeight(p.map(depth, 0, maxDepth, 3.2, 0.8));
  p.line(x, y, nx, ny);

  if (depth >= maxDepth || len < 6) {
    if (p.random() < 0.4) {
      p.noFill();
      p.stroke(0);
      p.strokeWeight(1);
      p.square(nx - 3, ny - 3, 6);
    } else {
      p.noStroke();
      p.fill(0);
      p.circle(nx, ny, 4.5);
    }
    tips.push({ x: nx, y: ny });
    return;
  }

  const branchCount = depth < 1 ? 2 : (p.random() < 0.2 ? 3 : 2);
  for (let i = 0; i < branchCount; i += 1) {
    const spread = 0.32 + depth * 0.06;
    const a = angle + p.map(i, 0, branchCount - 1, -spread, spread) + p.random(-0.08, 0.08);
    growBranch(p, nx, ny, a, len * p.random(0.62, 0.76), depth + 1, maxDepth, tips);
  }
}

// Halftone-style stipple: probability of a dot at each grid cell comes from
// densityFn(x, y) in [0, 1]. This is how "gradients" get faked on a 1-bit
// thermal printer.
function stipple(p, x0, y0, x1, y1, step, densityFn) {
  p.noStroke();
  p.fill(0);
  for (let y = y0; y < y1; y += step) {
    for (let x = x0; x < x1; x += step) {
      const density = densityFn(x, y);
      if (p.random() < density) {
        const s = p.random(0.6, 1.8);
        p.rect(x + p.random(-step / 2, step / 2), y + p.random(-step / 2, step / 2), s, s);
      }
    }
  }
}

function dashedRing(p, cx, cy, r, dashRad, gapRad, weight) {
  p.noFill();
  p.stroke(0);
  p.strokeWeight(weight);
  const step = dashRad + gapRad;
  for (let a = 0; a < Math.PI * 2; a += step) {
    p.arc(cx, cy, r * 2, r * 2, a, Math.min(a + dashRad, Math.PI * 2));
  }
}

function drawBarcode(p, value, centerX, y) {
  const barcodeCanvas = document.createElement("canvas");
  JsBarcode(barcodeCanvas, value, {
    format: "CODE128",
    width: 1,
    height: 52,
    displayValue: false,
    margin: 0,
    background: "#ffffff",
    lineColor: "#000000",
  });
  // Draw directly on p5's canvas: p.image expects a p5 image wrapper, while
  // JsBarcode returns a regular browser canvas.
  p.drawingContext.drawImage(barcodeCanvas, Math.floor(centerX - barcodeCanvas.width / 2), y);
}

function dashedLine(p, x1, y1, x2, y2, dash, gap) {
  p.stroke(0);
  p.strokeWeight(2);
  for (let x = x1; x < x2; x += dash + gap) {
    p.line(x, y1, Math.min(x + dash, x2), y2);
  }
}
