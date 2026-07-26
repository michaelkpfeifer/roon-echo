import { useState } from 'react';

import type { Tag } from '../../../shared/internal/tag';

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
        <input
          className="tag-row-item"
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          className="tag-row-item"
          type="text"
          value={draft.description ?? ''}
          onChange={(e) =>
            setDraft({ ...draft, description: e.target.value || null })
          }
        />
        <input
          className="tag-row-item"
          type="text"
          value={draft.color}
          onChange={(e) => setDraft({ ...draft, color: e.target.value })}
        />
        <input
          className="tag-row-item"
          type="text"
          value={draft.backgroundColor}
          onChange={(e) =>
            setDraft({ ...draft, backgroundColor: e.target.value })
          }
        />
        <button
          className="tag-row-item"
          type="button"
          onClick={() => onSave(draft)}
        >
          Save
        </button>
        <button
          className="tag-row-item"
          type="button"
          onClick={() => {
            setDraft(tag);
            onCancel();
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="tag-row">
      <div
        className="tag-row-item"
        style={{ color: tag.color, backgroundColor: tag.backgroundColor }}
      >
        {tag.name}
      </div>
      <div className="tag-row-item">{tag.description}</div>
      <div className="tag-row-item">&nbsp;</div>
      <div className="tag-row-item">&nbsp;</div>
      <button className="tag-row-item" type="button" onClick={onStartEdit}>
        Edit
      </button>
      <button
        className="tag-row-item"
        type="button"
        onClick={() => onDelete(tag.tagId)}
      >
        Delete
      </button>
    </div>
  );
}

export default TagRow;
