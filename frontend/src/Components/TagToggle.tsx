import type { AlbumAggregate } from '../../../shared/internal/albumAggregate';
import type { Tag } from '../../../shared/internal/tag';
import { useData } from '../DataContext';

type TagToggleProps = {
  tag: Tag;
  albumAggregate: Extract<
    AlbumAggregate,
    { stage: 'withRoonAlbum' | 'withMbMatch' | 'withoutMbMatch' }
  >;
  operation: 'add' | 'remove';
};

function TagToggle({ tag, albumAggregate, operation }: TagToggleProps) {
  const { setAlbumTags } = useData();

  const badgeText = operation === 'add' ? `${tag.name} +` : `${tag.name} -`;

  const addOrRemoveTag = async () => {
    const url = `/api/albums/${albumAggregate.id}/tags/${tag.tagId}`;
    const response =
      operation === 'add'
        ? await fetch(url, { method: 'PUT' })
        : await fetch(url, { method: 'DELETE' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const albumTags = await response.json();

    setAlbumTags((currentAlbumTags) => ({
      ...currentAlbumTags,
      [albumAggregate.id]: albumTags,
    }));
  };

  return (
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
    <div
      className="tag-badge"
      style={{ color: tag.color, backgroundColor: tag.backgroundColor }}
      onClick={addOrRemoveTag}
    >
      {badgeText}
    </div>
    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
  );
}

export default TagToggle;
