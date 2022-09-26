import path from "path";

export const loaders = {
  ".js": "js",
  ".cjs": "js",
  ".mjs": "js",
  ".ts": "ts",
};

export function support(filename: string) {
  if (!filename.includes("node_modules")) {
    if (path.extname(filename) in loaders) {
      return true;
    }
  }
  return false;
}
