import { describe, expect, test } from 'vitest';

import { lookupZoneName } from '../src/utils';

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
