export const MIN_LOADING_MS = 300;

export async function withMinDelay(promiseOrFn, minDelay = MIN_LOADING_MS) {
  const startTime = Date.now();
  let result;
  let hasError = false;
  let error;

  try {
    const promise = typeof promiseOrFn === "function" ? promiseOrFn() : promiseOrFn;
    result = await promise;
  } catch (err) {
    hasError = true;
    error = err;
  }

  const elapsed = Date.now() - startTime;
  const remaining = minDelay - elapsed;
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }

  if (hasError) {
    throw error;
  }
  return result;
}
