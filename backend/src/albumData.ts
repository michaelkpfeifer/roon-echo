import { RawRoonAlbum } from '@shared/external/rawRoonAlbum';
import { RawRoonLoadAlbumsResponse } from '@shared/external/rawRoonLoadAlbumsResponse';
import { RawRoonTrack } from '@shared/external/rawRoonTrack';
import { AlbumAggregate } from '@shared/internal/albumAggregate';
import { RoonAlbum } from '@shared/internal/roonAlbum';
import { RoonTrack } from '@shared/internal/roonTrack';
import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import fp from 'lodash/fp.js';
import { Socket } from 'socket.io';
import { v7 as uuidv7 } from 'uuid';

import {
  fetchMbCandidates,
  fetchRoonAlbum,
  fetchRoonTracks,
  insertRoonAlbum,
  insertRoonTracks,
  updateCandidatesFetchedAtTimestamp,
  upsertMbCandidate,
} from './repository';
import { camelCaseKeys } from './utils.js';
import { db } from '../db.js';
import * as browser from './browser.js';
import {
  buildEmptyAlbumAggregate,
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
} from './factories/albumAggregateFactory';
import Result from './result.js';
import { compareMbAndRoonTracks } from './roonMbMatches';
import { RawMbCandidateSearchResponseSchema } from './schemas/rawMbCandidateSearchResponse';
import { RawMbFetchReleaseResponseSchema } from './schemas/rawMbFetchReleaseResponse';
import { RawRoonLoadAlbumResponseSchema } from './schemas/rawRoonLoadAlbumResponse';
import { RawRoonLoadAlbumsResponseSchema } from './schemas/rawRoonLoadAlbumsResponse';
import { RawRoonTrackSchema } from './schemas/rawRoonTrack';
import { transformToMbCandidate } from './transforms/mbCandidate';
import {
  transformToRoonAlbum,
  transformToRoonTrack,
} from './transforms/roonAlbum';

dotenv.config();
const mbReleaseEndpoint = process.env.MB_RELEASE_ENDPOINT;
if (!mbReleaseEndpoint) {
  throw new Error(
    `Error: Failed to read MB_RELEASE_ENDPOINT from environment.`,
  );
}

const mbUserAgent = process.env.MB_USER_AGENT;
if (!mbUserAgent) {
  throw new Error(`Error: Failed to read MB_USER_AGENT from environment.`);
}

const buildMbCandidateSearch = (
  albumName: string,
  artistName: string,
): string => {
  const url = new URL(mbReleaseEndpoint);

  const query = `artist:"${artistName}" AND release:"${albumName}"`;

  url.searchParams.set('query', query);
  url.searchParams.set('fmt', 'json');

  return url.toString();
};

