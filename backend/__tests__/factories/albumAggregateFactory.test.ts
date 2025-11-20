import { buildEmptyAlbumAggregate } from '../../src/factories/albumAggregateFactory.js';

describe('buildEmptyAlbumAggregate', () => {
  it('returns an empty album aggregate with stage set to empty', () => {
    const result = buildEmptyAlbumAggregate();

    expect(result).toEqual({
      stage: 'empty',
    });
  });

  it('returns a new object on each call', () => {
    const first = buildEmptyAlbumAggregate();
    const second = buildEmptyAlbumAggregate();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
