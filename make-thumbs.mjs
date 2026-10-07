import sharp from "sharp";
import { readdirSync, mkdirSync } from "fs";
import path from "path";

const OUT = "img/proyectos/thumbs";
const FOLDERS = ["img/proyectos/webp", "img/proyectos"];
const EXTS = [".webp", ".jpg", ".jpeg", ".png", ".gif"];
mkdirSync(OUT, { recursive: true });

for (const dir of FOLDERS) {
  for (const f of readdirSync(dir, { withFileTypes: true })) {
    if (!f.isFile()) continue;

    const ext = path.extname(f.name).toLowerCase();
    if (!EXTS.includes(ext)) continue;

    const name = path.basename(f.name, path.extname(f.name)) + ".webp";
    const animated = ext === ".gif";
    const img = sharp(path.join(dir, f.name), { animated });

    const out = animated
      ? img.resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 })
      : img
          .resize({ width: 800, height: 1000, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 82 });

    await out.toFile(path.join(OUT, name));
    console.log("✓", name);
  }
}