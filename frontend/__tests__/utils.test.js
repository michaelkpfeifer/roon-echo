import { describe, expect, test } from 'vitest';

import { formatMbTrackLength, formatRoonTrackLength, lookupZoneName } from '../src/utils';

describe('lookupZoneName', () => {
  const mockRoonZones = {
    'zone-1': { displayName: 'MP 2000' },
    'zone-2': { displayName: 'WiiM' },
    'zone-3': { displayName: '' },
    'zone-4': { displayName: null },
    'zone-5': {},
  };

  test('returns displayName when zone exists and has displayName', () => {
    expect(lookupZoneName(mockRoonZones, 'zone-1')).toBe('MP 2000');
  });

  test('returns "-" when displayName is falsy', () => {
    expect(lookupZoneName(mockRoonZones, 'zone-3')).toBe('-');
    expect(lookupZoneName(mockRoonZones, 'zone-4')).toBe('-');
    expect(lookupZoneName(mockRoonZones, 'zone-5')).toBe('-');
  });

  test('throws when zone does not exist (expected behavior)', () => {
    expect(() => lookupZoneName(mockRoonZones, 'nonexistent')).toThrow();
  });
});

describe('formatMbTrackLength', () => {
  test('converts milliseconds to mm:ss', () => {
    expect(formatMbTrackLength(210000)).toBe("3:30");
  });

  test('pads single digit seconds with a leading zero', () => {
    expect(formatMbTrackLength(61000)).toBe("1:01");
  });

  test('rounds down partial seconds', () => {
    expect(formatMbTrackLength(65999)).toBe("1:05");
  });

  test('handles zero correctly', () => {
    expect(formatMbTrackLength(0)).toBe("0:00");
  });
});

describe('formatRoonTrackLength', () => {
  test('converts seconds to mm:ss', () => {
    expect(formatRoonTrackLength(125)).toBe("2:05");
  });

  test('handles long tracks (over 10 minutes)', () => {
    expect(formatRoonTrackLength(660)).toBe("11:00");
  });
});
