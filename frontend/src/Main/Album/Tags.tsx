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

  const tagsAdded = findTagsByTagIds(tags, albumTags[albumAggregate.id]);
  const tagsNotAdded = findTagsByTagIds(
    tags,
    fp.difference(
      tags.map((tag) => tag.tagId),
      albumTags[albumAggregate.id],
    ),
  );

  const addTag = async (albumId: string, tagId: string) => {
    const url: string = `/api/albums/${albumId}/tags/${tagId}`;
    const res = await fetch(url, { method: 'PUT' });
  };

  const albumHasTag = (albumId: string, tagId: string) => {
    if (!albumTags[albumId]) {
      return false;
    }

    return albumTags[albumId].includes(tagId) ? 'yes' : 'no';
  };

  return (
    <>
      <span className="album-tag-badges--added">
        {tagsAdded.map((tag) => (
          <TagToggle key={tag.tagId} tag={tag} operation="remove" />
        ))}
      </span>
      <span className="album-tag-badges--not-added">
        {tagsNotAdded.map((tag) => (
          <TagToggle key={tag.tagId} tag={tag} operation="add" />
        ))}
      </span>

      <ul>
        {tags.map((tag) => (
          <li key={tag.tagId}>
            <label>
              <button
                type="button"
                onClick={() => {
                  addTag(albumAggregate.id, tag.tagId);
                }}
              >
                {tag.name}
              </button>
              <span> - </span>
              <span>{albumHasTag(albumAggregate.id, tag.tagId)}</span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

export default AlbumTags;
