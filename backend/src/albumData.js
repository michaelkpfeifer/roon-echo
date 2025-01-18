import knexInit from 'knex';
import fp from 'lodash/fp.js';
/* eslint-disable import/no-unresolved */
import PQueue from 'p-queue';
/* eslint-enable import/no-unresolved */

import Result from './result.js';
import knexConfig from '../knexfile.js';
import * as browser from './browser.js';
import { getAlbumWithTracks, insertAlbumWithTracks } from './repository.js';
import { camelCaseKeys } from './utils.js';

const knex = knexInit(knexConfig.development);

const artistName = (enrichedAlbum) => enrichedAlbum.roonAlbum.subtitle;

const albumName = (enrichedAlbum) => enrichedAlbum.roonAlbum.title;

const albumItemKey = (enrichedAlbum) => enrichedAlbum.roonAlbum.itemKey;

const mbUserAgent = 'Roon Remote/0.0.0 (michael.k.pfeifer@googlemail.com)';

const mbReleaseEndpoint = 'http://bruce03:5000/ws/2/release';

const buildMbSearch = (enrichedAlbum) => {
  const queryString = [
    `artist:${encodeURIComponent(artistName(enrichedAlbum))}`,
    `${encodeURIComponent(' AND ')}`,
    `release:${encodeURIComponent(albumName(enrichedAlbum))}`,
  ].join('');

  return `${mbReleaseEndpoint}?query=${queryString}&fmt=json`;
};

const runMbSearch = async (enrichedAlbum) => {
  const response = await fetch(buildMbSearch(enrichedAlbum), {
    method: 'GET',
    headers: {
      'User-Agent': mbUserAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error: Failed to fetch ${buildMbSearch} (${response.status}).`,
    );
  }

  const responsePayload = await response.json();

  return responsePayload;
};

const buildMbFetch = (releaseId) =>
  `${mbReleaseEndpoint}/${releaseId}?inc=recordings&fmt=json`;

const runMbFetch = async (mbReleaseId) => {
  const response = await fetch(buildMbFetch(mbReleaseId), {
    method: 'GET',
    headers: {
      'User-Agent': mbUserAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error: Failed to fetch ${buildMbFetch} (${response.status}).`,
    );
  }

  const responsePayload = await response.json();

  return responsePayload;
};

const normalizeTrackTitle = (title) =>
  title
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\p{P}/gu, '')
    .toLowerCase()
    .trim();

const compareMbAndRoonAlbumTracks = (mbAlbumTracks, roonAlbumTracks) =>
  fp.isEqualWith(
    (a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return undefined;
      }

      return normalizeTrackTitle(a) === normalizeTrackTitle(b);
    },
    mbAlbumTracks,
    roonAlbumTracks,
  );

const extractRelevantData = (mbRelease) => ({
  id: mbRelease.id,
  title: mbRelease.title,
  tracks: mbRelease.media
    .flatMap((media) => media.tracks)
    .map((track) => ({
      id: track.id,
      title: track.title,
      length: track.length,
      position: track.position,
      number: track.number,
    })),
});

const findMatchingMbRelease = async (mbReleaseIds, roonAlbumTracks) => {
  let nonMatchinMbReleases = [];

  for (const mbReleaseId of mbReleaseIds) {
    const mbRelease = await runMbFetch(mbReleaseId);

    if (
      compareMbAndRoonAlbumTracks(
        mbRelease.media
          .flatMap((medium) => medium.tracks)
          .map((track) => track.title),
        roonAlbumTracks,
      )
    ) {
      nonMatchinMbReleases = [];
      return Result.Ok(mbRelease);
    }

    nonMatchinMbReleases = [
      ...nonMatchinMbReleases,
      extractRelevantData(mbRelease),
    ];
  }

  return Result.Err(nonMatchinMbReleases);
};

const getMbData = async (enrichedAlbum) => {
  if (enrichedAlbum.status !== 'roonAlbumTracksAdded') {
    return enrichedAlbum;
  }

  const roonAlbumTrackCount = enrichedAlbum.roonAlbumTracks.length;
  const mbSearchData = await runMbSearch(enrichedAlbum);

  const highScoreMbSearchData = {
    ...mbSearchData,
    releases: mbSearchData.releases.filter(
      (release) =>
        release.score === 100 && release['track-count'] === roonAlbumTrackCount,
    ),
  };

  const matchingMbReleaseResult = await findMatchingMbRelease(
    highScoreMbSearchData.releases.map((release) => release.id),
    enrichedAlbum.roonAlbumTracks,
  );

  if (Result.isOk(matchingMbReleaseResult)) {
    const matchingMbRelease = Result.unwrap(matchingMbReleaseResult);

    if (matchingMbRelease !== null) {
      await insertAlbumWithTracks({
        knex,
        artistName: artistName(enrichedAlbum),
        albumName: albumName(enrichedAlbum),
        mbRelease: matchingMbRelease,
      });

      const albumWithTracks = await getAlbumWithTracks(
        knex,
        artistName(enrichedAlbum),
        albumName(enrichedAlbum),
      );

      if (Result.isOk(albumWithTracks)) {
        const { album: mbAlbum, tracks: mbAlbumTracks } =
          Result.unwrap(albumWithTracks);
        return {
          ...enrichedAlbum,
          mbAlbum,
          mbAlbumTracks,
          status: 'mbDataLoaded',
          mbData: [],
        };
      }
    }
  }

  return {
    ...enrichedAlbum,
    mbData: Result.unwrapErr(matchingMbReleaseResult),
  };
};