const runMbCandidateSearch = async (albumName: string, artistName: string) => {
  const response = await fetch(buildMbCandidateSearch(albumName, artistName), {
    method: 'GET',
    headers: {
      'User-Agent': mbUserAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error: Failed to fetch ${buildMbCandidateSearch(albumName, artistName)} (${response.status}).`,
    );
  }

  const responsePayload = await response.json();

  return responsePayload;
};

const buildMbFetchRelease = (releaseId: string): string => {
  const url = new URL(`${mbReleaseEndpoint}/${releaseId}`);

  url.searchParams.set('inc', 'artists+recordings+labels');
  url.searchParams.set('fmt', 'json');

  return url.toString();
};

const runMbFetchRelease = async (mbReleaseId: string) => {
  const response = await fetch(buildMbFetchRelease(mbReleaseId), {
    method: 'GET',
    headers: {
      'User-Agent': mbUserAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error: Failed to fetch ${buildMbFetchRelease(mbReleaseId)} (${response.status}).`,
    );
  }

  const responsePayload = await response.json();

  return responsePayload;
};

const isRoonAlbumUnprocessable = (unparsedRawRoonAlbum: unknown) => {
  if (
    !(
      typeof unparsedRawRoonAlbum === 'object' &&
      unparsedRawRoonAlbum !== null &&
      'title' in unparsedRawRoonAlbum &&
      typeof unparsedRawRoonAlbum.title == 'string' &&
      'subtitle' in unparsedRawRoonAlbum &&
      typeof unparsedRawRoonAlbum.subtitle == 'string'
    )
  ) {
    return true;
  }

  return (
    unparsedRawRoonAlbum.title === '' ||
    unparsedRawRoonAlbum.subtitle === 'Unknown Artist'
  );
};

const getRoonAlbums = async (browseInstance: RoonApiBrowse) => {
  const response: any = camelCaseKeys(await browser.loadAlbums(browseInstance));

  const unparsedRawRoonLoadAlbumsResponse: unknown = {
    ...response,
    items: response.items.filter(
      (item: any) => !isRoonAlbumUnprocessable(item),
    ),
  };

  const rawRoonLoadAlbumsResponse: RawRoonLoadAlbumsResponse =
    RawRoonLoadAlbumsResponseSchema.parse(unparsedRawRoonLoadAlbumsResponse);

  const rawRoonAlbums: RawRoonAlbum[] = rawRoonLoadAlbumsResponse.items;

  const roonAlbums: RoonAlbum[] = [];
  for (const rawRoonAlbum of rawRoonAlbums) {
    const roonAlbumResult = await fetchRoonAlbum(db, rawRoonAlbum);

    const persistedAttributes = Result.isErr(roonAlbumResult)
      ? {
          roonAlbumId: uuidv7(),
          candidatesFetchedAt: null,
          candidatesMatchedAt: null,
        }
      : fp.pick(
          ['roonAlbumId', 'candidatesFetchedAt', 'candidatesMatchedAt'],
          Result.unwrap(roonAlbumResult),
        );

    const roonAlbum = transformToRoonAlbum(rawRoonAlbum, persistedAttributes);

    if (Result.isErr(roonAlbumResult)) {
      await insertRoonAlbum(db, roonAlbum);
    }

    roonAlbums.push(roonAlbum);
  }

  return roonAlbums;
};

const getRoonTracks = async (
  browseInstance: RoonApiBrowse,
  albumAggregateWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >,
) => {
  const roonAlbum = albumAggregateWithRoonAlbum.roonAlbum;
  const roonTracksResult = await fetchRoonTracks(db, roonAlbum);

  if (Result.isErr(roonTracksResult)) {
    const response: any = camelCaseKeys(
      await browser.loadAlbum(browseInstance, roonAlbum.itemKey),
    );

    const rawRoonLoadAlbumResponse =
      RawRoonLoadAlbumResponseSchema.parse(response);

    const rawRoonTracks: RawRoonTrack[] = rawRoonLoadAlbumResponse.items.map(
      (unparsedRawRoonTrack: unknown) =>
        RawRoonTrackSchema.parse(unparsedRawRoonTrack),
    );

    const roonTracks: RoonTrack[] = rawRoonTracks.map((rawRoonTrack, index) => {
      const roonTrackId = uuidv7();

      return transformToRoonTrack(
        rawRoonTrack,
        roonAlbum.roonAlbumId,
        roonTrackId,
        index,
      );
    });

    await insertRoonTracks(db, roonTracks);

    return Result.unwrap(await fetchRoonTracks(db, roonAlbum));
  } else {
    return Result.unwrap(roonTracksResult);
  }
};

const createAlbumAggregateWithRoonTracks = (
  albumAggregateWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >,
  roonTracks: RoonTrack[],
) => {
  const albumAggregateWithRoonTracks = buildAlbumAggregateWithRoonTracks(
    albumAggregateWithRoonAlbum,
    roonTracks,
  );

  return albumAggregateWithRoonTracks;
};

const createAlbumAggregateWithRoonAlbum = (roonAlbum: RoonAlbum) => {
  const albumAggregateWithRoonAlbum = buildAlbumAggregateWithRoonAlbum(
    buildEmptyAlbumAggregate(),
    roonAlbum,
  );

  return albumAggregateWithRoonAlbum;
};

const mbApiRateLimiter = new Bottleneck({
  minTime: 100,
  maxConcurrent: 1,
});

const readPersistedAlbumAggregateData = async (
  albumAggregateWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
) => {
  const roonAlbum = albumAggregateWithRoonTracks.roonAlbum;
  if (roonAlbum.candidatesFetchedAt) {
    const candidates = await fetchMbCandidates(db, roonAlbum);
    if (roonAlbum.candidatesMatchedAt) {
    } else {
      const roonTrackTitles = albumAggregateWithRoonTracks.roonTracks.map(
        (track) => track.trackName,
      );

      for (const candidate of candidates) {
        const mbTrackTitles = candidate.mbCandidateTracks.map(
          (track) => track.name,
        );

        const comparisonResult = compareMbAndRoonTracks(
          mbTrackTitles,
          roonTrackTitles,
        );
      }
    }
  }

  return roonAlbum;
};

async function processAlbum(album: AlbumAggregate) {
  if (!album.roonAlbum.candidatesFetchedAt) {
    const searchResults = await mbApiRateLimiter.schedule({ priority: 5 }, () =>
      runMbCandidateSearch(
        album.roonAlbum.albumName,
        album.roonAlbum.artistName,
      ),
    );

    const rawMbCandidateSearchResponse =
      RawMbCandidateSearchResponseSchema.parse(searchResults);

    /* eslint-disable no-console */
    // console.log(
    //   'albumData.ts: processAlbum(): rawMbCandidateSearchResponse:',
    //   JSON.stringify(rawMbCandidateSearchResponse, null, 4),
    // );
    /* eslint-enable no-console */

    for (const rawMbCandidate of rawMbCandidateSearchResponse.releases) {
      const fullRelease = await mbApiRateLimiter.schedule({ priority: 1 }, () =>
        runMbFetchRelease(rawMbCandidate.id),
      );

      const rawMbFetchReleaseResponse =
        RawMbFetchReleaseResponseSchema.parse(fullRelease);

      const mbCandidate = transformToMbCandidate(
        album.roonAlbum.roonAlbumId,
        rawMbCandidate,
        rawMbFetchReleaseResponse,
      );

      /* eslint-disable no-console */
      // console.log(
      //   'albumData.ts: processAlbum(): mbCandidate:',
      //   JSON.stringify(mbCandidate, null, 4),
      // );
      /* eslint-enable no-console */

      await upsertMbCandidate(db, mbCandidate);
    }
    album.roonAlbum.candidatesFetchedAt = new Date().toISOString();
    updateCandidatesFetchedAtTimestamp(db, album.roonAlbum);
  }
}

const buildStableAlbumData = async (
  socket: Socket,
  browseInstance: RoonApiBrowse,
) => {
  const roonAlbums = await getRoonAlbums(browseInstance);

  const albumAggregatesWithRoonAlbum: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' }
  >[] = [];
  for (const roonAlbum of roonAlbums) {
    const albumAggregateWithRoonAlbum =
      createAlbumAggregateWithRoonAlbum(roonAlbum);

    albumAggregatesWithRoonAlbum.push(albumAggregateWithRoonAlbum);
  }

  const albumAggregatesWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >[] = [];
  for (const albumAggregateWithRoonAlbum of albumAggregatesWithRoonAlbum) {
    const roonTracks: RoonTrack[] = await getRoonTracks(
      browseInstance,
      albumAggregateWithRoonAlbum,
    );
    const albumAggregateWithRoonTracks = createAlbumAggregateWithRoonTracks(
      albumAggregateWithRoonAlbum,
      roonTracks,
    );

    albumAggregatesWithRoonTracks.push(albumAggregateWithRoonTracks);
  }

  const albumAggregatesWithPersistedData: (
    | Extract<AlbumAggregate, { stage: 'withRoonTracks' }>
    | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
    | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
  )[] = [];
  for (const albumAggregateWithRoonTracks of albumAggregatesWithRoonTracks) {
    const albumAggregateWithPersistedData = readPersistedAlbumAggregateData(
      albumAggregateWithRoonTracks,
    );
  }

  socket.emit('albums', albumAggregatesWithRoonTracks);

  /* eslint-disable no-console */
  // console.log(
  //   'albumData.ts: buildStableAlbumData(): albumAggregatesWithRoonTracks:',
  //   JSON.stringify(albumAggregatesWithRoonTracks, null, 4),
  // );
  /* eslint-enable no-console */

  for (const albumAggregateWithRoonTracks of albumAggregatesWithRoonTracks) {
    await processAlbum(albumAggregateWithRoonTracks);
  }

  /* eslint-disable no-console */
  // console.log(
  //   'albumData.ts: buildStableAlbumData(): albumAggregatesWithRoonTracks:',
  //   JSON.stringify(albumAggregatesWithRoonTracks, null, 4),
  // );
  /* eslint-enable no-console */
};

export { buildStableAlbumData, isRoonAlbumUnprocessable };
