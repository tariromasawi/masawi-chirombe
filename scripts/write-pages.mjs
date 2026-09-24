import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const prerender = join(root, "node_modules/.nitro/prerender/index.mjs");
const app = (await import(pathToFileURL(prerender).href)).default;
const response = await app.fetch(new Request("http://localhost/masawi-chirombe/"));
const html = await response.text();
if (response.status !== 200 || !html.includes("CHIROMBE") || !html.includes("/masawi-chirombe/assets/")) {
  console.error("GitHub Pages render failed", response.status, html.length);
  process.exit(1);
}
const out = join(root, ".output/public");
writeFileSync(join(out, "index.html"), html);
writeFileSync(join(out, "404.html"), html);
writeFileSync(join(out, ".nojekyll"), "");
console.log("Wrote GitHub Pages HTML", html.length);
