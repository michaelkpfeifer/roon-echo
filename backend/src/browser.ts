import dotenv from 'dotenv';
import type RoonApiBrowse from 'node-roon-api-browse';
import { z } from 'zod';

import type { RawRoonAlbum } from './external/rawRoonAlbum.js';
import { camelCaseKeys } from './utils.js';
import type { AlbumSchedulingSpecification } from '../../shared/internal/albumSchedulingSpecification.js';
import type { TrackSchedulingSpecification } from '../../shared/internal/trackSchedulingSpecification.js';

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
  image_key: z.string(),
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
        image_key: z.string(),
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

const trackAddNext = async ({
  browseInstance,
  albumKey,
  roonPosition,
  zoneId,
}: {
  browseInstance: InstanceType<typeof RoonApiBrowse>;
  albumKey: string;
  roonPosition: number;
  zoneId: string;
}) => {
  const loadAlbumData = await loadAlbum(browseInstance, albumKey);
  const trackKey = loadAlbumData.items[roonPosition].item_key;
  const loadTrackData = await loadTrack(browseInstance, trackKey);
  const trackAddNextItem = loadTrackData.items.find(
    (item) => item.title === 'Add Next',
  );

  if (!trackAddNextItem) {
    throw new Error('Error: Could not find track "Add Next" item.');
  }

  await browseInstance.browse({
    hierarchy: 'browse',
    item_key: trackAddNextItem.item_key,
    zone_or_output_id: zoneId,
  });
};

const albumAddNext = async ({
  browseInstance,
  albumKey,
  zoneId,
}: {
  browseInstance: InstanceType<typeof RoonApiBrowse>;
  albumKey: string;
  zoneId: string;
}) => {
  const loadAlbumData = await loadAlbum(browseInstance, albumKey);
  const playAlbumKey = loadAlbumData.play_album_item_key;

  const playAlbumOptionsBrowseData = rawBrowseResponseSchema.parse(
    await browseAsync(browseInstance, {
      hierarchy: 'browse',
      item_key: playAlbumKey,
    }),
  );

  const playAlbumOptionsLoadData = rawLoadPlayAlbumOptionsResponseSchema.parse(
    await loadAsync(browseInstance, {
      hierarchy: 'browse',
      offset: 0,
      count: playAlbumOptionsBrowseData.list.count,
    }),
  );

  if (!playAlbumOptionsLoadData) {
    throw new Error('Error: Could not find album play options.');
  }

  const albumAddNextItem = playAlbumOptionsLoadData.items.find(
    (item) => item.title === 'Add Next',
  );

  if (!albumAddNextItem) {
    throw new Error('Error: Could not find album "Add Next" item.');
  }

  await browseInstance.browse({
    hierarchy: 'browse',
    item_key: albumAddNextItem.item_key,
    zone_or_output_id: zoneId,
  });
};

const findAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  roonAlbumName: string,
  roonAlbumArtistName: string,
  roonAlbumCount: number,
) => {
  console.log('>>>> findAlbum: roonAlbumName', roonAlbumName);
  console.log('>>>> findAlbum: roonAlbumArtistName', roonAlbumArtistName);
  console.log('>>>> findAlbum: roonAlbumCount', roonAlbumCount);
};

const scheduleAlbum = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  roonAlbumCount: number,
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
    roonAlbumCount,
  );

  console.log('>>>> scheduleAlbum: album:', album);
};

const scheduleTrack = async (
  browseInstance: InstanceType<typeof RoonApiBrowse>,
  roonAlbumCount: number,
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
    roonAlbumCount,
  );

  console.log('>>>> scheduleTrack: album:', album);
};

const findTracks = () => {};

// const findAlbum = async (
//   browseInstance: InstanceType<typeof RoonApiBrowse>,
//   roonAlbumName: string,
//   roonAlbumArtistName: string,
// ) => {
//   console.log('>>>>> roonAlbumName:', roonAlbumName);
//   console.log('>>>>> roonAlbumArtistName:', roonAlbumArtistName);

