import dotenv from 'dotenv';
import fp from 'lodash/fp.js';
import { v7 as uuidv7 } from 'uuid';

import * as browser from './browser.js';
import {
  demoteCandidateToNoMatch,
  getCandidates,
  getReleaseWithArtistsAndTracks,
  getReleasesByRoonAlbumId,
  getRoonAlbumWithTracks,
  insertCandidates,
  insertReleaseWithArtistsAndTracks,
  insertRoonAlbumWithTracks,
  promoteReleaseToMatch,
} from './repository.js';
import Result from './result.js';
import { camelCaseKeys } from './utils.js';

dotenv.config();

const mbReleaseEndpoint = process.env.MB_RELEASE_ENDPOINT;

const mbUserAgent = process.env.MB_USER_AGENT;

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
      `Error: Failed to fetch ${buildCandidateSearch(albumName, artistName)} (${response.status}).`,
    );
  }

  const responsePayload = await response.json();

  return responsePayload;
};

const buildFetchRelease = (releaseId) =>
  `${mbReleaseEndpoint}/${releaseId}?inc=artists+recordings&fmt=json`;

const runFetchRelease = async (mbReleaseId) => {
  const response = await fetch(buildFetchRelease(mbReleaseId), {
    method: 'GET',
    headers: {
      'User-Agent': mbUserAgent,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(
      `Error: Failed to fetch ${buildFetchRelease(mbReleaseId)} (${response.status}).`,
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

const buildNewAlbumFromAlbum = ({ album, release }) => {
  const newCandidates = album.candidates.filter(
    (candidate) => candidate.mbAlbumId !== release.release.mbAlbumId,
  );
  if (newCandidates.length !== album.candidates.length - 1) {
    throw new Error(`Error: Release does not match candidate.`);
  }
  const newReleases = [...album.releases, release];

  return {
    ...album,
    candidates: newCandidates,
    releases: newReleases,
  };
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

      if (candidates.releases.length === 0) {
        return { nextOperation: 'noOp', album };
      }

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

      return { nextOperation: 'enqueueFront', newAlbum: albumWithCandidates };
    }

    case 'candidatesLoaded': {
      const candidateIds = album.candidates.map(
        (candidate) => candidate.mbAlbumId,
      );
      const releaseIds = album.releases.map(
        (release) => release.release.mbAlbumId,
      );
      const nextCandidateId = candidateIds.find(
        (candidateId) => !releaseIds.includes(candidateId),
      );

      const mbRelease = await runFetchRelease(nextCandidateId);

      /* eslint-disable no-console */
      console.log(
        'albumData.js: processAlbum: mbRelease',
        JSON.stringify(mbRelease, null, 4),
      );
      /* eslint-enable no-console */

      const release = {
        album: {
          mbAlbumId: nextCandidateId,
          type: 'release',
        },
        artists: mbRelease['artist-credit'],
        tracks: mbRelease.media,
      };

      await insertReleaseWithArtistsAndTracks(release);

      const releaseReadBack = Result.unwrap(
        await getReleaseWithArtistsAndTracks(nextCandidateId),
      );

      const mbAndRoonTracksMatch = compareMbAndRoonTracks(
        mbRelease.media
          .flatMap((medium) => medium.tracks)
          .map((track) => track.title),
        album.roonTracks.map((track) => track.trackName),
      );

      /* eslint-disable no-console */
      console.log(
        'albumData.js: processAlbum: mbAndRoonTracksMatch',
        mbAndRoonTracksMatch,
      );
      /* eslint-enable no-console */

      const newAlbum = buildNewAlbumFromAlbum({
        album,
        release: releaseReadBack,
      });

      if (mbAndRoonTracksMatch === true) {
        promoteReleaseToMatch(nextCandidateId, album.id);

        socket.emit('albumUpdate', { ...newAlbum, status: 'albumMatched' });

        return { nextOperation: 'noOp', newAlbum };
      } else {
        demoteCandidateToNoMatch(nextCandidateId, album.id);

        if (newAlbum.candidates.length === 0) {
          socket.emit('albumUpdate', {
            ...newAlbum,
            status: 'noAlbumMatchFound',
          });
          return { nextOperation: 'noOp', newAlbum };
        } else {
          return { nextOperation: 'enqueueFront', newAlbum };
        }
      }
    }

    default: {
      throw new Error(`Error: Unknown album state ${album.status}.`);
    }
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

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }

    running = false;
  };

  return { enqueue, enqueueFront };
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
      status: roonAlbum.status,
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
      status: 'roonAlbumLoaded',
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

const buildInitialAlbumStructure = ({ id, status, roonAlbum, roonTracks }) => ({
  id,
  status,
  sortKeys: {
    artistNames: roonAlbum.artistName,
    releaseDate: null,
    albumName: roonAlbum.albumName,
  },
  roonAlbum,
  roonTracks,
  candidates: [],
  releases: [],
  mbAlbum: {},
  mbArtists: [],
  mbTracks: [],
});

const isRoonAlbumUnprocessable = (roonAlbum) =>
  roonAlbum.title === '' || roonAlbum.subtitle === 'Unknown Artist';

const augmentAlbum = async (initialAlbum) => {
  /* eslint-disable no-console */
  console.log('albumData.js: augmentAlbum(): initialAlbum:', initialAlbum);
  /* eslint-enable no-console */

  if (initialAlbum.status === 'roonAlbumLoaded') {
    return initialAlbum;
  }

  const allReleases = await getReleasesByRoonAlbumId(initialAlbum.id);
  const candidates = fp.sortBy(
    'candidatePriority',
    allReleases.filter((release) => release.type === 'candidate'),
  );
  const releases = fp.sortBy(
    'candidatePriority',
    allReleases.filter((release) => release.type === 'noMatch'),
  );

  const withCandidatesAndReleases = {
    ...initialAlbum,
    candidates,
    releases,
  };

  if (initialAlbum.status === 'albumMatched') {
    const match = allReleases.find((release) => release.type === 'match');

    return {
      ...withCandidatesAndReleases,
      mbArtists: match.artists,
      mbTracks: match.tracks,
      mbAlbum: fp.omit(['artists', 'tracks'], match),
      sortKeys: {
        artistNames: match.artists.map((artist) => artist.sortName).join('; '),
        releaseDate: match.mbReleaseDate,
        albumName: withCandidatesAndReleases.roonAlbum.albumName,
      },
    };
  } else {
    return withCandidatesAndReleases;
  }
};

const buildStableAlbumData = async (socket, browseInstance) => {
  const roonAlbums = camelCaseKeys(await browser.loadAlbums(browseInstance));

  const processableRoonAlbums = roonAlbums.items.filter(
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
    delay: 250,
  });

  socket.emit('albums', augmentedAlbums);

  augmentedAlbums
    .filter(
      (album) =>
        album.status !== 'albumMatched' && album.status !== 'noAlbumMatchFound',
    )
    .forEach((album) => enqueue(album));
};

export {
  buildInitialAlbumStructure,
  buildNewAlbumFromAlbum,
  buildStableAlbumData,
};
