import { err, ok } from 'neverthrow';
import { describe, expect, it } from 'vitest';

import { buildPersistedRoonAlbum } from '../__factories__/persistedRoonAlbumFactory.js';
import { buildRawRoonAlbum } from '../__factories__/rawRoonAlbumFactory.js';
import { mergePersistedRoonAlbum } from '../src/roonData.js';

describe('mergePersistedRoonAlbum', () => {
  it('returns a merged Roon album if data is present in the database', () => {
    const roonAlbumId = '019bd187-1aea-74ba-9b84-ec279f4354dd';
    const candidatesFetchedAt = '2026-02-02 22:10';
    const candidatesMatchedAt = '2026-02-02 22:11';
    const rawRoonAlbum = buildRawRoonAlbum();
    const persistedRoonAlbum = buildPersistedRoonAlbum({
      roonAlbumId,
      candidatesFetchedAt,
      candidatesMatchedAt,
    });

    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      ok(persistedRoonAlbum),
    );

    expect(roonAlbum.roonAlbumId).toEqual(roonAlbumId);
    expect(roonAlbum.albumName).toEqual(rawRoonAlbum.title);
    expect(roonAlbum.artistName).toEqual(rawRoonAlbum.subtitle);
    expect(roonAlbum.candidatesFetchedAt).toEqual(candidatesFetchedAt);
    expect(roonAlbum.candidatesMatchedAt).toEqual(candidatesMatchedAt);
  });

  it('assigns a new albumId if data is not present in the database', () => {
    const rawRoonAlbum = buildRawRoonAlbum();

    const roonAlbum = mergePersistedRoonAlbum(
      rawRoonAlbum,
      err({
        error: 'repository.ts: fetchRoonAlbum(): Error: roonAlbumNotFound',
        albumName: rawRoonAlbum.title,
        artistName: rawRoonAlbum.subtitle,
      }),
    );

    expect(roonAlbum.roonAlbumId.length).toEqual(36);
    expect(roonAlbum.albumName).toEqual(rawRoonAlbum.title);
    expect(roonAlbum.artistName).toEqual(rawRoonAlbum.subtitle);
    expect(roonAlbum.candidatesFetchedAt).toEqual(null);
    expect(roonAlbum.candidatesMatchedAt).toEqual(null);
  });
});
