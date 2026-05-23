import { describe, expect, test } from 'vitest';

import {
  albumsCount,
  artistsCount,
  formatAsHoursMinutesSeconds,
  formatMbTrackLength,
  formatRoonTrackLength,
  lookupZoneName,
  tracksCount,
} from '../src/utils';
import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import { buildRoonAlbum } from '../../shared/factories/roonAlbumFactory';
import { buildRoonTrack } from '../../shared/factories/roonTrackFactory';
import { buildAlbumAggregate } from '../../shared/factories/albumAggregateFactory';
import {
  albumUuids1,
  albumUuids2,
  trackUuids1,
  trackUuids2,
} from '../../shared/factories/uuids';

describe('lookupZoneName', () => {
  const mockZones = {
    'zone-1': {
      zoneId: '1601f4f798ff1773c83b77e489eaff98f7f4',
      displayName: 'MP 2000',
      state: 'stopped',
      queueTimeRemaining: 0,
      nowPlaying: null,
    },
    'zone-2': {
      zoneId: '16013b5837d2ba31dfcaaf0795cbf6a08681',
      displayName: 'WiiM',
      state: 'stopped',
      queueTimeRemaining: 0,
      nowPlaying: null,
    },
    'zone-3': {
      zoneId: '16010e19bbbbedb74142ab9fcf4ec83f2dbb',
      displayName: '',
      state: 'stopped',
      queueTimeRemaining: 0,
      nowPlaying: null,
    },
  };

  test('returns displayName when zone exists and has displayName', () => {
    expect(lookupZoneName(mockZones, 'zone-1')).toBe('MP 2000');
  });

  test('returns "-" when displayName is falsy', () => {
    expect(lookupZoneName(mockZones, 'zone-3')).toBe('-');
  });

  test('throws when zone does not exist (expected behavior)', () => {
    expect(() => lookupZoneName(mockZones, 'nonexistent')).toThrow();
  });
});

describe('formatMbTrackLength', () => {
  test('converts milliseconds to mm:ss', () => {
    expect(formatMbTrackLength(210000)).toBe('3:30');
  });

  test('pads single digit seconds with a leading zero', () => {
    expect(formatMbTrackLength(61000)).toBe('1:01');
  });

  test('rounds down partial seconds', () => {
    expect(formatMbTrackLength(65999)).toBe('1:05');
  });

  test('handles zero correctly', () => {
    expect(formatMbTrackLength(0)).toBe('0:00');
  });
});

describe('formatRoonTrackLength', () => {
  test('converts seconds to mm:ss', () => {
    expect(formatRoonTrackLength(125)).toBe('2:05');
  });

  test('handles long tracks (over 10 minutes)', () => {
    expect(formatRoonTrackLength(660)).toBe('11:00');
  });
});

describe('formatAsHoursMinutesSeconds', () => {
  test('converts seconds to hh:mm:ss', () => {
    expect(formatAsHoursMinutesSeconds(3700)).toBe('01:01:40');
  });

  test('uses three digits for hours if needed', () => {
    expect(formatAsHoursMinutesSeconds(432000)).toBe('120:00:00');
  });

  test('pads single digit hours with a pending zero', () => {
    expect(formatAsHoursMinutesSeconds(7200)).toBe('02:00:00');
  });

  test('pads single digit minutes with a pending zero', () => {
    expect(formatAsHoursMinutesSeconds(120)).toBe('00:02:00');
  });

  test('pads single digit seconds with a pending zero', () => {
    expect(formatAsHoursMinutesSeconds(5)).toBe('00:00:05');
  });

  test('handles zero correctly', () => {
    expect(formatAsHoursMinutesSeconds(0)).toBe('00:00:00');
  });

  test('returns "-" for null values', () => {
    expect(formatAsHoursMinutesSeconds(null)).toBe('-');
  });
});

describe('counts', () => {
  const album1 = buildRoonAlbum({
    albumId: albumUuids1[1],
    roonAlbumName: 'Default Album 1',
    roonAlbumArtistName: 'Default Artist 1',
    itemKey: '1234:1',
    imageKey: 'imgKey-' + albumUuids1[1],
  });

  const album2 = buildRoonAlbum({
    albumId: albumUuids2[2],
    roonAlbumName: 'Default Album 2',
    roonAlbumArtistName: 'Default Artist 2',
    itemKey: '1234:2',
    imageKey: 'imgKey-' + albumUuids2[2],
  });

  const track11 = buildRoonTrack({
    trackId: trackUuids1[1],
    albumId: albumUuids1[1],
    roonTrackName: 'Default Track 1 1',
    roonNumber: '1',
    roonPosition: 1,
  });

  const track12 = buildRoonTrack({
    trackId: trackUuids1[2],
    albumId: albumUuids1[1],
    roonTrackName: 'Default Track 1 2',
    roonNumber: '2',
    roonPosition: 2,
  });

  const track13 = buildRoonTrack({
    trackId: trackUuids1[3],
    albumId: albumUuids1[1],
    roonTrackName: 'Default Track 1 3',
    roonNumber: '3',
    roonPosition: 3,
  });

  const track21 = buildRoonTrack({
    trackId: trackUuids2[1],
    albumId: albumUuids2[2],
    roonTrackName: 'Default Track 2 1',
    roonNumber: '1',
    roonPosition: 1,
  });

  const track22 = buildRoonTrack({
    trackId: trackUuids2[2],
    albumId: albumUuids2[2],
    roonTrackName: 'Default Track 2 2',
    roonNumber: '2',
    roonPosition: 2,
  });

  const track23 = buildRoonTrack({
    trackId: trackUuids2[3],
    albumId: albumUuids2[2],
    roonTrackName: 'Default Track 2 3',
    roonNumber: '3',
    roonPosition: 3,
  });

  const aggregate1 = buildAlbumAggregate('withRoonTracks', album1, [
    track11,
    track12,
    track13,
  ]);

  const aggregate2 = buildAlbumAggregate('withRoonTracks', album2, [
    track21,
    track22,
    track23,
  ]);

  describe('albumsCount', () => {
    test('returns the correct number of albums', () => {
      expect(albumsCount([aggregate1, aggregate2])).toBe(2);
    });
  });

  describe('artistsCount', () => {
    test('returns the correct number of artists', () => {
      expect(artistsCount([aggregate1, aggregate2])).toBe(2);
    });
  });

  describe('tracksCount', () => {
    test('returns the correct number of tracks', () => {
      expect(tracksCount([aggregate1, aggregate2])).toBe(6);
    });
  });
});
