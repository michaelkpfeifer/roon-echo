import { exit } from 'node:process';

import dotenv from 'dotenv';
import fp from 'lodash/fp.js';
/* eslint-disable import/no-unresolved */
import PQueue from 'p-queue';
/* eslint-enable import/no-unresolved */

import * as browser from './browser.js';
import {
  getAlbumWithArtistsAndTracks,
  insertAlbumWithArtistsAndTracks,
} from './repository.js';
import Result from './result.js';
import { camelCaseKeys } from './utils.js';

const roonArtistName = (enrichedAlbum) => enrichedAlbum.roonAlbum.subtitle;

const roonAlbumName = (enrichedAlbum) => enrichedAlbum.roonAlbum.title;

const albumItemKey = (enrichedAlbum) => enrichedAlbum.roonAlbum.itemKey;

dotenv.config();

const mbReleaseEndpoint = process.env.MB_RELEASE_ENDPOINT;

const mbUserAgent = process.env.MB_USER_AGENT;

const buildMbSearch = (enrichedAlbum) => {
  const queryString = [
    `artist:${encodeURIComponent(roonArtistName(enrichedAlbum))}`,
    `${encodeURIComponent(' AND ')}`,
    `release:${encodeURIComponent(roonAlbumName(enrichedAlbum))}`,
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
  `${mbReleaseEndpoint}/${releaseId}?inc=artists+recordings&fmt=json`;

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

const compareMbAndRoonTracks = (mbTracks, roonTracks) =>
  fp.isEqualWith(
    (a, b) => {
      if (Array.isArray(a) && Array.isArray(b)) {
        return undefined;
      }

      return normalizeTrackTitle(a) === normalizeTrackTitle(b);
    },
    mbTracks,
    roonTracks,
  );

const extractRelevantData = (mbRelease) => ({
  id: mbRelease.id,
  title: mbRelease.title,
  mbReleaseDate: mbRelease.date,
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

const findMatchingMbRelease = async (mbReleaseIds, roonTracks) => {
  let nonMatchinMbReleases = [];

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  for (const mbReleaseId of mbReleaseIds) {
    const mbRelease = await runMbFetch(mbReleaseId);

    if (
      compareMbAndRoonTracks(
        mbRelease.media
          .flatMap((medium) => medium.tracks)
          .map((track) => track.title),
        roonTracks,
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
  /* eslint-enable no-await-in-loop */
  /* eslint-enable no-restricted-syntax */

  return Result.Err(nonMatchinMbReleases);
};

const getMbData = async (enrichedAlbum) => {
  if (enrichedAlbum.status !== 'roonTracksAdded') {
    return enrichedAlbum;
  }

  const roonAlbumTrackCount = enrichedAlbum.roonTracks.length;
  const mbSearchData = await runMbSearch(enrichedAlbum);

  const highScoreMbSearchData = {
    ...mbSearchData,
    releases: mbSearchData.releases.filter(
      (release) =>
        release.score >= 25 && release['track-count'] === roonAlbumTrackCount,
    ),
  };

  const matchingMbReleaseResult = await findMatchingMbRelease(
    highScoreMbSearchData.releases.map((release) => release.id),
    enrichedAlbum.roonTracks,
  );

  if (Result.isOk(matchingMbReleaseResult)) {
    const matchingMbRelease = Result.unwrap(matchingMbReleaseResult);

    if (matchingMbRelease !== null) {
      await insertAlbumWithArtistsAndTracks({
        roonArtistName: roonArtistName(enrichedAlbum),
        roonAlbumName: roonAlbumName(enrichedAlbum),
        mbRelease: matchingMbRelease,
      });

      const albumWithTracks = await getAlbumWithArtistsAndTracks(
        roonArtistName(enrichedAlbum),
        roonAlbumName(enrichedAlbum),
      );

      if (Result.isOk(albumWithTracks)) {
        const { mbAlbum, mbArtists, mbTracks } = Result.unwrap(albumWithTracks);
        return {
          ...enrichedAlbum,
          mbAlbum,
          mbArtists,
          mbTracks,
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

const addRoonTracks = async (browseInstance, enrichedAlbum) => {
  const roonAlbumData = await browser.loadAlbum(
    browseInstance,
    albumItemKey(enrichedAlbum),
  );

  return {
    ...enrichedAlbum,
    roonTracks: roonAlbumData.items
      .filter((item) => item.title !== 'Play Album')
      .map((item) => item.title)
      .map((title) => title.split(/\s(.+)/)[1] || ''),
    status:
      enrichedAlbum.status !== 'pending'
        ? enrichedAlbum.status
        : 'roonTracksAdded',
  };
};

const readMbDataFromDb = async (enrichedAlbum) => {
  if (enrichedAlbum.status !== 'pending') {
    return enrichedAlbum;
  }

  const albumWithTracks = await getAlbumWithArtistsAndTracks(
    roonArtistName(enrichedAlbum),
    roonAlbumName(enrichedAlbum),
  );

  if (Result.isOk(albumWithTracks)) {
    const { mbAlbum, mbArtists, mbTracks } = Result.unwrap(albumWithTracks);
    return {
      ...enrichedAlbum,
      mbAlbum,
      mbArtists,
      mbTracks,
      status: 'mbDataLoaded',
    };
  }

  return enrichedAlbum;
};

const identifyUnknown = (enrichedAlbum) => {
  if (
    roonAlbumName(enrichedAlbum) === '' ||
    roonArtistName(enrichedAlbum) === 'UnknownArtist'
  ) {
    return { ...enrichedAlbum, status: 'unknownArtistOrTitle' };
  }
  return enrichedAlbum;
};

const buildEnrichedAlbum = (roonAlbum) => {
  const enrichedAlbum = {
    status: 'pending',
    roonAlbum: camelCaseKeys(roonAlbum),
    roonTracks: null,
    mbAlbum: null,
    mbTracks: null,
    mbData: [],
  };

  return enrichedAlbum;
};

const enrichList = async (browseInstance, roonAlbums) => {
  if (!mbReleaseEndpoint) {
    process.stderr.write(
      'Error: Failed to load URL for MusicBrainz release endpoint.\n',
    );
    exit(11);
    return null;
  }

  if (!mbUserAgent) {
    process.stderr.write(
      'Error: Failed to load user agent for MusicBrainz release endpoint.\n',
    );
    exit(12);
    return null;
  }

  // TODO. tmpRoonAlbums needs to be removed again. It has been
  // introduced to allow working with smaller lists before processing
  // more than 1000 albums.

  const tmpRoonAlbums = roonAlbums.slice(0, 10);

  let enrichedAlbums = tmpRoonAlbums
    .map((roonAlbum) => buildEnrichedAlbum(roonAlbum))
    .map((enrichedAlbum) => identifyUnknown(enrichedAlbum));

  // TODO. It is unclear how the reduce() call below behaves in
  // practice for a large amount of data. If things become really
  // slow, it should still be possible to use the more conventional
  // loop below (that ESLint complains about). And for consistency
  // reasons it may be a good idea to move the two map calls into the
  // reduce call as well.

  // const results = [];
  // for (const album of tmpRoonAlbums) {
  //   const updatedAlbum = await addRoonTracks(browseInstance, album);
  //   results.push(updatedAlbum);
  // }

  enrichedAlbums = await enrichedAlbums.reduce(
    async (previousPromise, currentAlbum) => {
      const processedAlbums = await previousPromise;
      const currentAlbumWithMbdata = await readMbDataFromDb(currentAlbum);
      const currentAlbumWithRoonTracks = await addRoonTracks(
        browseInstance,
        currentAlbumWithMbdata,
      );
      return [...processedAlbums, currentAlbumWithRoonTracks];
    },
    Promise.resolve([]),
  );

  const mbQueue = new PQueue({
    interval: 250,
    intervalCap: 4,
  });

  enrichedAlbums = await Promise.all(
    enrichedAlbums.map(async (enrichedAlbum) =>
      mbQueue.add(() => getMbData(enrichedAlbum)),
    ),
  );

  /* eslint-disable no-console */
  console.log(
    'albumData.js: enrichList(): enrichedAlbums:',
    JSON.stringify(enrichedAlbums, null, 4),
  );
  /* eslint-enable no-console */

  return enrichedAlbums;
};

const albumData = async (browseInstance, roonAlbums) => {
  return roonAlbums;
};

export { albumData, enrichList };
