import { transformToRoonAlbum } from '../../src/transforms/roonAlbum';

describe('transformToRoonAlbum', () => {
  it('transforms a RawRoonAlbum into a RoonAlbum', () => {
    const rawRoonAlbum = {
      title: 'Some Album Name',
      subtitle: 'Some Artist Name',
      imageKey: 'someimagekey',
      itemKey: '123:45',
      hint: 'list',
    };
    const roonAlbumId = '08575675-304f-470f-ac02-a29f0d2e64b1';
    const persistedAttributes = {
      roonAlbumId,
      candidatesFetchedAt: '2025-12-31 16:00',
      candidatesMatchedAt: '2025-12-31 16:01',
    };

    const result = transformToRoonAlbum(rawRoonAlbum, persistedAttributes);

    expect(result).toEqual({
      roonAlbumId,
      albumName: 'Some Album Name',
      artistName: 'Some Artist Name',
      imageKey: 'someimagekey',
      itemKey: '123:45',
      candidatesFetchedAt: '2025-12-31 16:00',
      candidatesMatchedAt: '2025-12-31 16:01',
    });
  });
});