const addRoonAlbumTracks = async (browseInstance, enrichedAlbum) => {
  const roonAlbumData = await browser.loadAlbum(
    browseInstance,
    albumItemKey(enrichedAlbum),
  );

  return {
    ...enrichedAlbum,
    roonAlbumTracks: roonAlbumData.items
      .filter((item) => item.title !== 'Play Album')
      .map((item) => item.title)
      .map((title) => title.split(/\s(.+)/)[1] || ''),
    status:
      enrichedAlbum.status !== 'pending'
        ? enrichedAlbum.status
        : 'roonAlbumTracksAdded',
  };
};

const readMbDataFromDb = async (enrichedAlbum) => {
  if (enrichedAlbum.status !== 'pending') {
    return enrichedAlbum;
  }

  const albumWithTracks = await getAlbumWithTracks(
    knex,
    artistName(enrichedAlbum),
    albumName(enrichedAlbum),
  );

  if (Result.isOk(albumWithTracks)) {
    const { album: mbAlbum, tracks: mbAlbumTracks } =
      Result.unwrap(albumWithTracks);
    return { ...enrichedAlbum, mbAlbum, mbAlbumTracks, status: 'mbDataLoaded' };
  }

  return enrichedAlbum;
};

const identifyUnknown = (enrichedAlbum) => {
  if (
    albumName(enrichedAlbum) === '' ||
    artistName(enrichedAlbum) === 'UnknownArtist'
  ) {
    return { ...enrichedAlbum, status: 'unknownArtistOrTitle' };
  }
  return enrichedAlbum;
};

const buildEnrichedAlbum = (roonAlbum) => {
  const enrichedAlbum = {
    status: 'pending',
    roonAlbum: camelCaseKeys(roonAlbum),
    roonAlbumTracks: null,
    mbAlbum: null,
    mbAlbumTracks: null,
    mbData: [],
  };

  return enrichedAlbum;
};

const enrichList = async (browseInstance, roonAlbums) => {
  // TODO. The following lines cleaning the database need to be
  // removed once we reach a state where we want to keep the data we
  // have already processed.

  await knex('albums').del();
  await knex('tracks').del();

  await knex.raw('PRAGMA journal_mode = WAL;');

  // TODO. tmpRoonAlbums needs to be removed again. It has been
  // introduced to allow working with smaller lists before processing
  // more than 1000 albums.

  const tmpRoonAlbums = roonAlbums.slice(9, 10);

  let enrichedAlbums = tmpRoonAlbums
    .map((roonAlbum) => buildEnrichedAlbum(roonAlbum))
    .map((enrichedAlbum) => identifyUnknown(enrichedAlbum));

  // TODO. It is unclear how the reduce() call below behaves in
  // practice for a large amount of data. If things become really
  // slow, it should still be possible to use the more conventional
  // loop below (that ESLint complains about). And for consisteny
  // reasons it may be a good idea to move the two map calls into the
  // reduce call as well.

  // const results = [];
  // for (const album of tmpRoonAlbums) {
  //   const updatedAlbum = await addRoonAlbumTracks(browseInstance, album);
  //   results.push(updatedAlbum);
  // }

  enrichedAlbums = await enrichedAlbums.reduce(
    async (previousPromise, currentAlbum) => {
      const processedAlbums = await previousPromise;
      const currentAlbumWithMbdata = await readMbDataFromDb(currentAlbum);
      const currentAlbumWithRoonAlbumTracks = await addRoonAlbumTracks(
        browseInstance,
        currentAlbumWithMbdata,
      );
      return [...processedAlbums, currentAlbumWithRoonAlbumTracks];
    },
    Promise.resolve([]),
  );

  const mbQueue = new PQueue({
    interval: 500,
    intervalCap: 1,
  });

  enrichedAlbums = await Promise.all(
    enrichedAlbums.map(async (enrichedAlbum) =>
      mbQueue.add(() => getMbData(enrichedAlbum)),
    ),
  );

  // TODO. In the end, we want to return the enriched set of data and
  // not the unchanged list of albums we passed in. But that means the
  // frontend has to be adjusted accordingly (which hasn't happened
  // yet).

  /* eslint-disable no-console */
  console.log(
    'albumData.js: enrichList(): enrichedAlbums:',
    JSON.stringify(enrichedAlbums, null, 4),
  );
  /* eslint-enable no-console */

  return roonAlbums;
};

export default enrichList;
