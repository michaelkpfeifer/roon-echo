import { RoonTrack } from '../../shared/internal/roonTrack';

const buildRoonTrack = (overrides?: Partial<RoonTrack>): RoonTrack => ({
  roonTrackId: '019b894a-8ba4-7637-bd24-7227397cac9e',
  roonAlbumId: '019b894b-0a5b-7a69-84bb-e7ac6de04307',
  trackName: 'Default Track 1',
  number: '1',
  position: 1,
  ...overrides,
});

const buildNthRoonTrack = (number: number): RoonTrack => {
  return buildRoonTrack({
    trackName: `Track ${number}`,
    number: `${number}`,
    position: number,
  });
};

const buildRoonTracks = (count: number): RoonTrack[] => {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  return numbers.map((n) => buildNthRoonTrack(n));
};

export { buildNthRoonTrack, buildRoonTrack, buildRoonTracks };
