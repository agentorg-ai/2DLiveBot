// The demo page, built into dist/page and served on this machine under a content policy that
// allows scripts and styles from the page's own files only and images from them or `data:`.
// `--build` builds it and stops. PORT changes the port.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "dist", "page");
mkdirSync(out, { recursive: true });
await build({
  entryPoints: [join(root, "demo", "demo.ts")],
  outfile: join(out, "demo.js"),
  bundle: true,
  format: "esm",
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});
for (const file of ["index.html", "demo.css"])
  copyFileSync(join(root, "demo", file), join(out, file));

if (!process.argv.includes("--build")) {
  const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript" };
  const policy = [
    "default-src 'none'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "base-uri 'none'",
  ].join("; ");
  const server = createServer((request, response) => {
    const path = new URL(request.url ?? "/", "http://localhost").pathname;
    const file = normalize(join(out, path === "/" ? "index.html" : path));
    if (!file.startsWith(out + sep) || !existsSync(file) || !(extname(file) in types)) {
      response.writeHead(404).end();
      return;
    }
    response.writeHead(200, {
      "Content-Type": `${types[extname(file)]}; charset=utf-8`,
      "Content-Security-Policy": policy,
      "Cache-Control": "no-store",
    });
    response.end(readFileSync(file));
  });
  const port = Number(process.env.PORT) || 7745;
  server.listen(port, "127.0.0.1", () => console.log(`The avatar demo: http://localhost:${port}`));
}
