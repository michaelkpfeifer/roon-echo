import fp from 'lodash/fp.js';

const normalizeTrackTitle = (title: string) =>
  title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\p{P}/gu, '')
    .toLowerCase()
    .trim();

const compareMbAndRoonTracks = (mbTracks: string[], roonTracks: string[]) => {
  return fp.isEqual(
    mbTracks.map((track) => normalizeTrackTitle(track)),
    roonTracks.map((track) => normalizeTrackTitle(track)),
  );
};

export { compareMbAndRoonTracks };
