import { describe, expect, it } from 'vitest';

import { RawRoonLoadAlbumResponseSchema } from '../../src/schemas/rawRoonLoadAlbumResponse.js';

describe('RawRoonLoadAlbumResponseSchema', () => {
  const mockResponse = {
    items: [
      {
        title: 'Play Album',
        subtitle: null,
        imageKey: null,
        itemKey: '128:0',
        hint: 'action_list',
      },
      {
        title: "1. I'm Holding You",
        subtitle: 'Ween',
        imageKey: null,
        itemKey: '128:1',
        hint: 'action_list',
      },
      {
        title: '2. Japanese Cowboy',
        subtitle: 'Ween',
        imageKey: null,
        itemKey: '128:2',
        hint: 'action_list',
      },
    ],
    offset: 0,
    list: {
      level: 3,
      title: '12 Golden Country Greats',
      subtitle: 'Ween',
      imageKey: '0290033b354e02d0090b8d4ab7b5aa53',
      count: 3,
      displayOffset: null,
    },
  };

  it('should remove first item from items array', () => {
    const result = RawRoonLoadAlbumResponseSchema.parse(mockResponse);

    expect(result.items).toHaveLength(2);
    expect(result.items[1].title).toBe('2. Japanese Cowboy');
  });
});
