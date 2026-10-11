type SocketResult<T, E> = { ok: true; value: T } | { ok: false; error: E };

export type { SocketResult };
