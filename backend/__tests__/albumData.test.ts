import { isRoonAlbumUnprocessable } from '../src/albumData.js';

describe('isRoonAlbumUnprocessable', () => {
  it('returns true if there is no title', () => {
    const result = isRoonAlbumUnprocessable('', 'Some Artist');

    expect(result).toEqual(true);
  });

  it('returns true if the artitst is "Unknown Artist"', () => {
    const result = isRoonAlbumUnprocessable(
      'Some Album Name',
      'Unknown Artist',
    );

    expect(result).toEqual(true);
  });

  it('returns false when given album and artist names', () => {
    const result = isRoonAlbumUnprocessable(
      'Some Album Name',
      'Some Artist Name',
    );

    expect(result).toEqual(false);
  });
});
