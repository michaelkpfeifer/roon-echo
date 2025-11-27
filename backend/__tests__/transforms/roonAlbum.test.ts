import type { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
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

    const result = transformToRoonAlbum(rawRoonAlbum, roonAlbumId);

    expect(result).toEqual({
      roonAlbumId,
      albumName: 'Some Album Name',
      artistName: 'Some Artist Name',
      imageKey: 'someimagekey',
      itemKey: '123:45',
    });
  });
});
