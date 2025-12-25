import fp from 'lodash/fp.js';

const normalizeTrackTitle = (title: string) =>
  title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\p{P}/gu, '')
    .toLowerCase()
    .trim();

const compareMbAndRoonTracks = (mbTracks: string[], roonTracks: string[]) =>
  fp.isEqualWith(
    (a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return undefined;
      }

      return normalizeTrackTitle(a) === normalizeTrackTitle(b);
    },
    mbTracks,
    roonTracks,
  );

export { compareMbAndRoonTracks };
