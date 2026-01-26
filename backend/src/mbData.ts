import type { Knex } from 'knex';

import type { AlbumAggregate } from '../../shared/internal/albumAggregate';
import type { DatabaseSchema } from '../databaseSchema';
import {
  buildAlbumAggregateWithMbMatch,
  buildAlbumAggregateWithoutMbMatch,
} from './factories/albumAggregateFactory';
import { fetchMbAlbum, fetchMbCandidates } from './repository';

const getPersistedAlbumAggregateData = async (
  db: Knex<DatabaseSchema>,
  albumAggregateWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >,
) => {
  const roonAlbumData = albumAggregateWithRoonTracks.roonAlbum;

  if (!roonAlbumData.candidatesMatchedAt) {
    return albumAggregateWithRoonTracks;
  }

  const mbCandidates = await fetchMbCandidates(db, roonAlbumData.roonAlbumId);
  const mbAlbumResult = await fetchMbAlbum(db, roonAlbumData.roonAlbumId);

  if (mbAlbumResult.isOk()) {
    return buildAlbumAggregateWithMbMatch(
      albumAggregateWithRoonTracks,
      mbCandidates,
      mbAlbumResult._unsafeUnwrap(),
    );
  } else {
    return buildAlbumAggregateWithoutMbMatch(
      albumAggregateWithRoonTracks,
      mbCandidates,
    );
  }
};

const getAlbumAggregatesWithPersistedData = async (
  db: Knex<DatabaseSchema>,
  albumAggregatesWithRoonTracks: Extract<
    AlbumAggregate,
    { stage: 'withRoonTracks' }
  >[],
) => {
  const albumAggregatesWithPersistedData: (
    | Extract<AlbumAggregate, { stage: 'withRoonTracks' }>
    | Extract<AlbumAggregate, { stage: 'withMbMatch' }>
    | Extract<AlbumAggregate, { stage: 'withoutMbMatch' }>
  )[] = [];

  for (const albumAggregateWithRoonTracks of albumAggregatesWithRoonTracks) {
    const albumAggregateWithPersistedData =
      await getPersistedAlbumAggregateData(db, albumAggregateWithRoonTracks);

    albumAggregatesWithPersistedData.push(albumAggregateWithPersistedData);
  }

  return albumAggregatesWithPersistedData;
};

export { getAlbumAggregatesWithPersistedData };
