import { describe, expect, it, vi } from 'vitest';

import { rawLoadAlbumsResponseSchema } from '../src/browser.js';

describe('rawLoadAlbumsResponseSchema', () => {
  const mockBaseResponse = {
    offset: 0,
    list: {
      level: 1,
      title: 'Albums',
      subtitle: null,
      image_key: null,
      count: 6,
      display_offset: null,
    },
  };

  it('should allow valid albums through', () => {
    const validAlbum = {
      title: 'Dark Side of the Moon',
      subtitle: 'Pink Floyd',
      image_key: 'someImageKey',
      item_key: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [validAlbum] };
    const result = rawLoadAlbumsResponseSchema.parse(data);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Dark Side of the Moon');
  });

  it('should filter out albums with empty titles', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidAlbum = {
      title: '',
      subtitle: 'Some Artist',
      image_key: 'someImageKey',
      item_key: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [invalidAlbum] };
    const result = rawLoadAlbumsResponseSchema.parse(data);

    expect(result.items).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[Validation Failed]'),
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Path'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Reason'));

    warn.mockRestore();
  });

  it('should filter out "Unknown Artist" subtitles', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const invalidAlbum = {
      title: 'Greatest Hits',
      subtitle: 'Unknown Artist',
      image_key: 'someImageKey',
      item_key: 'someItemKey',
      hint: 'list',
    };

    const data = { ...mockBaseResponse, items: [invalidAlbum] };
    const result = rawLoadAlbumsResponseSchema.parse(data);

    expect(result.items).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('[Validation Failed]'),
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Path'));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Reason'));

    warn.mockRestore();
  });
});
