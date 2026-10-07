import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import path from "path";

const IN = "img/proyectos/webp";
const OUT = "img/proyectos/thumbs";
mkdirSync(OUT, { recursive: true });

for (const f of readdirSync(IN).filter(f => f.endsWith(".webp"))) {
  await sharp(path.join(IN, f))
    .resize({ width: 800, height: 640, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(OUT, f));
  console.log("✓", f);
}