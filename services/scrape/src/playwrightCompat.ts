/**
 * tsx/esbuild keepNames injects `__name(...)` into functions.
 * Playwright serializes evaluate callbacks into the browser where `__name`
 * does not exist — shim it on every new page/context.
 *
 * Passed as a string so tsx cannot rewrite this script with `__name`.
 */
export async function patchPlaywrightContext(context: {
  addInitScript: (script: string | (() => void)) => Promise<unknown>;
}) {
  await context.addInitScript(`(() => {
    if (typeof globalThis.__name !== "function") {
      globalThis.__name = (target) => target;
    }
  })()`);
}
