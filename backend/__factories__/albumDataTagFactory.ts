import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.js';
import type { AlbumData } from '../src/internal/albumData.js';
import type { Tag } from '../../shared/internal/tag.ts';

const associateAlbumDataAndTag = async (
  db: Knex<DatabaseSchema>,
  albumDataOverrides?: Partial<AlbumData>,
  tagOverrides?: Partial<Tag>,
) => {
  const albumData: AlbumData = {
    albumId: '019c9157-deb2-7dbd-b259-e70d2601ac58',
    roonAlbumName: 'Some Album',
    roonAlbumArtistName: 'Some Artist',
    mbCandidatesFetchedAt: null,
    mbCandidatesMatchedAt: null,
    mbAlbumId: '019c9158-eeff-7cb4-8618-d915e4d51732',
    mbAlbumName: 'Some Album',
    mbScore: 100,
    mbTrackCount: 10,
    mbReleaseDate: '2025-02-01',
    createdAt: '2026-01-01 16:00',
    updatedAt: '2016-01-01 16:00',
    ...albumDataOverrides,
  };

  const tag: Tag = {
    tagId: '01a1980a-6acf-7201-bd00-0a7f955e7bcf',
    name: 'tag-name',
    description: 'Tag description',
    color: '#000000',
    backgroundColor: '#ffffff',
    ...tagOverrides,
  };

  await db<DatabaseSchema['albums_tags']>('albums_tags').insert({
    album_id: albumData.albumId,
    tag_id: tag.tagId,
  });
};

export { associateAlbumDataAndTag };
