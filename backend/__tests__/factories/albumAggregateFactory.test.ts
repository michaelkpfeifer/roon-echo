import { describe, expect, it } from 'vitest';

import { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import { buildAlbumAggregate } from '../../__factories__/albumAggregateFactory';
import { buildMbCandidates } from '../../__factories__/mbCandidateFactory';
import { buildRoonAlbum } from '../../__factories__/roonAlbumFactory';
import { buildRoonTracks } from '../../__factories__/roonTrackFactory';
import {
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
  buildAlbumAggregateWithoutMbMatch,
  buildEmptyAlbumAggregate,
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
    const emptyAlbumAggregate = buildAlbumAggregate('empty', {}) as Extract<
      AlbumAggregate,
      { stage: 'empty' }
    >;
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

describe('buildAlbumAggregateWithRoonTracks', () => {
  it('creates an aggregate with stage set to "withRoonTracks"', () => {
    const albumAggregateWithRoonAlbum = buildAlbumAggregate(
      'withRoonAlbum',
      {},
    ) as Extract<AlbumAggregate, { stage: 'withRoonAlbum' }>;
    const roonTracks = buildRoonTracks(4);

    const result = buildAlbumAggregateWithRoonTracks(
      albumAggregateWithRoonAlbum,
      roonTracks,
    );

    expect(result.stage).toBe('withRoonTracks');
    expect(result.roonTracks).toBe(roonTracks);
  });
});

describe('buildAlbumAggregateWithMbMatch', () => {
  it('creates an aggregate with stage set to "withMbMatch"', () => {});
});

describe('buildAlbumAggregateWithoutMbMatch', () => {
  it('creates an aggregate with stage set to "withoutMbMatch"', () => {
    const albumAggregateWithRoonTracks = buildAlbumAggregate(
      'withRoonTracks',
      {},
    ) as Extract<AlbumAggregate, { stage: 'withRoonTracks' }>;
    const mbCandidates = buildMbCandidates(2);

    const result = buildAlbumAggregateWithoutMbMatch(
      albumAggregateWithRoonTracks,
      mbCandidates,
    );

    expect(result.stage).toBe('withoutMbMatch');
    expect(result.mbCandidates).toBe(mbCandidates);
  });
});
