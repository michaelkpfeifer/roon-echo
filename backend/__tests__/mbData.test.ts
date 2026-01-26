import { describe, expect, it } from 'vitest';

import { skipMbCandidate } from '../src/mbData.js';

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
