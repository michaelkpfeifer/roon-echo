import { useState } from 'react';

import type { Tag } from '../../../shared/internal/tag';
import TagBadge from '../Components/TagBadge';

type TagRowProps = {
  tag: Tag;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (updated: Tag) => void;
  onCancel: () => void;
  onDelete: (tagId: string) => void;
};

function TagRow({
  tag,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
}: TagRowProps) {
  const [draft, setDraft] = useState(tag);

  if (isEditing) {
    return (
      <div className="tag-row">
        <div className="tag-row-item">
          <input
            className="tag-row-item--input"
            type="text"
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          />
        </div>
        <div className="tag-row-item">
          <input
            className="tag-row-item--input"
            type="text"
            value={draft.description ?? ''}
            onChange={(e) =>
              setDraft({ ...draft, description: e.target.value || null })
            }
          />
        </div>
        <div className="tag-row-item">
          <input
            className="tag-row-item--input"
            type="text"
            value={draft.color}
            onChange={(e) => setDraft({ ...draft, color: e.target.value })}
          />
        </div>
        <div className="tag-row-item">
          <input
            className="tag-row-item--input"
            type="text"
            value={draft.backgroundColor}
            onChange={(e) =>
              setDraft({ ...draft, backgroundColor: e.target.value })
            }
          />
        </div>
        <div className="tag-row-item">
          <button
            className="button-m"
            type="button"
            onClick={() => onSave(draft)}
          >
            Save
          </button>
        </div>
        <div className="tag-row-item">
          <button
            className="button-m"
            type="button"
            onClick={() => {
              setDraft(tag);
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="tag-row">
      <div className="tag-row-item">
        <TagBadge
          name={tag.name}
          color={tag.color}
          backgroundColor={tag.backgroundColor}
        />
      </div>
      <div className="tag-row-item">
        <div className="tag-row-item--description">{tag.description}</div>
      </div>
      <div className="tag-row-item">&nbsp;</div>
      <div className="tag-row-item">&nbsp;</div>
      <div className="tag-row-item">
        <button className="button-m" type="button" onClick={onStartEdit}>
          Edit
        </button>
      </div>
      <div className="tag-row-item">
        <button
          className="button-m"
          type="button"
          onClick={() => onDelete(tag.tagId)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export type { TagRowProps };
export default TagRow;