//   const topLevelBrowseData = rawBrowseResponseSchema.parse(
//     await browseAsync(browseInstance, {
//       hierarchy: 'search',
//       input: `${roonAlbumName} ${roonAlbumArtistName}`,
//       pop_all: true,
//     }),
//   );

//   console.log('>>>>> topLevelBrowseData:', topLevelBrowseData);

//   const topLevelLoadData = rawLoadTopLevelResponseSchema.parse(
//     await loadAsync(browseInstance, {
//       hierarchy: 'search',
//       offset: 0,
//       count: topLevelBrowseData.list.count,
//     }),
//   );

//   console.log('>>>>> topLevelLoadData:', topLevelLoadData);

//   const albumsCategoryItem = topLevelLoadData.items.find(
//     (item) => item.title === 'Albums',
//   );

//   console.log('>>>>> albumsCategoryItem:', albumsCategoryItem);

//   if (!albumsCategoryItem) {
//     throw new Error('Could not find "Albums" item');
//   }

//   const albumsBrowseData = rawBrowseResponseSchema.parse(
//     await browseAsync(browseInstance, {
//       hierarchy: 'search',
//       item_key: albumsCategoryItem.item_key,
//     }),
//   );

//   console.log('>>>>> albumsBrowseData:', albumsBrowseData);

//   const albumsLoadData = rawLoadLibraryResponseSchema.parse(
//     await loadAsync(browseInstance, {
//       hierarchy: 'search',
//       offset: 0,
//       count: albumsBrowseData.list.count,
//     }),
//   );

//   console.log('>>>>> albumsLoadData:', albumsLoadData);

//   const matches = [];

//   for (const { item_key } of albumsLoadData.items) {
//     const albumBrowseData = rawBrowseResponseSchema.parse(
//       await browseAsync(browseInstance, {
//         hierarchy: 'search',
//         item_key,
//       }),
//     );

//     console.log('>>>>> albumBrowseData:', albumBrowseData);

//     const albumLoadData = await loadAsync(browseInstance, {
//       hierarchy: 'search',
//       offset: 0,
//       count: albumBrowseData.list.count,
//     });

//     console.log('>>>>> albumLoadData:', albumLoadData);

//     const nextAlbumBrowseData = await browseAsync(browseInstance, {
//       hierarchy: 'search',
//       item_key: albumLoadData.items[0].item_key,
//     });

//     console.log('>>>>> nextAlbumBrowseData:', nextAlbumBrowseData);

//     const nextAlbumLoadData = await loadAsync(browseInstance, {
//       hierarchy: 'search',
//       offset: 0,
//       count: nextAlbumBrowseData.list.count,
//     });

//     console.log('>>>>> nextAlbumLoadData:', nextAlbumLoadData);

//     if (
//       nextAlbumLoadData.list.title === roonAlbumName &&
//       nextAlbumLoadData.list.subtitle === roonAlbumArtistName
//     ) {
//       matches.push(nextAlbumLoadData);
//     }
//   }

//   console.log('>>>>> matches:', matches);
//   console.log('>>>>> matches.length:', matches.length);

//   if (matches.length === 0) {
//     throw new Error('Could not find matching album.');
//   }

//   if (matches.length >= 2) {
//     throw new Error('Found too many matching albums');
//   }

//   return matches[0];
// };

// const scheduleAlbum = async (
//   browseInstance: InstanceType<typeof RoonApiBrowse>,
//   {
//     roonAlbumName,
//     roonAlbumArtistName,
//     how,
//     zoneId,
//   }: AlbumSchedulingSpecification,
// ) => {
//   const album = await findAlbum(
//     browseInstance,
//     roonAlbumName,
//     roonAlbumArtistName,
//   );

//   if (!album) {
//     throw new Error('Could not find album');
//   }

//   const playAlbumKey = album.items[0].item_key;

//   console.log('>>>>> playAlbumKey:', playAlbumKey);

