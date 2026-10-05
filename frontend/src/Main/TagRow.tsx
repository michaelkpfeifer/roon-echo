import clsx from 'clsx';
import { useMemo, useState } from 'react';

import type { Tag } from '../../../shared/internal/tag';
import {
  tagValidationErrorsFor,
  validateTag,
} from '../../../shared/src/validations/tag.js';
import TagBadge from '../Components/TagBadge';

type TagRowProps = {
  tag: Tag;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (updated: Tag) => void;
  onCancel: () => void;
  onDelete: (tagId: string) => void;
  backendTagValidationResult: ReturnType<typeof validateTag>;
};

function TagRow({
  tag,
  isEditing,
  onStartEdit,
  onSave,
  onCancel,
  onDelete,
  backendTagValidationResult,
}: TagRowProps) {
  const [draft, setDraft] = useState(tag);

  const frontendTagValidationResult = useMemo(() => {
    return validateTag(draft);
  }, [draft]);

  const tagNameValidationErrors = useMemo(() => {
    const frontendTagNameValdationErrors = frontendTagValidationResult.isErr()
      ? tagValidationErrorsFor(frontendTagValidationResult.error, 'name')
      : [];
    const backendTagNameValdationErrors = backendTagValidationResult.isErr()
      ? tagValidationErrorsFor(backendTagValidationResult.error, 'name')
      : [];

    return [
      ...new Set([
        ...frontendTagNameValdationErrors,
        ...backendTagNameValdationErrors,
      ]),
    ];
  }, [backendTagValidationResult, frontendTagValidationResult]);

  if (isEditing) {
    return (
      <>
        <div className="tag-row">
          <div
            className={clsx('tag-row-item--text-input-name', {
              'text-input-field-validation-errors':
                tagNameValidationErrors.length > 0,
            })}
          >
            <input
              aria-label="Name"
              type="text"
              value={draft.name ?? ''}
              onChange={(e) => {
                setDraft({ ...draft, name: e.target.value });
              }}
            />
          </div>
          <div className="tag-row-item--text-input-description">
            <input
              aria-label="Description"
              type="text"
              value={draft.description ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value || null })
              }
            />
          </div>
          <div className="tag-row-item--color-input">
            <input
              aria-label="Color"
              type="color"
              value={draft.color}
              onChange={(e) => setDraft({ ...draft, color: e.target.value })}
            />
          </div>
          <div className="tag-row-item--color-input">
            <input
              aria-label="Background color"
              type="color"
              value={draft.backgroundColor}
              onChange={(e) =>
                setDraft({ ...draft, backgroundColor: e.target.value })
              }
            />
          </div>
          <div className="tag-row-item--button">
            <button
              className="button-m"
              type="button"
              onClick={() => onSave(draft)}
              disabled={tagNameValidationErrors.length > 0}
            >
              Save
            </button>
          </div>
          <div className="tag-row-item--button">
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
        {tagNameValidationErrors.length > 0 && (
          <div className="validation-errors">
            {tagNameValidationErrors.join(', ')}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="tag-row">
      <div className="tag-row-item--name">
        <div className="tag-row-item--name-text">
          <TagBadge
            name={tag.name}
            color={tag.color}
            backgroundColor={tag.backgroundColor}
          />
        </div>
      </div>
      <div className="tag-row-item--description">
        <div className="tag-row-item--description-text">{tag.description}</div>
      </div>
      <div className="tag-row-item--color-input">
        <div>&nbsp;</div>
      </div>
      <div className="tag-row-item--color-input">
        <div>&nbsp;</div>
      </div>
      <div className="tag-row-item--button">
        <button className="button-m" type="button" onClick={onStartEdit}>
          Edit
        </button>
      </div>
      <div className="tag-row-item--button">
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
