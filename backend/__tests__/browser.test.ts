import { describe, expect, it } from 'vitest';

import {
  rawLoadAlbumResponseSchema,
  rawLoadAlbumsResponseSchema,
} from '../src/browser.js';

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
});

describe('RawRoonLoadAlbumResponseSchema', () => {
  const mockResponse = {
    items: [
      {
        title: 'Play Album',
        subtitle: null,
        image_key: null,
        item_key: '128:0',
        hint: 'action_list',
      },
      {
        title: "1. I'm Holding You",
        subtitle: 'Ween',
        image_key: null,
        item_key: '128:1',
        hint: 'action_list',
      },
      {
        title: '2. Japanese Cowboy',
        subtitle: 'Ween',
        image_key: null,
        item_key: '128:2',
        hint: 'action_list',
      },
    ],
    offset: 0,
    list: {
      level: 3,
      title: '12 Golden Country Greats',
      subtitle: 'Ween',
      image_key: '0290033b354e02d0090b8d4ab7b5aa53',
      count: 3,
      display_offset: null,
    },
  };

  it('should remove first item from items array', () => {
    const result = rawLoadAlbumResponseSchema.parse(mockResponse);

    expect(result.items).toHaveLength(2);
    expect(result.items[1].title).toBe('2. Japanese Cowboy');
  });
});
