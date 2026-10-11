import type { TagValidationError } from './tagValidationError.js';

type TagError =
  | { type: 'validation'; errors: TagValidationError[] }
  | { type: 'internal'; message: string };

export type { TagError };
