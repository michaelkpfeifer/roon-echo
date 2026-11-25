import fp from 'lodash/fp.js';

import type { AlbumAggregate } from '../../../../shared/internal/albumAggregate';
import type { Tag } from '../../../../shared/internal/tag';
import TagToggle from '../../Components/TagToggle';
import { useData } from '../../DataContext';

type AlbumTagsParams = {
  albumAggregate: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' | 'withMbMatch' | 'withoutMbMatch' }
  >;
};

const findTagsByTagIds = (tags: Tag[], tagIds: string[]) => {
  return tags
    .filter((tag) => tagIds.includes(tag.tagId))
    .sort((tag1, tag2) => tag1.name.localeCompare(tag2.name));
};

function AlbumTags({ albumAggregate }: AlbumTagsParams) {
  const { albumTags, tags } = useData();

  const tagsAdded = albumTags[albumAggregate.id]
    ? findTagsByTagIds(tags, albumTags[albumAggregate.id])
    : [];
  const tagsNotAdded = findTagsByTagIds(
    tags,
    fp.difference(
      tags.map((tag) => tag.tagId),
      albumTags[albumAggregate.id],
    ),
  );

  return (
    <>
      <span className="album-tag-badges--added">
        {tagsAdded.map((tag) => (
          <TagToggle
            key={tag.tagId}
            tag={tag}
            albumAggregate={albumAggregate}
            operation="remove"
          />
        ))}
      </span>
      <span className="album-tag-badges--not-added">
        {tagsNotAdded.map((tag) => (
          <TagToggle
            key={tag.tagId}
            tag={tag}
            albumAggregate={albumAggregate}
            operation="add"
          />
        ))}
      </span>
    </>
  );
}

export default AlbumTags;
