import type { Knex } from 'knex';

import type { RoonTrack } from '../../shared/internal/roonTrack.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import { snakeCaseKeys } from '../src/utils.js';

const buildRoonTrack = (overrides?: Partial<RoonTrack>): RoonTrack => ({
  trackId: '019b894a-8ba4-7637-bd24-7227397cac9e',
  albumId: '019b894b-0a5b-7a69-84bb-e7ac6de04307',
  roonTrackName: 'Default Track 1',
  roonNumber: '1',
  roonPosition: 1,
  ...overrides,
});

const buildNthRoonTrack = (number: number): RoonTrack => {
  return buildRoonTrack({
    roonTrackName: `Track ${number}`,
    roonNumber: `${number}`,
    roonPosition: number,
  });
};

const buildRoonTracks = (count: number): RoonTrack[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthRoonTrack(n));
};

const createRoonTrack = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<RoonTrack>,
): Promise<RoonTrack> => {
  const roonTrack = {
    trackId: '019b894a-8ba4-7637-bd24-7227397cac9e',
    albumId: '019b894b-0a5b-7a69-84bb-e7ac6de04307',
    roonTrackName: 'Default Track 1',
    roonNumber: '1',
    roonPosition: 1,
    createdAt: '2026-01-21 15:00',
    updatedAt: '2026-01-21 15:00',
    ...overrides,
  };

  await db('roon_tracks').insert(snakeCaseKeys(roonTrack));
  return roonTrack;
};

export { buildRoonTrack, buildRoonTracks, createRoonTrack };
