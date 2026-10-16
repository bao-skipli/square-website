export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@/firebase/modifiersService") {
    return {
      shortCircuit: true,
      url: "virtual:modifiersService",
    };
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
  return nextLoad(url, context);
}
