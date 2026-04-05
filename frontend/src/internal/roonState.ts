import type { Zone } from '../../../shared/internal/zone';

type RoonState = {
  zones: Record<string, Zone>;
} | null;

export type { RoonState };
