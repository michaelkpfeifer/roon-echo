type SocketResult<T> = { ok: true; value: T } | { ok: false; error: string };

export type { SocketResult };
