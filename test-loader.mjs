// ESM loader: resolves extensionless relative imports to .ts files.
// Required because --experimental-strip-types does not add a custom
// resolver, so bare specifiers like "./analytics" in test files need
// help finding "./analytics.ts".
import { resolve as pathResolve } from "path";
import { existsSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";

export function resolve(specifier, context, nextResolve) {
  const { parentURL } = context;

  if (
    parentURL &&
    (specifier.startsWith("./") || specifier.startsWith("../")) &&
    !specifier.match(/\.(ts|js|mjs|cjs|json)$/)
  ) {
    const parentPath = fileURLToPath(parentURL);
    const parentDir = pathResolve(parentPath, "..");
    const tsPath = pathResolve(parentDir, specifier + ".ts");
    if (existsSync(tsPath)) {
      return { url: pathToFileURL(tsPath).href, shortCircuit: true };
    }
  }

  return nextResolve(specifier, context);
}
