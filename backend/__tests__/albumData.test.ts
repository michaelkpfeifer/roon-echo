import { isRoonAlbumUnprocessable } from '../src/albumData.js';

describe('isRoonAlbumUnprocessable', () => {
  it('returns true if the unparsed raw Roon Album is null', () => {
    const result = isRoonAlbumUnprocessable(null);

    expect(result).toEqual(true);
  });

  it('returns true if the title attribute is missing', () => {
    const result = isRoonAlbumUnprocessable({
      subtitle: 'Some Subtitle',
    });

    expect(result).toEqual(true);
  });

  it('returns true if the subtitle attribute is missing', () => {
    const result = isRoonAlbumUnprocessable({
      title: 'Some Subtitle',
    });

    expect(result).toEqual(true);
  });

  it('returns true if the title attribute is an empty string', () => {
    const result = isRoonAlbumUnprocessable({
      title: '',
      subtitle: 'Some Subtitle',
    });

    expect(result).toEqual(true);
  });

  it('returns true if the subtitile attribute is "Unknown Artist"', () => {
    const result = isRoonAlbumUnprocessable({
      title: 'Some Title',
      subtitle: 'Unknown Artist',
    });

    expect(result).toEqual(true);
  });

  it('returns false when given proper album and artist names', () => {
    const result = isRoonAlbumUnprocessable({
      title: 'Some Title',
      subtitle: 'Some Subtitle',
    });

    expect(result).toEqual(false);
  });
});
