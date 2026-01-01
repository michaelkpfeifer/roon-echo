import { isRoonAlbumUnprocessable, skipMbCandidate } from '../src/albumData.js';

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

describe('skipMbCandidate', () => {
  it('returns false if all media of the release have tracks', () => {
    const release = {
      media: [
        {
          position: 1,
          tracks: [{ title: 'Track One' }, { title: 'Track Two' }],
        },
        {
          position: 2,
          tracks: [{ title: 'Track Eleven' }, { title: 'Track Twelve' }],
        },
      ],
    };

    const result = skipMbCandidate(release);

    expect(result).toEqual(false);
  });

  it('returns true if the release contains some medium without tracks', () => {
    const release = {
      media: [
        {
          position: 1,
          tracks: [{ title: 'Track One' }, { title: 'Track Two' }],
        },
        {
          position: 2,
        },
      ],
    };

    const result = skipMbCandidate(release);

    expect(result).toEqual(true);
  });
});
