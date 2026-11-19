import { Router } from 'express';
import type { Knex } from 'knex';

import {
  albumAddTag,
  fetchAllAlbumTags,
  fetchTagIdsByAlbum,
} from '../repository.js';
import type { DatabaseSchema } from '../../databaseSchema.ts';

const createAlbumRouter = (db: Knex<DatabaseSchema>) => {
  const router = Router();

  router.put('/:albumId/tags/:tagId', async (req, res) => {
    const result = await albumAddTag(db, req.params.albumId, req.params.tagId);
    result.match(
      async () => {
        const tagIdsResult = await fetchTagIdsByAlbum(db, req.params.albumId);

        tagIdsResult.match(
          (tagIds) => {
            res.status(201).json(tagIds);
          },
          (error) => {
            res.status(500).json({ error });
          },
        );
      },
      (error) => {
        if (error === 'album-not-found' || error === 'tag-not-found') {
          res.status(404).json({ error });
        } else {
          res.status(500).json({ error });
        }
      },
    );
  });

  router.get('/tags', async (_req, res) => {
    const result = await fetchAllAlbumTags(db);
    result.match(
      (allAlbumTags) => {
        res.status(200).json(allAlbumTags);
      },
      (error) => {
        res.status(500).json({ error });
      },
    );
  });

  return router;
};

export { createAlbumRouter };
