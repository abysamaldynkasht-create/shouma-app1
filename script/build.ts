import { build as viteBuild } from "vite";
import { build as esBuild } from "esbuild";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");
const viteConfigPath = path.resolve(rootDir, "vite.config.ts");
const entryPoint = path.resolve(rootDir, "server/index.ts");
const outFile = path.resolve(rootDir, "dist/index.cjs");

async function build() {
  console.log("Building Vite client...");
  await viteBuild({
    configFile: viteConfigPath,
  });

  console.log("Building server with esbuild...");
  await esBuild({
    entryPoints: [entryPoint],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: outFile,
    sourcemap: true,
    packages: "external",
    external: ["./vite", "./vite.js", "../vite.config", "../vite.config.ts"],
  });

  console.log("Build complete!");
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
