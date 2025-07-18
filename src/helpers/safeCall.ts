export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export async function safeCall<T>(fn: () => Promise<T>): Promise<Result<T>>;
export function safeCall<T>(fn: () => T): Result<T>;
export function safeCall<T>(
  fn: () => T | Promise<T>
): Result<T> | Promise<Result<T>> {
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then((value): Result<T> => ({ ok: true, value }))
        .catch(
          (err): Result<T> => ({
            ok: false,
            error: err instanceof Error ? err : new Error("Unknown error"),
          })
        );
    } else {
      return { ok: true, value: result };
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err : new Error("Unknown error"),
    };
  }
}
