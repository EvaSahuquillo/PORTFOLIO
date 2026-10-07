import sharp from "sharp";
import { readdirSync, mkdirSync, statSync } from "fs";
import path from "path";

const IN = "img/proyectos";
const OUT = "img/proyectos/webp";
mkdirSync(OUT, { recursive: true });

// Busca GIFs en img/proyectos y en todas sus subcarpetas
const gifs = readdirSync(IN, { recursive: true })
  .filter(f => f.toLowerCase().endsWith(".gif"));

if (gifs.length === 0) console.log("No se han encontrado GIFs");

for (const rel of gifs) {
  const src = path.join(IN, rel);
  const name = path.basename(rel, path.extname(rel));
  const dst = path.join(OUT, name + ".webp");

  await sharp(src, { animated: true })
    .webp({ quality: 80, effort: 5 })
    .toFile(dst);

  const before = (statSync(src).size / 1024 / 1024).toFixed(1);
  const after = (statSync(dst).size / 1024 / 1024).toFixed(1);
  console.log(`✓ ${rel}: ${before} MB → ${after} MB`);
}