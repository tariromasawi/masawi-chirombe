import { readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const prerender = join(root, "node_modules/.nitro/prerender/index.mjs");
const app = (await import(pathToFileURL(prerender).href)).default;
const response = await app.fetch(new Request("http://localhost/masawi-chirombe/"));
let html = (await response.text()).replaceAll("\u0000", "");
if (response.status !== 200 || !html.includes("CHIROMBE")) {
  console.error("GitHub Pages render failed", response.status, html.length);
  process.exit(1);
}
const out = join(root, ".output/public");
const files = readdirSync(join(out, "assets"));
const swap = (prefix, extension) => files.find((name) => name.startsWith(prefix) && name.endsWith(extension));
const index = swap("index-", ".js");
const routes = swap("routes-", ".js");
const styles = swap("styles-", ".css");
if (!index || !routes || !styles) {
  console.error("Missing built assets", files);
  process.exit(1);
}
html = html
  .replaceAll(/assets\/index-[^"]+\.js/g, `assets/${index}`)
  .replaceAll(/assets\/routes-[^"]+\.js/g, `assets/${routes}`)
  .replaceAll(/assets\/styles-[^"]+\.css/g, `assets/${styles}`);
writeFileSync(join(out, "index.html"), html);
writeFileSync(join(out, "404.html"), html);
writeFileSync(join(out, ".nojekyll"), "");
console.log("Wrote GitHub Pages HTML", html.length, index, routes, styles);
