import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.resolve(__dirname, "../src");

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@/firebase/modifiersService") {
    return {
      shortCircuit: true,
      url: "virtual:modifiersService",
    };
  }

  if (specifier === "@/firebase/firebaseConfig") {
    return {
      shortCircuit: true,
      url: "virtual:firebaseConfig",
    };
  }

  if (specifier.startsWith("@/")) {
    const rel = specifier.slice(2);
    const absPath = path.join(srcDir, rel);
    const fileUrl = pathToFileURL(absPath).href;
    try {
      return await nextResolve(fileUrl, context);
    } catch (err) {
      if (err.code === "ERR_MODULE_NOT_FOUND" && !fileUrl.endsWith(".js")) {
        return await nextResolve(fileUrl + ".js", context);
      }
      throw err;
    }
  }

  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (err.code === "ERR_MODULE_NOT_FOUND" && !specifier.endsWith(".js")) {
      return await nextResolve(specifier + ".js", context);
    }
    throw err;
  }
}

export async function load(url, context, nextLoad) {
  if (url === "virtual:modifiersService") {
    return {
      format: "module",
      shortCircuit: true,
      source: `
        export function getLocalModifierSets() {
          try {
            const raw = globalThis.localStorage?.getItem("sq_dashboard_modifier_sets");
            if (raw) return JSON.parse(raw);
          } catch (e) {}
          return [{ id: "mod-1", name: "Spice Level" }];
        }
      `,
    };
  }

  if (url === "virtual:firebaseConfig") {
    return {
      format: "module",
      shortCircuit: true,
      source: `
        export const database = {};
        export const auth = {};
        export default {};
      `,
    };
  }

  return nextLoad(url, context);
}
