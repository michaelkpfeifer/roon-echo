import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.js';
import type { MbArtist } from '../../shared/internal/mbArtist.js';
import { snakeCaseKeys } from '../src/utils.js';

const buildMbArtist = (overrides?: Partial<MbArtist>): MbArtist => ({
  mbArtistId: '019b8afe-c1b4-74f5-80ba-f025cecacfdd',
  name: 'Default Artist 1',
  sortName: 'Artist, Default 1',
  disambiguation: 'Default Disambiguation 1',
  ...overrides,
});

const buildNthMbArtist = (number: number) =>
  buildMbArtist({
    name: `Artist ${number}`,
  });

const buildMbArtists = (count: number): MbArtist[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthMbArtist(n));
};

const createMbArtist = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<MbArtist>,
): Promise<MbArtist> => {
  const mbArtist = {
    mbArtistId: '019ca520-200b-75b8-b83c-bc28d1ce3816',
    name: 'Test Artist',
    sortName: 'Artist, Test',
    disambiguation: 'Test Disambiguation',
    ...overrides,
  };

  await db<DatabaseSchema['mb_artists']>('mb_artists').insert(
    snakeCaseKeys(mbArtist),
  );

  return mbArtist;
};

export { buildMbArtist, buildMbArtists, createMbArtist };
