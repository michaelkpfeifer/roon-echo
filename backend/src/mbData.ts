import Bottleneck from 'bottleneck';
import dotenv from 'dotenv';
import type { Knex } from 'knex';
import type { Server } from 'socket.io';

import type { AlbumAggregate } from '../../shared/internal/albumAggregate.js';
import type { DatabaseSchema } from '../databaseSchema.js';
import {
  buildAlbumAggregateWithMbMatch,
  buildAlbumAggregateWithoutMbMatch,
} from './factories/albumAggregateFactory.js';
import {
  fetchMbAlbum,
  fetchMbCandidates,
  normalizeCandidate,
  updateCandidatesFetchedAtTimestamp,
  updateCandidatesMatchedAtTimestamp,
  upsertMbCandidate,
} from './repository.js';
import { compareMbAndRoonTracks } from './roonMbMatches.js';
import { RawMbCandidateSearchResponseSchema } from './schemas/rawMbCandidateSearchResponse.js';
import { RawMbFetchReleaseResponseMediaSchema } from './schemas/rawMbFetchReleaseMediaResponse.js';
import { RawMbFetchReleaseResponseSchema } from './schemas/rawMbFetchReleaseResponse.js';
import { transformToMbCandidate } from './transforms/mbCandidate.js';

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

const skipMbCandidate = (fullRelease: unknown) => {
  return RawMbFetchReleaseResponseMediaSchema.parse(fullRelease)
    .media.map((medium) => medium.tracks)
    .some((tracks) => tracks === undefined);
};

const mbApiRateLimiter = new Bottleneck({
  minTime: 200,
  maxConcurrent: 1,
});

const enrichAlbumAggregateWithMusicBrainzData = async (
  db: Knex<DatabaseSchema>,
  io: Server,
  albumAggregateWithPersistedData: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
): Promise<
  | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
  | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
> => {
  if (!albumAggregateWithPersistedData.roonAlbum.candidatesFetchedAt) {
    const searchResults = await mbApiRateLimiter.schedule({ priority: 5 }, () =>
      runMbCandidateSearch(
        albumAggregateWithPersistedData.roonAlbum.roonAlbumName,
        albumAggregateWithPersistedData.roonAlbum.roonAlbumArtistName,
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
        albumAggregateWithPersistedData.roonAlbum.roonAlbumId,
        rawMbCandidate,
        rawMbFetchReleaseResponse,
      );

      await upsertMbCandidate(db, mbCandidate);
    }

    albumAggregateWithPersistedData.roonAlbum.candidatesFetchedAt =
      new Date().toISOString();
    await updateCandidatesFetchedAtTimestamp(
      db,
      albumAggregateWithPersistedData.roonAlbum,
    );
  }

  if (!albumAggregateWithPersistedData.roonAlbum.candidatesMatchedAt) {
    const candidates = await fetchMbCandidates(
      db,
      albumAggregateWithPersistedData.roonAlbum.roonAlbumId,
    );

    const roonTrackTitles = albumAggregateWithPersistedData.roonTracks.map(
      (track) => track.trackName,
    );

    for (const candidate of candidates) {
      const mbTrackTitles = candidate.mbCandidateTracks.map(
        (track: any) => track.name,
      );

      if (compareMbAndRoonTracks(mbTrackTitles, roonTrackTitles)) {
        normalizeCandidate(db, candidate);

        break;
      }
    }

    albumAggregateWithPersistedData.roonAlbum.candidatesMatchedAt =
      new Date().toISOString();
    await updateCandidatesMatchedAtTimestamp(
      db,
      albumAggregateWithPersistedData.roonAlbum,
    );
  }

  const mbCandidates = await fetchMbCandidates(
    db,
    albumAggregateWithPersistedData.roonAlbum.roonAlbumId,
  );
  const mbAlbumResult = await fetchMbAlbum(
    db,
    albumAggregateWithPersistedData.roonAlbum.roonAlbumId,
  );

  if (mbAlbumResult.isOk()) {
    const albumAggregateWithMbMatch = buildAlbumAggregateWithMbMatch(
      albumAggregateWithPersistedData,
      mbCandidates,
      mbAlbumResult._unsafeUnwrap(),
    );
    io.emit('albumUpdate', albumAggregateWithMbMatch);
    return albumAggregateWithMbMatch;
  } else {
    const albumAggregateWithoutMbMatch = buildAlbumAggregateWithoutMbMatch(
      albumAggregateWithPersistedData,
      mbCandidates,
    );
    io.emit('albumUpdate', albumAggregateWithoutMbMatch);
    return albumAggregateWithoutMbMatch;
  }
};

const enrichAlbumAggregatesWithMusicBrainzData = async (
  db: Knex<DatabaseSchema>,
  io: Server,
  albumAggregatesWithPersistedData: (
    | Extract<AlbumAggregate, { stage: 'withRoonTracks' }>
    | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
    | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
  )[],
) => {
  for (const [
    index,
    albumAggregateWithPersistedData,
  ] of albumAggregatesWithPersistedData.entries()) {
    if (albumAggregateWithPersistedData.stage === 'withRoonTracks') {
      const result = await enrichAlbumAggregateWithMusicBrainzData(
        db,
        io,
        albumAggregateWithPersistedData,
      );
      albumAggregatesWithPersistedData[index] = result;
    }
  }
};

const getPersistedAlbumAggregateData = async (
  db: Knex<DatabaseSchema>,
  albumAggregateWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
) => {
  const roonAlbumData = albumAggregateWithRoonTracks.roonAlbum;

  if (!roonAlbumData.candidatesMatchedAt) {
    return albumAggregateWithRoonTracks;
  }

  const mbCandidates = await fetchMbCandidates(db, roonAlbumData.roonAlbumId);
  const mbAlbumResult = await fetchMbAlbum(db, roonAlbumData.roonAlbumId);

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

const getAlbumAggregatesWithPersistedData = async (
  db: Knex<DatabaseSchema>,
  albumAggregatesWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >[],
) => {
  const albumAggregatesWithPersistedData: (
    | Extract<AlbumAggregate, { stage: 'withRoonTracks' }>
    | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
    | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
  )[] = [];

  for (const albumAggregateWithRoonTracks of albumAggregatesWithRoonTracks) {
    const albumAggregateWithPersistedData =
      await getPersistedAlbumAggregateData(db, albumAggregateWithRoonTracks);

    albumAggregatesWithPersistedData.push(albumAggregateWithPersistedData);
  }

  return albumAggregatesWithPersistedData;
};

export {
  buildMbCandidateSearch,
  buildMbFetchRelease,
  enrichAlbumAggregatesWithMusicBrainzData,
  getAlbumAggregatesWithPersistedData,
  mbUserAgent,
  runMbCandidateSearch,
  runMbFetchRelease,
  skipMbCandidate,
};
