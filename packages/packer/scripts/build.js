import {buildSync} from "esbuild";
import path from "path";
import {fileURLToPath} from "url";
import fs from "fs";
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");

/** @type {import('esbuild').BuildOptions} */
const options = {
  absWorkingDir: path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
  entryPoints: [
    './src/index.ts',
    './src/cli.ts'
  ],
  bundle: true,
  splitting: true,
  minify: process.env.NODE_ENV !== 'development',
  sourcemap: "inline",
  platform: "node",
  format: "esm",
  target: ['node16', 'node18'],
  external: Object.keys(packageJson.dependencies),
  banner: {
    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
  },
  outdir: "lib",
  outExtension: {
    ".js": ".mjs"
  }
}

if (fs.existsSync(path.join(options.absWorkingDir || process.cwd(), options.outdir))) {
  fs.rmSync(path.join(options.absWorkingDir || process.cwd(), options.outdir), {recursive: true, force: true})
}

buildSync(options);
