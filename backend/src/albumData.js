import { exit } from 'node:process';

import dotenv from 'dotenv';
import fp from 'lodash/fp.js';
/* eslint-disable import/no-unresolved */
import PQueue from 'p-queue';
/* eslint-enable import/no-unresolved */
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import {
  getAlbumWithArtistsAndTracks,
  getCandidates,
  getRoonAlbumWithTracks,
  insertAlbumWithArtistsAndTracks,
  insertCandidates,
  insertRoonAlbumWithTracks,
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

const buildCandidateSearch = (albumName, artistName) => {
  const queryString = [
    `artist:${encodeURIComponent(artistName)}`,
    `${encodeURIComponent(' AND ')}`,
    `release:${encodeURIComponent(albumName)}`,
  ].join('');

  return `${mbReleaseEndpoint}?query=${queryString}&fmt=json`;
};

const runCandidateSearch = async (albumName, artistName) => {
  const response = await fetch(buildCandidateSearch(albumName, artistName), {
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

const augmentAlbumByCandidates = (initialAlbum, candidatesResult) => {
  if (Result.isOk(candidatesResult)) {
    return {
      ...initialAlbum,
      status: 'candidatesLoaded',
      candidates: Result.unwrap(candidatesResult),
    };
  } else {
    return initialAlbum;
  }
};

const processAlbum = async (socket, album) => {
  /* eslint-disable no-console */
  console.log(
    'albumData.js: processAlbum(): album:',
    JSON.stringify(album, null, 4),
  );
  /* eslint-enable no-console */

  switch (album.status) {
    case 'roonAlbumLoaded': {
      const candidates = await runCandidateSearch(
        album.roonAlbum.albumName,
        album.roonAlbum.artistName,
      );

      insertCandidates(album, candidates);

      const candidatesResult = await getCandidates(album);
      const albumWithCandidates = augmentAlbumByCandidates(
        album,
        candidatesResult,
      );

      /* eslint-disable no-console */
      console.log(
        'albumData.js: processAlbum: albumWithCandidates',
        albumWithCandidates,
      );
      /* eslint-enable no-console */

      socket.emit('albumUpdate', albumWithCandidates);

      return { nextOperation: 'noOp', newAlbum: albumWithCandidates };
    }

    case 'candidatesLoaded':
      return { nextOperation: 'noOp', newAlbum: album };

    default:
      throw new Error(`Error: Unknown album state ${album.status}.`);
  }
};

const createAlbumQueue = ({ socket, process, delay = 5000 }) => {
  const queue = [];
  let running = false;

  let enqueue = null;
  let enqueueFront = null;
  let run = null;

  enqueue = (album) => {
    queue.push(album);
    run();
  };

  enqueueFront = (album) => {
    queue.unshift(album);
    run();
  };

  run = async () => {
    if (running || queue.length === 0) {
      return;
    }

    running = true;

    while (queue.length > 0) {
      const album = queue.shift();

      const { nextOperation, newAlbum } = await process(socket, album);
      switch (nextOperation) {
        case 'enqueue':
          enqueue(newAlbum);
          break;

        case 'enqueueFront':
          enqueueFront(newAlbum);
          break;

        case 'noOp':
          break;

        default:
          throw new Error(`Error: Unknown nextOperation ${nextOperation}.`);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    running = false;
  };

  return { enqueue, enqueueFront };
};

const augmentAlbumByRoonTrackData = (album, roonAlbumData) => ({
  ...album,
  status: 'roonTracksAdded',
  roonTracks: roonAlbumData.items
    .filter((item) => item.title !== 'Play Album')
    .map((item) => item.title)
    .map((title) => title.split(/\s(.+)/)[1] || ''),
});

const augmentAlbumByStoredMbData = (
  album,
  { mbAlbum, mbArtists, mbTracks },
) => ({
  ...album,
  status: 'mbAlbumLoaded',
  sortKeys: {
    artists: mbArtists.map((mbArtist) => mbArtist.sortName).join('; '),
    releaseDate: mbAlbum.mbReleaseDate,
    title: mbAlbum.roonAlbumName,
  },
  mbAlbum,
  mbTracks,
  mbArtists,
});

const buildOldInitialAlbumStructure = (roonAlbum, uuid) => ({
  uuid,
  status: 'roonAlbumLoaded',
  sortKeys: {
    artists: roonAlbum.subtitle,
    releaseDate: null,
    title: roonAlbum.title,
  },
  roonAlbum: {
    title: roonAlbum.title,
    artist: roonAlbum.subtitle,
    itemKey: roonAlbum.item_key,
    imageKey: roonAlbum.image_key,
  },
  roonTracks: [],
  mbAlbum: {},
  mbTracks: [],
  mbArtists: [],
  mbCandidates: [],
});

const buildOldInitialAlbumStructures = (roonAlbums) =>
  roonAlbums.items.map((roonAlbum) =>
    buildOldInitialAlbumStructure(roonAlbum, uuidv4()),
  );

const albumData = async (browseInstance, roonAlbums) => {
  const initialAlbums = buildOldInitialAlbumStructures(roonAlbums);

  const newAlbums = await initialAlbums.reduce(
    async (previousPromise, currentAlbum) => {
      const accumulatedAlbums = await previousPromise;
      let augmentedAlbum;

      const albumWithTracks = await getAlbumWithArtistsAndTracks(
        currentAlbum.roonAlbum.artist,
        currentAlbum.roonAlbum.title,
      );

      if (Result.isOk(albumWithTracks)) {
        augmentedAlbum = augmentAlbumByStoredMbData(
          currentAlbum,
          Result.unwrap(albumWithTracks),
        );
      } else {
        const roonAlbumData = await browser.loadAlbum(
          browseInstance,
          currentAlbum.roonAlbum.itemKey,
        );
        augmentedAlbum = augmentAlbumByRoonTrackData(
          currentAlbum,
          roonAlbumData,
        );
      }

      accumulatedAlbums.push(augmentedAlbum);
      return accumulatedAlbums;
    },
    Promise.resolve([]),
  );

  return newAlbums;
};

const prepareRoonAlbum = async (browseInstance, roonApiAlbum) => {
  const roonAlbumWithTracks = await getRoonAlbumWithTracks({
    roonAlbumName: roonApiAlbum.title,
    roonArtistName: roonApiAlbum.subtitle,
  });

  if (Result.isOk(roonAlbumWithTracks)) {
    const { roonAlbum, roonTracks } = Result.unwrap(roonAlbumWithTracks);
    return {
      id: roonAlbum.id,
      roonAlbum: {
        albumName: roonAlbum.albumName,
        artistName: roonAlbum.artistName,
        itemKey: roonApiAlbum.itemKey,
        imageKey: roonApiAlbum.imageKey,
      },
      roonTracks,
    };
  } else {
    const roonAlbumData = camelCaseKeys(
      await browser.loadAlbum(browseInstance, roonApiAlbum.itemKey),
    );

    const roonAlbum = {
      id: uuidv7(),
      albumName: roonApiAlbum.title,
      artistName: roonApiAlbum.subtitle,
    };

    const roonTracks = roonAlbumData.items
      .filter((item) => item.title !== 'Play Album')
      .map((item, position) => {
        const [number, trackName] = item.title.split(/\s(.+)/);

        return {
          id: uuidv7(),
          roonAlbumId: roonAlbum.id,
          trackName,
          number,
          position: position + 1,
        };
      });

    await insertRoonAlbumWithTracks({ roonAlbum, roonTracks });

    return prepareRoonAlbum(browseInstance, roonApiAlbum);
  }
};

const buildInitialAlbumStructure = ({ id, roonAlbum, roonTracks }) => ({
  id,
  status: 'roonAlbumLoaded',
  sortKeys: {
    artistNames: roonAlbum.artistName,
    releaseDate: null,
    albumName: roonAlbum.albumName,
  },
  roonAlbum,
  roonTracks,
  candidates: [],
});

const isRoonAlbumUnprocessable = (roonAlbum) =>
  roonAlbum.title === '' || roonAlbum.subtitle === 'Unknown Artist';

const augmentAlbum = async (initialAlbum) => {
  const candidatesResult = await getCandidates(initialAlbum);

  const albumWithCandidates = augmentAlbumByCandidates(
    initialAlbum,
    candidatesResult,
  );

  return albumWithCandidates;
};

const buildStableAlbumData = async (socket, browseInstance, roonApiAlbums) => {
  const processableRoonAlbums = roonApiAlbums.items.filter(
    (roonApiAlbum) => !isRoonAlbumUnprocessable(roonApiAlbum),
  );

  const initialAlbums = [];
  for (const album of processableRoonAlbums) {
    const initialAlbumStructure = buildInitialAlbumStructure(
      await prepareRoonAlbum(browseInstance, album),
    );
    initialAlbums.push(initialAlbumStructure);
  }

  const augmentedAlbums = [];
  for (const album of initialAlbums) {
    const augmentedAlbum = await augmentAlbum(album);
    augmentedAlbums.push(augmentedAlbum);
  }

  const { enqueue } = createAlbumQueue({
    socket,
    process: processAlbum,
    delay: 2000,
  });

  augmentedAlbums.forEach((album) => enqueue(album));

  socket.emit('albumsV2', initialAlbums);
};

export {
  albumData,
  augmentAlbumByRoonTrackData,
  augmentAlbumByStoredMbData,
  buildOldInitialAlbumStructure,
  buildOldInitialAlbumStructures,
  buildStableAlbumData,
  enrichList,
};
