import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildMbCandidateSearch,
  buildMbFetchRelease,
  mbUserAgent,
  runMbCandidateSearch,
  runMbFetchRelease,
  skipMbCandidate,
} from '../src/mbData.js';

describe('buildMbCandidateSearch', () => {
  it('contains album name and artist name', () => {
    const url = buildMbCandidateSearch('Ween', 'Quebec');

    expect(url).toContain('Ween');
    expect(url).toContain('Quebec');
    expect(url).toContain('fmt=json');
  });
});

describe('runMbCandidateSearch', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('successfully fetches and parses JSON', async () => {
    const mockResponse = { some: 'JSON Blob' };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await runMbCandidateSearch('Ween', 'Quebec');

    expect(result).toEqual(mockResponse);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('release'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': mbUserAgent,
        }),
      }),
    );
  });

  it('throws an error when response.ok is false', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(runMbCandidateSearch('Ween', 'Quebec')).rejects.toThrow(
      /Error: Failed to fetch/,
    );
  });

  it('handles a network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network Timeout'));

    await expect(runMbCandidateSearch('Ween', 'Quebec')).rejects.toThrow(
      'Network Timeout',
    );
  });
});

describe('buildMbFetchRelease', () => {
  it('contains the MusicBrainz release ID', () => {
    const mbId = '33a9b962-1029-42fa-ab1d-3daff68eee2e';

    const url = buildMbFetchRelease(mbId);

    expect(url).toContain(mbId);
    expect(url).toContain('fmt=json');
  });
});

describe('runMbFetchRelease', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('successfully fetches and parses JSON', async () => {
    const mockResponse = { some: 'JSON Blob' };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const mbId = '33a9b962-1029-42fa-ab1d-3daff68eee2e';
    const result = await runMbFetchRelease(mbId);

    expect(result).toEqual(mockResponse);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('release'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': mbUserAgent,
        }),
      }),
    );
  });

  it('throws an error when response.ok is false', async () => {
    const mbId = '33a9b962-1029-42fa-ab1d-3daff68eee2e';
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    await expect(runMbFetchRelease(mbId)).rejects.toThrow(
      /Error: Failed to fetch/,
    );
  });

  it('handles a network failure', async () => {
    const mbId = '33a9b962-1029-42fa-ab1d-3daff68eee2e';
    vi.mocked(fetch).mockRejectedValue(new Error('Network Timeout'));

    await expect(runMbFetchRelease(mbId)).rejects.toThrow('Network Timeout');
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
