import dotenv from 'dotenv';
import type RoonApiBrowse from 'node-roon-api-browse';
import { z } from 'zod';

dotenv.config();

const roonBrowserAlbumsOffset = parseInt(
  process.env.ROON_BROWSER_ALBUMS_OFFSET ?? '0',
  10,
);
const roonBrowserAlbumsCount = parseInt(
  process.env.ROON_BROWSER_ALBUMS_COUNT ?? '99999',
  10,
);

const rawBrowseResponseSchema = z.object({
  action: z.literal('list'),
  list: z.object({
    level: z.number(),
    title: z.string(),
    subtitle: z.string().nullable(),
    image_key: z.null(),
    count: z.number(),
    display_offset: z.null(),
    hint: z.literal('action_list').nullable(),
  }),
});

type BrowseOptions = {
  hierarchy: string;
  item_key?: string;
  pop_all?: boolean;
};

type LoadOptions = {
  hierarchy: string;
  offset?: number;
  count?: number;
};

const browseAsync = (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  browseOptions: BrowseOptions,
) =>
  new Promise((resolve, reject) => {
    browseInstance.browse(browseOptions, (browseError, browsePayload) => {
      if (browseError) {
        reject(browseError);
      } else {
        resolve(browsePayload);
      }
    });
  });

const loadAsync = (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  loadOptions: LoadOptions,
) =>
  new Promise((resolve, reject) => {
    browseInstance.load(loadOptions, (loadError, loadPayload) => {
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
    throw new Error(`Error: Failed to load albums from library: ${err}.`);
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
    throw new Error(`Error: Failed to browse library by item key: ${err}.`);
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
    throw new Error(`Error: Failed to load top level hierarchy: ${err}.`);
  }
};

const browseTopLevel = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
) => {
  try {
    const topLevelBrowseData = await browseAsync(browseInstance, {
      hierarchy: 'browse',
      pop_all: true,
    });

    /* eslint-disable no-console */
    // console.log(
    //   'browser.js: browseTopLevel(): topLevelBrowseData:',
    //   topLevelBrowseData,
    // );
    /* eslint-enable no-console */

    return loadTopLevel(browseInstance, topLevelBrowseData);
  } catch (err) {
    throw new Error(`Error: Failed to browse top level hierarchy: ${err}.`);
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
  itemKey: string,
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
    throw new Error(`Error: Failed to load album by item key: ${err}.`);
  }
};

const loadTrack = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  itemKey: string,
) => {
  try {
    const trackBrowseData = rawBrowseResponseSchema.parse(
      await browseAsync(browseInstance, {
        hierarchy: 'browse',
        item_key: itemKey,
      }),
    );

    /* eslint-disable no-console */
    console.log('browser.js: loadTrack(): trackBrowseData:', trackBrowseData);
    /* eslint-enable no-console */

    const trackLoadData = await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: trackBrowseData.list.count,
    });

    /* eslint-disable no-console */
    console.log('browser.js: loadTrack(): trackLoadData:', trackLoadData);
    /* eslint-enable no-console */

    return trackLoadData;
  } catch (err) {
    throw new Error(`Error: Failed to load track by item key: ${err}.`);
  }
};

export { loadAlbum, loadAlbums, loadTrack };
