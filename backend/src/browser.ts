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

const rawErrorResponseSchema = z.string();

type RawErrorResponse = z.infer<typeof rawErrorResponseSchema>;
type BrowseError = RawErrorResponse | z.ZodError;

const rawBrowseResponseSchema = z.object({
  action: z.literal('list'),
  list: z.object({
    level: z.number(),
    title: z.string(),
    subtitle: z.string().nullable(),
    image_key: z.string().nullable(),
    count: z.number(),
    display_offset: z.null(),
  }),
});

type RawBrowseResponse = z.infer<typeof rawBrowseResponseSchema>;

const rawLoadTopLevelResponseSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      item_key: z.string(),
    }),
  ),
  list: z.object({
    title: z.string(),
    count: z.number(),
  }),
});

type RawLoadTopLevelResponse = z.infer<typeof rawLoadTopLevelResponseSchema>;

const rawLoadLibraryResponseSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      item_key: z.string(),
    }),
  ),
  list: z.object({
    title: z.string(),
    count: z.number(),
  }),
});

type RawLoadLibraryResponse = z.infer<typeof rawLoadLibraryResponseSchema>;

const rawLoadAlbumResponseSchema = z
  .any()
  .transform((data) => ({ ...data, items: data.items.slice(1) }))
  .pipe(
    z.object({
      items: z.array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
          item_key: z.string(),
        }),
      ),
      list: z.object({
        title: z.string(),
        subtitle: z.string(),
        image_key: z.string(),
        count: z.number(),
      }),
    }),
  );

type RawLoadAlbumResponse = z.infer<typeof rawLoadAlbumResponseSchema>;

const rawLoadTrackResponseSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      item_key: z.string(),
    }),
  ),
  list: z.object({
    title: z.string(),
    subtitle: z.string(),
  }),
});

type RawLoadTrackResponse = z.infer<typeof rawLoadTrackResponseSchema>;

type RawLoadResponse =
  | RawLoadTopLevelResponse
  | RawLoadLibraryResponse
  | RawLoadAlbumResponse
  | RawLoadTrackResponse;

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

function buildErrorMessage(description: string, err: BrowseError) {
  if (err instanceof z.ZodError) {
    return `Error: ${description}: Validation failed: ${z.flattenError(err)}`;
  } else {
    return `Error: ${description}: Roon API error: ${rawErrorResponseSchema.parse(err)}`;
  }
}

const browseAsync = (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  browseOptions: BrowseOptions,
) =>
  new Promise((resolve, reject) => {
    browseInstance.browse(
      browseOptions,
      (browseError: RawErrorResponse, browsePayload: RawBrowseResponse) => {
        if (browseError) {
          reject(browseError);
        } else {
          resolve(browsePayload);
        }
      },
    );
  });

const loadAsync = (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  loadOptions: LoadOptions,
) =>
  new Promise((resolve, reject) => {
    browseInstance.load(
      loadOptions,
      (loadError: RawErrorResponse, loadPayload: RawLoadResponse) => {
        if (loadError) {
          reject(loadError);
        } else {
          resolve(loadPayload);
        }
      },
    );
  });

const loadAlbums = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
) => {
  try {
    const topLevelBrowseData = rawBrowseResponseSchema.parse(
      await browseAsync(browseInstance, {
        hierarchy: 'browse',
        pop_all: true,
      }),
    );

    const topLevelLoadData = rawLoadTopLevelResponseSchema.parse(
      await loadAsync(browseInstance, {
        hierarchy: 'browse',
        offset: 0,
        count: topLevelBrowseData.list.count,
      }),
    );

    const libraryItem = topLevelLoadData.items.find(
      (item) => item.title === 'Library',
    );

    const libraryBrowseData = rawBrowseResponseSchema.parse(
      await browseAsync(browseInstance, {
        hierarchy: 'browse',
        item_key: libraryItem.item_key,
      }),
    );

    const libraryLoadData = rawLoadLibraryResponseSchema.parse(
      await loadAsync(browseInstance, {
        hierarchy: 'browse',
        offset: 0,
        count: libraryBrowseData.list.count,
      }),
    );

    const albumItem = libraryLoadData.items.find(
      (item) => item.title === 'Albums',
    );

    const albumsBrowseData = rawBrowseResponseSchema.parse(
      await browseAsync(browseInstance, {
        hierarchy: 'browse',
        item_key: albumItem.item_key,
      }),
    );

    const albumsLoadData = await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: roonBrowserAlbumsOffset,
      count: Math.min(roonBrowserAlbumsCount, albumsBrowseData.list.count),
    });

    return albumsLoadData;
  } catch (err) {
    throw new Error(
      buildErrorMessage('Error: Failed to load albums', err as BrowseError),
    );
  }
};

const loadAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  itemKey: string,
) => {
  try {
    const albumBrowseData = rawBrowseResponseSchema.parse(
      await browseAsync(browseInstance, {
        hierarchy: 'browse',
        item_key: itemKey,
      }),
    );

    const albumLoadData = rawLoadAlbumResponseSchema.parse(
      await loadAsync(browseInstance, {
        hierarchy: 'browse',
        offset: 0,
        count: albumBrowseData.list.count,
      }),
    );

    /* eslint-disable no-console */
    // console.log('browser.js: loadAlbum(): albumLoadData:', albumLoadData);
    /* eslint-enable no-console */

    return albumLoadData;
  } catch (err) {
    throw new Error(
      buildErrorMessage(
        'Error: Failed to load album by item key',
        err as BrowseError,
      ),
    );
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

    const trackLoadData = rawLoadTrackResponseSchema.parse(
      await loadAsync(browseInstance, {
        hierarchy: 'browse',
        offset: 0,
        count: trackBrowseData.list.count,
      }),
    );

    return trackLoadData;
  } catch (err) {
    throw new Error(
      buildErrorMessage(
        'Error: Failed to load track by item key',
        err as BrowseError,
      ),
    );
  }
};

export { loadAlbum, loadAlbums, loadTrack };
