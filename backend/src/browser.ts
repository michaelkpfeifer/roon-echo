import { exit } from 'node:process';

import dotenv from 'dotenv';
import type RoonApiBrowse from 'node-roon-api-browse';

dotenv.config();

const roonBrowserAlbumsOffset = parseInt(
  process.env.ROON_BROWSER_ALBUMS_OFFSET ?? '0',
  10,
);
const roonBrowserAlbumsCount = parseInt(
  process.env.ROON_BROWSER_ALBUMS_COUNT ?? '99999',
  10,
);

const browseAsync = (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  options,
) =>
  new Promise((resolve, reject) => {
    browseInstance.browse(options, (browseError, browsePayload) => {
      if (browseError) {
        reject(browseError);
      } else {
        resolve(browsePayload);
      }
    });
  });

const loadAsync = (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  options,
) =>
  new Promise((resolve, reject) => {
    browseInstance.load(options, (loadError, loadPayload) => {
      if (loadError) {
        reject(loadError);
      } else {
        resolve(loadPayload);
      }
    });
  });

const loadLibrary = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  libraryBrowseData,
) => {
  try {
    const libraryLoadData = await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: libraryBrowseData.list.count,
    });

    /* eslint-disable no-console */
    // console.log(
    //   'browser.js: loadTopLevel(): libraryLoadData:',
    //   libraryLoadData,
    // );
    /* eslint-enable no-console */

    return libraryLoadData;
  } catch (err) {
    process.stderr.write(
      'Error: Failed to load top level hierarchy:',
      err,
      '\n',
    );
    exit(1);
  }
};

const browseLibrary = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  libraryItem,
) => {
  try {
    const libraryBrowseData = await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: libraryItem.item_key,
    });

    /* eslint-disable no-console */
    // console.log(
    //   'browser.js: browseLibrary(): libraryBrowseData:',
    //   libraryBrowseData,
    // );
    /* eslint-enable no-console */

    return loadLibrary(browseInstance, libraryBrowseData);
  } catch (err) {
    process.stderr.write(
      'Error: Failed to browse library hierarchy:',
      err,
      '.\n',
    );
    exit(1);
  }
};

const loadTopLevel = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  topLevelBrowseData,
) => {
  try {
    const topLevelLoadData = await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: topLevelBrowseData.list.count,
    });

    /* eslint-disable no-console */
    // console.log(
    //   'browser.js: loadTopLevel(): topLevelLoadData:',
    //   topLevelLoadData,
    // );
    /* eslint-enable no-console */

    return browseLibrary(
      browseInstance,
      topLevelLoadData.items.find((item) => item.title === 'Library'),
    );
  } catch (err) {
    process.stderr.write(
      'Error: Failed to load top level hierarchy:',
      err,
      '.\n',
    );
    exit(1);
  }
};

const browseTopLevel = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
) => {
  try {
    const topLevelBrowseData = await browseAsync(browseInstance, {
      hierarchy: 'browse',
      pop_all: true,
      item_key: null,
    });

    /* eslint-disable no-console */
    // console.log(
    //   'browser.js: browseTopLevel(): topLevelBrowseData:',
    //   topLevelBrowseData,
    // );
    /* eslint-enable no-console */

    return loadTopLevel(browseInstance, topLevelBrowseData);
  } catch (err) {
    process.stderr.write(
      'Error: Failed to browse top level hierarchy:',
      err,
      '\n',
    );
    exit(1);
  }
};

const loadAlbums = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
) => {
  const libraryLoadData = await browseTopLevel(browseInstance);
  const albumsItem = libraryLoadData.items.find(
    (item) => item.title === 'Albums',
  );
  const albumsBrowseData = await browseAsync(browseInstance, {
    hierarchy: 'browse',
    item_key: albumsItem.item_key,
  });
  const albumsLoadData = await loadAsync(browseInstance, {
    hierarchy: 'browse',
    offset: roonBrowserAlbumsOffset,
    count: Math.min(roonBrowserAlbumsCount, albumsBrowseData.list.count),
  });
  return albumsLoadData;
};

const loadAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  itemKey,
) => {
  try {
    const albumBrowseData = await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: itemKey,
    });

    const albumLoadData = await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: albumBrowseData.list.count,
    });

    /* eslint-disable no-console */
    // console.log('browser.js: loadTopLevel(): albumLoadData:', albumLoadData);
    /* eslint-enable no-console */

    return albumLoadData;
  } catch (err) {
    process.stderr.write(`Error: Failed to load track by item key: ${err}\n`);
    exit(1);
  }
};

const loadTrack = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  itemKey,
) => {
  try {
    const trackBrowseData = await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: itemKey,
    });

    const trackLoadData = await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: trackBrowseData.list.count,
    });

    /* eslint-disable no-console */
    // console.log('browser.js: loadTopLevel(): trackLoadData:', trackLoadData);
    /* eslint-enable no-console */

    return trackLoadData;
  } catch (err) {
    process.stderr.write('Error: Failed to load track by item key:', err, '\n');
    exit(1);
  }
};

export { browseAsync, loadAlbum, loadAlbums, loadAsync, loadTrack };
