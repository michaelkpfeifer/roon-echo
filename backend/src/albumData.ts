import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import type { Knex } from 'knex';
import { Socket } from 'socket.io';

import type { DatabaseSchema } from '../databaseSchema';
import {
  buildAlbumAggregateWithMbMatch,
  buildAlbumAggregateWithRoonAlbum,
  buildAlbumAggregateWithRoonTracks,
  buildAlbumAggregateWithoutMbMatch,
  buildEmptyAlbumAggregate,
} from './factories/albumAggregateFactory';
import {
  fetchMbAlbum,
  fetchMbCandidates,
  normalizeCandidate,
  updateCandidatesFetchedAtTimestamp,
  updateCandidatesMatchedAtTimestamp,
  upsertMbCandidate,
} from './repository';
import { getRoonAlbums, getRoonTracks } from './roonData.js';
import { compareMbAndRoonTracks } from './roonMbMatches';
import { RawMbCandidateSearchResponseSchema } from './schemas/rawMbCandidateSearchResponse';
import { RawMbFetchReleaseResponseMediaSchema } from './schemas/rawMbFetchReleaseMediaResponse';
import { RawMbFetchReleaseResponseSchema } from './schemas/rawMbFetchReleaseResponse';
import { transformToMbCandidate } from './transforms/mbCandidate';
import { AlbumAggregate } from '../../shared/internal/albumAggregate';
import { RoonAlbum } from '../../shared/internal/roonAlbum';
import { RoonTrack } from '../../shared/internal/roonTrack';

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
  minTime: 200,
  maxConcurrent: 1,
});

const readPersistedAlbumAggregateData = async (
  db: Knex<DatabaseSchema>,
  albumAggregateWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
) => {
  const roonAlbum = albumAggregateWithRoonTracks.roonAlbum;
  if (!roonAlbum.candidatesMatchedAt) {
    return albumAggregateWithRoonTracks;
  }

  const mbCandidates = await fetchMbCandidates(db, roonAlbum);
  const mbAlbumResult = await fetchMbAlbum(db, roonAlbum.roonAlbumId);

  if (mbAlbumResult.isOk()) {
    return buildAlbumAggregateWithMbMatch(
      albumAggregateWithRoonTracks,
      mbCandidates,
      mbAlbumResult._unsafeUnwrap(),
    );
  } else {
    return buildAlbumAggregateWithoutMbMatch(
      albumAggregateWithRoonTracks,
      mbCandidates,
    );
  }
};

const skipMbCandidate = (fullRelease: unknown) => {
  return RawMbFetchReleaseResponseMediaSchema.parse(fullRelease)
    .media.map((medium) => medium.tracks)
    .some((tracks) => tracks === undefined);
};

async function processAlbum(
  db: Knex<DatabaseSchema>,
  socket: Socket,
  album:
    | Extract<AlbumAggregate, { stage: 'withRoonTracks' }>
    | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
    | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>,
): Promise<
  | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
  | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
> {
  if (album.stage !== 'withRoonTracks') {
    return album;
  }

  if (!album.roonAlbum.candidatesFetchedAt) {
    const searchResults = await mbApiRateLimiter.schedule({ priority: 5 }, () =>
      runMbCandidateSearch(
        album.roonAlbum.albumName,
        album.roonAlbum.artistName,
      ),
    );

    const rawMbCandidateSearchResponse =
      RawMbCandidateSearchResponseSchema.parse(searchResults);

    for (const rawMbCandidate of rawMbCandidateSearchResponse.releases) {
      const fullRelease = await mbApiRateLimiter.schedule({ priority: 1 }, () =>
        runMbFetchRelease(rawMbCandidate.id),
      );

      if (skipMbCandidate(fullRelease)) {
        continue;
      }

      const rawMbFetchReleaseResponse =
        RawMbFetchReleaseResponseSchema.parse(fullRelease);

      const mbCandidate = transformToMbCandidate(
        album.roonAlbum.roonAlbumId,
        rawMbCandidate,
        rawMbFetchReleaseResponse,
      );

      await upsertMbCandidate(db, mbCandidate);
    }

    album.roonAlbum.candidatesFetchedAt = new Date().toISOString();
    await updateCandidatesFetchedAtTimestamp(db, album.roonAlbum);
  }

  if (!album.roonAlbum.candidatesMatchedAt) {
    const candidates = await fetchMbCandidates(db, album.roonAlbum);

    const roonTrackTitles = album.roonTracks.map((track) => track.trackName);

    for (const candidate of candidates) {
      const mbTrackTitles = candidate.mbCandidateTracks.map(
        (track: any) => track.name,
      );

      if (compareMbAndRoonTracks(mbTrackTitles, roonTrackTitles)) {
        normalizeCandidate(db, candidate);

        break;
      }
    }

    album.roonAlbum.candidatesMatchedAt = new Date().toISOString();
    await updateCandidatesMatchedAtTimestamp(db, album.roonAlbum);
  }

  const mbCandidates = await fetchMbCandidates(db, album.roonAlbum);
  const mbAlbumResult = await fetchMbAlbum(db, album.roonAlbum.roonAlbumId);

  let albumAggregate;
  if (mbAlbumResult.isOk()) {
    albumAggregate = buildAlbumAggregateWithMbMatch(
      album,
      mbCandidates,
      mbAlbumResult._unsafeUnwrap(),
    );
  } else {
    albumAggregate = buildAlbumAggregateWithoutMbMatch(album, mbCandidates);
  }

  socket.emit('albumUpdate', albumAggregate);

  return albumAggregate;
}

const buildStableAlbumData = async (
  db: Knex<DatabaseSchema>,
  socket: Socket,
  browseInstance: RoonApiBrowse,
) => {
  const roonAlbums = await getRoonAlbums(db, browseInstance);

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
      db,
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
    const albumAggregateWithPersistedData =
      await readPersistedAlbumAggregateData(db, albumAggregateWithRoonTracks);

    albumAggregatesWithPersistedData.push(albumAggregateWithPersistedData);
  }

  socket.emit('albums', albumAggregatesWithPersistedData);

  const albumAggregatesAfterMusicBrainzUpdates: (
    | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
    | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
  )[] = [];
  for (const albumAggregateWithPersistedData of albumAggregatesWithPersistedData) {
    const albumAggregateAfterMusicBrainzUpdates = await processAlbum(
      db,
      socket,
      albumAggregateWithPersistedData,
    );

    albumAggregatesAfterMusicBrainzUpdates.push(
      albumAggregateAfterMusicBrainzUpdates,
    );
  }

  /* eslint-disable no-console */
  // console.log(
  //   'albumData.ts: buildStableAlbumData(): albumAggregatesAfterMusicBrainzUpdates',
  //   JSON.stringify(albumAggregatesAfterMusicBrainzUpdates, null, 4),
  // );
  /* eslint-enable no-console */
};

export { buildStableAlbumData, skipMbCandidate };
