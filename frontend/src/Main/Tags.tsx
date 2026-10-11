import { err, ok } from 'neverthrow';
import { useContext, useMemo, useState } from 'react';

import AppContext from '../AppContext';
import { socket } from '../socket';
import TagRow from './TagRow';
import { sortTagsByName, filterTagsByPattern } from './Tags.helpers';
import type { SocketResult } from '../../../shared/internal/socketResult';
import type { SocketVoidResult } from '../../../shared/internal/socketVoidResult';
import type { Tag } from '../../../shared/internal/tag';
import type { TagError } from '../../../shared/internal/tagError';
import type { validateTag } from '../../../shared/src/validations/tag.js';

const blankTag: Tag = {
  tagId: 'new',
  name: '',
  description: null,
  color: '#000000',
  backgroundColor: '#ffffff',
};

function Tags() {
  const [tagsPattern, setTagsPattern] = useState('');
  const [editingTagId, setEditingTagId] = useState<string | 'new' | null>(null);
  const [backendTagValidationResult, setBackendTagValidationResult] = useState<
    ReturnType<typeof validateTag>
  >(ok(blankTag));

  const { setTags, tags } = useContext(AppContext);

  const sortedFilteredTags = useMemo(
    () => sortTagsByName(filterTagsByPattern(tags, tagsPattern)),
    [tags, tagsPattern],
  );

  const handleSave = (draft: Tag) => {
    if (editingTagId === 'new') {
      const { name, description, color, backgroundColor } = draft;
      socket.emit(
        'tags:create',
        { name, description, color, backgroundColor },
        (response: SocketResult<Tag, TagError>) => {
          if (response.ok) {
            setTags([...tags, response.value]);
            setEditingTagId(null);
            setBackendTagValidationResult(ok(draft));
          } else {
            switch (response.error.type) {
              case 'validation': {
                setBackendTagValidationResult(err(response.error.errors));
                break;
              }

              case 'internal': {
                /* eslint-disable no-console */
                console.error('Error:', response.error);
                /* eslint-enable no-console */
                break;
              }
            }
          }
        },
      );
      return;
    }

    socket.emit(
      'tags:update',
      draft,
      (response: SocketResult<Tag, TagError>) => {
        if (response.ok) {
          setTags(
            tags.map((tag) =>
              tag.tagId === response.value.tagId ? response.value : tag,
            ),
          );
          setEditingTagId(null);
          setBackendTagValidationResult(ok(draft));
        } else {
          switch (response.error.type) {
            case 'validation': {
              setBackendTagValidationResult(err(response.error.errors));
              break;
            }

            case 'internal': {
              /* eslint-disable no-console */
              console.error('Error:', response.error);
              /* eslint-enable no-console */
              break;
            }
          }
        }
      },
    );
  };

  const handleCancel = () => {
    setEditingTagId(null);
  };

  const handleDelete = (tagId: string) => {
    socket.emit('tags:delete', { tagId }, (response: SocketVoidResult) => {
      if (response.ok) {
        setTags(tags.filter((tag) => tag.tagId !== tagId));
      } else {
        /* eslint-disable no-console */
        console.error('Error: failed to delete tag:', response.error);
        /* eslint-enable no-console */
      }
    });
  };

  return (
    <>
      <h1 className="heading-display">Tags</h1>
      <div className="tags-heading">
        <div className="tags-heading__buttons">
          <button
            type="button"
            className="tags-heading__button"
            onClick={() => setEditingTagId('new')}
          >
            New Tag
          </button>
        </div>
        <div className="tags-heading__filter">
          <div className="filter">
            <input
              className="filter__input"
              type="text"
              value={tagsPattern}
              onChange={(e) => setTagsPattern(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="tags-container">
        {editingTagId === 'new' && (
          <TagRow
            key="new"
            tag={blankTag}
            isEditing={true}
            onStartEdit={() => {}}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
            backendTagValidationResult={backendTagValidationResult}
          />
        )}
        {sortedFilteredTags.map((tag) => (
          <TagRow
            key={tag.tagId}
            tag={tag}
            isEditing={editingTagId === tag.tagId}
            onStartEdit={() => setEditingTagId(tag.tagId)}
            onSave={handleSave}
            onCancel={handleCancel}
            onDelete={handleDelete}
            backendTagValidationResult={backendTagValidationResult}
          />
        ))}
      </div>
    </>
  );
}

export default Tags;
