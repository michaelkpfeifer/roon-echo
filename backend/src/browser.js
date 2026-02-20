import { exit } from 'node:process';

const browseAsync = (browseInstance, options) =>
  new Promise((resolve, reject) => {
    browseInstance.browse(options, (browseError, browsePayload) => {
      if (browseError) {
        reject(browseError);
      } else {
        resolve(browsePayload);
      }
    });
  });

const loadAsync = (browseInstance, options) =>
  new Promise((resolve, reject) => {
    browseInstance.load(options, (loadError, loadPayload) => {
      if (loadError) {
        reject(loadError);
      } else {
        resolve(loadPayload);
      }
    });
  });

const loadLibrary = async (browseInstance, libraryBrowseData) => {
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

const browseLibrary = async (browseInstance, libraryItem) => {
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

const loadTopLevel = async (browseInstance, topLevelBrowseData) => {
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

const browseTopLevel = async (browseInstance) => {
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

const loadAlbums = async (browseInstance) => {
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
    offset: 0,
    count: Math.min(32, albumsBrowseData.list.count),
  });
  return albumsLoadData;
};

const loadAlbum = async (browseInstance, itemKey) => {
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

const loadTrack = async (browseInstance, itemKey) => {
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
