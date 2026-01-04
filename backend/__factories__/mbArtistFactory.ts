import { MbArtist } from '../../shared/internal/mbArtist';

const buildMbArtist = (overrides?: Partial<MbArtist>): MbArtist => ({
  mbArtistId: '019b8afe-c1b4-74f5-80ba-f025cecacfdd',
  name: 'Default Artist 1',
  sortName: 'Artist, Default 1',
  joinphrase: '',
  position: 1,
  disambiguation: 'Default Disambiguation 1',
  ...overrides,
});

const buildNthMbArtist = (number: number) =>
  buildMbArtist({
    name: `Artist ${number}`,
    position: number,
  });

const buildMbArtists = (count: number): MbArtist[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthMbArtist(n));
};

export { buildMbArtist, buildMbArtists };
