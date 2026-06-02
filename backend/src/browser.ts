import dotenv from 'dotenv';
import type RoonApiBrowse from 'node-roon-api-browse';
import { z } from 'zod';

import type { RawRoonAlbum } from './external/rawRoonAlbum.js';
import { camelCaseKeys } from './utils.js';
import type { AlbumSchedulingSpecification } from '../../shared/internal/albumSchedulingSpecification.js';
import type { TrackSchedulingSpecification } from '../../shared/internal/trackSchedulingSpecification.js';
import {
  findIndexInRoonAlbumIdCache,
  setRoonAlbumIdCache,
} from './roonAlbumIdCache.js';
import { transformToRoonAlbumId } from './transforms/rawRoonAlbum.js';

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

const rawAlbumSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty.'),
  subtitle: z.string().refine((val) => val !== 'Unknown Artist', {
    message: 'Artist cannot be unknown',
  }),
  image_key: z.string().nullable(),
  item_key: z.string(),
  hint: z.string(),
});

type RawAlbum = z.infer<typeof rawAlbumSchema>;

const rawLoadAlbumsResponseSchema = z.object({
  items: z.array(z.unknown()).transform((items) => {
    return items.reduce((acc: RawAlbum[], item) => {
      const result = rawAlbumSchema.safeParse(item);

      if (result.success) {
        acc.push(result.data);
      } else {
        /* eslint-disable no-console */
        console.warn(
          `[Validation Failed] schema: rawLoadAlbumsResponseSchema, data: ${JSON.stringify(item)}`,
        );
        /* eslint-enable no-console */
        result.error.issues.forEach((issue) => {
          /* eslint-disable no-console */
          console.warn(`  - Path: ${issue.path.join('.')}`);
          console.warn(`  - Reason: ${issue.message}`);
          /* eslint-enable no-console */
        });
      }
      return acc;
    }, []);
  }),
  offset: z.number(),
  list: z.object({
    level: z.number(),
    title: z.literal('Albums'),
    subtitle: z.null(),
    image_key: z.null(),
    count: z.number(),
    display_offset: z.null(),
  }),
});

const rawLoadAlbumResponseSchema = z
  .any()
  .transform((data) => ({
    ...data,
    items: data.items.slice(1),
    play_album_item_key: data.items[0]?.item_key ?? null,
  }))
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
        image_key: z.string().nullable(),
        count: z.number(),
      }),
      play_album_item_key: z.string(),
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

const rawLoadPlayAlbumOptionsResponseSchema = z.object({
  items: z.array(
    z.object({
      title: z.string(),
      item_key: z.string(),
    }),
  ),
});

type RawLoadPlayAlbumOptionsResponseSchema = z.infer<
  typeof rawLoadPlayAlbumOptionsResponseSchema
>;

type RawLoadResponse =
  | RawLoadTopLevelResponse
  | RawLoadLibraryResponse
  | RawLoadAlbumResponse
  | RawLoadTrackResponse
  | RawLoadPlayAlbumOptionsResponseSchema;

type BrowseOptions = {
  hierarchy: string;
  item_key?: string;
  input?: string;
  pop_all?: boolean;
};

type LoadOptions = {
  hierarchy: string;
  offset?: number;
  count?: number;
};

function buildErrorMessage(description: string, err: BrowseError) {
  if (err instanceof z.ZodError) {
    return `Error: ${description}: Validation failed: ${JSON.stringify(z.flattenError(err), null, 4)}`;
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
): Promise<RawRoonAlbum[]> => {
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

    if (!libraryItem) {
      throw new Error('Library not found despite validation.');
    }

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

    if (!albumItem) {
      throw new Error('Albums not found despite validation.');
    }

    const albumsBrowseData = rawBrowseResponseSchema.parse(
      await browseAsync(browseInstance, {
        hierarchy: 'browse',
        item_key: albumItem.item_key,
      }),
    );

    const albumsLoadData = rawLoadAlbumsResponseSchema.parse(
      await loadAsync(browseInstance, {
        hierarchy: 'browse',
        offset: roonBrowserAlbumsOffset,
        count: Math.min(roonBrowserAlbumsCount, albumsBrowseData.list.count),
      }),
    );

    return albumsLoadData.items.map(
      (item: RawAlbum) => camelCaseKeys(item) as RawRoonAlbum,
    );
  } catch (err) {
    throw new Error(
      buildErrorMessage('Failed to load albums', err as BrowseError),
      { cause: err },
    );
  }
};

const loadAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  itemKey: string,
): Promise<RawLoadAlbumResponse> => {
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

    return albumLoadData;
  } catch (err) {
    throw new Error(
      buildErrorMessage('Failed to load album by item key', err as BrowseError),
      { cause: err },
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
      buildErrorMessage('Failed to load track by item key', err as BrowseError),
      { cause: err },
    );
  }
};

const findAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  roonAlbumName: string,
  roonAlbumArtistName: string,
) => {
  const offset = findIndexInRoonAlbumIdCache(
    roonAlbumName,
    roonAlbumArtistName,
  );

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

  if (!libraryItem) {
    throw new Error('Library not found despite validation.');
  }

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

  const albumsItem = libraryLoadData.items.find(
    (item) => item.title === 'Albums',
  );

  if (!albumsItem) {
    throw new Error('Albums not found despite validation.');
  }

  rawBrowseResponseSchema.parse(
    await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: albumsItem.item_key,
    }),
  );

  const albumsLoadData = rawLoadAlbumsResponseSchema.parse(
    await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset,
      count: 1,
    }),
  );

  const retrievedRoonAlbumName = albumsLoadData.items[0].title;
  const retrievedRoonAlbumAritstName = albumsLoadData.items[0].subtitle;

  if (
    retrievedRoonAlbumName === roonAlbumName &&
    retrievedRoonAlbumAritstName === roonAlbumArtistName
  ) {
    return albumsLoadData.items[0];
  } else {
    setRoonAlbumIdCache(
      (await loadAlbums(browseInstance)).map((rawRoonAlbum) =>
        transformToRoonAlbumId(rawRoonAlbum),
      ),
    );

    return findAlbum(browseInstance, roonAlbumName, roonAlbumArtistName);
  }
};

const scheduleAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  {
    roonAlbumName,
    roonAlbumArtistName,
    how,
    zoneId,
  }: AlbumSchedulingSpecification,
) => {
  const album = await findAlbum(
    browseInstance,
    roonAlbumName,
    roonAlbumArtistName,
  );

  if (!album) {
    throw new Error('Could not find album');
  }

  const playAlbumKey = album.item_key;

  const playAlbumBrowseData = rawBrowseResponseSchema.parse(
    await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: playAlbumKey,
    }),
  );

  const playAlbumLoadData = rawLoadPlayAlbumOptionsResponseSchema.parse(
    await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: playAlbumBrowseData.list.count,
    }),
  );

  const playAlbumOption = playAlbumLoadData.items.find(
    (option) => option.title === 'Play Album',
  );

  if (!playAlbumOption) {
    throw new Error('Could not find album play action');
  }

  const playAlbumOptionBrowseData = rawBrowseResponseSchema.parse(
    await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: playAlbumOption.item_key,
    }),
  );

  const playAlbumOptionLoadData = rawLoadPlayAlbumOptionsResponseSchema.parse(
    await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: playAlbumOptionBrowseData.list.count,
    }),
  );

  const scheduleAlbumOption = playAlbumOptionLoadData.items.find(
    (option) => option.title === how,
  );

  if (!scheduleAlbumOption) {
    throw new Error('Could not find album scheduling option.');
  }

  await browseInstance.browse({
    hierarchy: 'browse',
    item_key: scheduleAlbumOption.item_key,
    zone_or_output_id: zoneId,
  });
};

const scheduleTrack = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  {
    roonAlbumName,
    roonAlbumArtistName,
    roonPosition,
    how,
    zoneId,
  }: TrackSchedulingSpecification,
) => {
  const album = await findAlbum(
    browseInstance,
    roonAlbumName,
    roonAlbumArtistName,
  );

  if (!album) {
    throw new Error('Could not find album');
  }

  const playAlbumKey = album.item_key;

  const playAlbumBrowseData = rawBrowseResponseSchema.parse(
    await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: playAlbumKey,
    }),
  );

  const playAlbumLoadData = rawLoadPlayAlbumOptionsResponseSchema.parse(
    await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: playAlbumBrowseData.list.count,
    }),
  );

  const track = playAlbumLoadData.items[roonPosition];

  const playTrackOptionBrowseData = rawBrowseResponseSchema.parse(
    await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: track.item_key,
    }),
  );

  const playTrackOptionLoadData = rawLoadLibraryResponseSchema.parse(
    await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: playTrackOptionBrowseData.list.count,
    }),
  );

  const scheduleTrackOption = playTrackOptionLoadData.items.find(
    (option) => option.title === how,
  );

  if (!scheduleTrackOption) {
    throw new Error('Could not find track scheduling option.');
  }

  await browseInstance.browse({
    hierarchy: 'browse',
    item_key: scheduleTrackOption.item_key,
    zone_or_output_id: zoneId,
  });
};

export {
  loadAlbum,
  loadAlbums,
  loadTrack,
  rawLoadAlbumResponseSchema,
  rawLoadAlbumsResponseSchema,
  scheduleAlbum,
  scheduleTrack,
};
