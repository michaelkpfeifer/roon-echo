import { useState } from 'react';

import type { Tag } from '../../../shared/internal/tag';

type TagRowProps = {
  tag: Tag;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (updated: Tag) => void;
  onCancel: () => void;
};

function TagRow({
  tag,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
}: TagRowProps) {
  const [draft, setDraft] = useState(tag);

  if (isEditing) {
    return (
      <div>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
        />
        <input
          type="text"
          value={draft.description ?? ''}
          onChange={(e) =>
            setDraft({ ...draft, description: e.target.value || null })
          }
        />
        <input
          type="text"
          value={draft.color}
          onChange={(e) => setDraft({ ...draft, color: e.target.value })}
        />
        <input
          type="text"
          value={draft.backgroundColor}
          onChange={(e) =>
            setDraft({ ...draft, backgroundColor: e.target.value })
          }
        />
        <button type="button" onClick={() => onSave(draft)}>
          Save
        </button>
        <button
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
    <div>
      <span style={{ color: tag.color, backgroundColor: tag.backgroundColor }}>
        {tag.name}
      </span>
      <span>{tag.description}</span>
      <button type="button" onClick={onStartEdit}>
        Edit
      </button>
    </div>
  );
}

export default TagRow;
