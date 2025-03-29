import { toIso8601 } from '../src/utils.js';

describe('toIso8601', () => {
  test('converts to ISO 8601 format', () => {
    const date = new Date(2025, 4, 13, 17, 19, 23, 29);

    expect(toIso8601(date)).toEqual('2025-05-13 17:19:23.029');
  });
});
