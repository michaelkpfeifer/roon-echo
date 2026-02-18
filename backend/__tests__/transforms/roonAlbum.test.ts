import { describe, expect, it } from 'vitest';

import { transformToRoonAlbum } from '../../src/transforms/roonAlbum.js';

describe('transformToRoonAlbum', () => {
  it('transforms a RawRoonAlbum into a RoonAlbum', () => {
    const rawRoonAlbum = {
      title: 'Some Album Name',
      subtitle: 'Some Artist Name',
      imageKey: 'someimagekey',
      itemKey: '123:45',
      hint: 'list',
    };
    const albumId = '08575675-304f-470f-ac02-a29f0d2e64b1';
    const persistedAttributes = {
      albumId,
      mbCandidatesFetchedAt: '2025-12-31 16:00',
      mbCandidatesMatchedAt: '2025-12-31 16:01',
    };

    const result = transformToRoonAlbum(rawRoonAlbum, persistedAttributes);

    expect(result).toEqual({
      albumId,
      roonAlbumName: 'Some Album Name',
      roonAlbumArtistName: 'Some Artist Name',
      imageKey: 'someimagekey',
      itemKey: '123:45',
      mbCandidatesFetchedAt: '2025-12-31 16:00',
      mbCandidatesMatchedAt: '2025-12-31 16:01',
    });
  });
});
