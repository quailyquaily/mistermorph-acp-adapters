import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageName = process.argv[2];

if (!packageName) {
  throw new Error("missing package name");
}

const toolsDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(toolsDir, "..");
const packageDir = path.join(repoDir, "packages", packageName);
const distDir = path.join(packageDir, "dist");

const indexPath = path.join(packageDir, "src", "index.mjs");
const libPath = path.join(packageDir, "src", "lib.mjs");
const sharedPath = path.join(repoDir, "packages", "shared", "src", "lib.mjs");
const sharedImport = "../../shared/src/lib.mjs";

const [indexSource, libSource, sharedSource] = await Promise.all([
  readFile(indexPath, "utf8"),
  readFile(libPath, "utf8"),
  readFile(sharedPath, "utf8"),
]);

const bundledLib = libSource.replace(sharedImport, "./shared-lib.mjs");

if (bundledLib === libSource) {
  throw new Error(`shared import not found in ${libPath}`);
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await Promise.all([
  writeFile(path.join(distDir, "index.mjs"), indexSource),
  writeFile(path.join(distDir, "lib.mjs"), bundledLib),
  writeFile(path.join(distDir, "shared-lib.mjs"), sharedSource),
]);
