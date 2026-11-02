import type { Knex } from 'knex';

import type { DatabaseSchema } from '../databaseSchema.js';
import type { Tag } from '../../shared/internal/tag.ts';

const createTag = async (
  db: Knex<DatabaseSchema>,
  overrides?: Partial<Tag>,
): Promise<Tag> => {
  const tag: Tag = {
    tagId: '01a1980a-6acf-7201-bd00-0a7f955e7bcf',
    name: 'tag-name',
    description: 'Tag description',
    color: '#000000',
    backgroundColor: '#ffffff',
    ...overrides,
  };

  await db<DatabaseSchema['tags']>('tags').insert({
    tag_id: tag.tagId,
    name: tag.name,
    description: tag.description,
    color: tag.color,
    background_color: tag.backgroundColor,
  });

  return tag;
};

export { createTag };