//   const playAlbumOptionsBrowseData = rawBrowseResponseSchema.parse(
//     await browseAsync(browseInstance, {
//       hierarchy: 'search',
//       item_key: playAlbumKey,
//     }),
//   );

//   console.log('>>>>> playAlbumOptionsBrowseData:', playAlbumOptionsBrowseData);

//   const playAlbumOptionsLoadData = rawLoadPlayAlbumOptionsResponseSchema.parse(
//     await loadAsync(browseInstance, {
//       hierarchy: 'search',
//       offset: 0,
//       count: playAlbumOptionsBrowseData.list.count,
//     }),
//   );

//   console.log('>>>>> playAlbumOptionsLoadData:', playAlbumOptionsLoadData);

//   const playAlbumOption = playAlbumOptionsLoadData.items.find(
//     (option) => option.title === how,
//   );

//   console.log('>>>>> playAlbumOption:', playAlbumOption);

//   if (!playAlbumOption) {
//     throw new Error('Could not find album action');
//   }

//   await browseInstance.browse({
//     hierarchy: 'search',
//     item_key: playAlbumOption.item_key,
//     zone_or_output_id: zoneId,
//   });
// };

// const scheduleTrack = async (
//   browseInstance: InstanceType<typeof RoonApiBrowse>,
//   {
//     roonAlbumName,
//     roonAlbumArtistName,
//     roonPosition,
//     how,
//     zoneId,
//   }: TrackSchedulingSpecification,
// ) => {
//   const album = await findAlbum(
//     browseInstance,
//     roonAlbumName,
//     roonAlbumArtistName,
//   );

//   console.log('>>> scheduleTrack: album:', album);

//   if (!album) {
//     throw new Error('Could not find album');
//   }

//   const track = album.items[roonPosition];

//   console.log('>>> scheduleTrack: track:', track);

//   const playTrackOptionsBrowseData = rawBrowseResponseSchema.parse(
//     await browseAsync(browseInstance, {
//       hierarchy: 'search',
//       item_key: track.item_key,
//     }),
//   );

//   console.log(
//     '>>> scheduleTrack: playTrackOptionsBrowseData:',
//     playTrackOptionsBrowseData,
//   );

//   const playTrackOptionsLoadData = rawLoadLibraryResponseSchema.parse(
//     await loadAsync(browseInstance, {
//       hierarchy: 'search',
//       offset: 0,
//       count: playTrackOptionsBrowseData.list.count,
//     }),
//   );

//   console.log(
//     '>>> scheduleTrack: playTrackOptionsLoadData:',
//     playTrackOptionsLoadData,
//   );

//   const playTrackOption = playTrackOptionsLoadData.items.find(
//     (option) => option.title === how,
//   );

//   if (!playTrackOption) {
//     throw new Error('Could not find track action');
//   }

//   console.log('>>> scheduleTrack: playTrackOption:', playTrackOption);

//   await browseInstance.browse({
//     hierarchy: 'search',
//     item_key: playTrackOption.item_key,
//     zone_or_output_id: zoneId,
//   });
// };

// const findTracks = async (
//   browseInstance: InstanceType<typeof RoonApiBrowse>,
//   roonAlbumName: string,
//   roonAlbumArtistName: string,
// ) => {
//   console.log('+++ roonAlbumName:', roonAlbumName);
//   console.log('+++ roonAlbumArtistName:', roonAlbumArtistName);

//   const album = await findAlbum(
//     browseInstance,
//     roonAlbumName,
//     roonAlbumArtistName,
//   );

//   return album.items
//     .slice(1)
//     .map((track) => fp.omit(['image_key', 'hint'], track));
// };

export {
  albumAddNext,
  findTracks,
  loadAlbum,
  loadAlbums,
  loadTrack,
  rawLoadAlbumResponseSchema,
  rawLoadAlbumsResponseSchema,
  scheduleAlbum,
  scheduleTrack,
  trackAddNext,
};
