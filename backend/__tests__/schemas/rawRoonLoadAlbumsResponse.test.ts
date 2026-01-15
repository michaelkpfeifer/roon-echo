import { describe, expect, it, vi } from 'vitest';

import { RawRoonLoadAlbumsResponseSchema } from '../../src/schemas/rawRoonLoadAlbumsResponse';

describe('RawRoonLoadAlbumsResponseSchema', () => {
  const mockBaseResponse = {
    offset: 0,
    list: {
      level: 1,
      title: 'Albums',
      subtitle: null,
      imageKey: null,
      count: 6,
      displayOffset: null,
    },
  };

  it('should allow valid albums through', () => {
    const validAlbum = {
      title: 'Dark Side of the Moon',
      subtitle: 'Pink Floyd',
      imageKey: 'someImageKey',
      itemKey: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [validAlbum] };
    const result = RawRoonLoadAlbumsResponseSchema.parse(data);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Dark Side of the Moon');
  });

  it('should filter out albums with empty titles', () => {
    const invalidAlbum = {
      title: '',
      subtitle: 'Some Artist',
      imageKey: 'someImageKey',
      itemKey: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [invalidAlbum] };
    const result = RawRoonLoadAlbumsResponseSchema.parse(data);

    expect(result.items).toHaveLength(0);
  });

  it('should filter out "Unknown Artist" subtitles', () => {
    const invalidAlbum = {
      title: 'Greatest Hits',
      subtitle: 'Unknown Artist',
      imageKey: 'someImageKey',
      itemKey: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [invalidAlbum] };
    const result = RawRoonLoadAlbumsResponseSchema.parse(data);

    expect(result.items).toHaveLength(0);
  });

  it('should log a warning when an album is filtered', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidAlbum = {
      title: 'Greatest Hits',
      subtitle: 'Unknown Artist',
      imageKey: 'someImageKey',
      itemKey: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [invalidAlbum] };
    RawRoonLoadAlbumsResponseSchema.parse(data);

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });
});
