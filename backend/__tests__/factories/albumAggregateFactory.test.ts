import { describe, expect, it } from 'vitest';

import { buildAlbumAggregate } from '../../__factories__/albumAggregateFactory';
import { buildRoonAlbum } from '../../__factories__/roonAlbumFactory';
import {
  buildEmptyAlbumAggregate,
  buildAlbumAggregateWithRoonAlbum,
} from '../../src/factories/albumAggregateFactory.js';

describe('buildEmptyAlbumAggregate', () => {
  it('returns an empty album aggregate with stage set to "empty"', () => {
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

describe('buildAlbumAggregateWithRoonAlbum', () => {
  it('creates an aggregate with stage set to "withRoonAlbum"', () => {
    const emptyAlbumAggregate = buildAlbumAggregate('empty', {});
    const roonAlbum = buildRoonAlbum();

    const result = buildAlbumAggregateWithRoonAlbum(
      emptyAlbumAggregate,
      roonAlbum,
    );

    expect(result.stage).toBe('withRoonAlbum');
    expect(result.id).toBe(roonAlbum.roonAlbumId);
    expect(result.roonAlbum).toBe(roonAlbum);
  });
});
