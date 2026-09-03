import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest';

import type { ClientToServerEvents } from '../../../shared/internal/socket';
import type { Tag } from '../../../shared/internal/tag';
import AppContext from '../../src/AppContext';
import type { TagRowProps } from '../../src/Main/TagRow';
import Tags from '../../src/Main/Tags';
import { socket } from '../../src/socket';
import { createMockAppContext } from '../testUtils/mockAppContext';

vi.mock('../../src/socket', () => ({
  socket: { emit: vi.fn() },
}));

vi.mock('../../src/Main/TagRow', () => ({
  default: ({
    tag,
    isEditing,
    onStartEdit,
    onSave,
    onCancel,
    onDelete,
  }: TagRowProps) => (
    <div data-testid={`tag-row-${tag.tagId}`}>
      <span data-testid="tag-name">{tag.name}</span>
      {isEditing ? (
        <>
          <button
            onClick={() =>
              onSave({ ...tag, name: `${tag.name || 'blank'}-edited` })
            }
          >
            Save
          </button>
          <button onClick={onCancel}>Cancel</button>
        </>
      ) : (
        <>
          <button onClick={onStartEdit}>Edit</button>
          <button onClick={() => onDelete(tag.tagId)}>Delete</button>
        </>
      )}
    </div>
  ),
}));

type EmitArgs<E extends keyof ClientToServerEvents> = Parameters<
  ClientToServerEvents[E]
>;

function mockEmitOnce<E extends keyof ClientToServerEvents>(
  event: E,
  handler: (...args: EmitArgs<E>) => void,
) {
  vi.mocked(socket.emit).mockImplementation(((
    e: unknown,
    ...args: unknown[]
  ) => {
    if (e === event) {
      handler(...(args as EmitArgs<E>));
    }
    return socket;
  }) as typeof socket.emit);
}

const tagId1 = '019fe73c-9f72-7398-9c68-76c350046b9f';
const tagId2 = '019fe73c-f003-77a4-b0eb-fd443750c8e1';
const tagId3 = '019fe73d-2b86-756e-b270-9b2689fe6fd5';

const jazz: Tag = {
  tagId: tagId1,
  name: 'jazz',
  description: null,
  color: '#000',
  backgroundColor: '#fff',
};
const pixies: Tag = {
  tagId: tagId2,
  name: 'pixies',
  description: null,
  color: '#000',
  backgroundColor: '#fff',
};
const ramones: Tag = {
  tagId: tagId3,
  name: 'ramones',
  description: null,
  color: '#000',
  backgroundColor: '#fff',
};

const renderWithContext = (tags: Tag[] = [], setTags = vi.fn()) => {
  const value = createMockAppContext({ tags, setTags });
  return render(
    <AppContext.Provider value={value}>
      <Tags />
    </AppContext.Provider>,
  );
};

describe('Tags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders all tags sorted alphabetically', () => {
    renderWithContext([ramones, jazz, pixies]);

    const names = screen
      .getAllByTestId('tag-name')
      .map((element) => element.textContent);

    expect(names).toEqual(['jazz', 'pixies', 'ramones']);
  });

  it('filters tags as the user types', async () => {
    renderWithContext([jazz, pixies]);

    await userEvent.type(screen.getByRole('textbox'), 'jaz');

    expect(screen.getByText('jazz')).toBeInTheDocument();
    expect(screen.queryByText('pixies')).not.toBeInTheDocument();
  });

  it('shows a new blank row in edit mode when "New Tag" is clicked', async () => {
    renderWithContext([]);

    await userEvent.click(screen.getByText('New Tag'));

    expect(screen.getByTestId('tag-row-new')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('closes edit mode when "Cancel" is clicked', async () => {
    renderWithContext([ramones, jazz, pixies]);

    const jazzRow = screen.getByTestId(`tag-row-${jazz.tagId}`);

    await userEvent.click(within(jazzRow).getByText('Edit'));
    await userEvent.click(within(jazzRow).getByText('Cancel'));

    expect(within(jazzRow).getByText('Edit')).toBeInTheDocument();
    expect(within(jazzRow).getByText('Delete')).toBeInTheDocument();
  });

  describe('create flow', () => {
    it('adds the new tag to context on successful create', async () => {
      const tagId = '019fe845-aabc-779e-a031-81e4644fb3e6';
      const setTags = vi.fn();

      mockEmitOnce('tags:create', (payload, callback) => {
        callback({ ok: true, value: { tagId, ...payload } });
      });

      renderWithContext([], setTags);
      await userEvent.click(screen.getByText('New Tag'));
      await userEvent.click(screen.getByText('Save'));

      expect(socket.emit).toHaveBeenCalledWith(
        'tags:create',
        expect.objectContaining({ name: 'blank-edited' }),
        expect.any(Function),
      );
      expect(setTags).toHaveBeenCalledWith([
        expect.objectContaining({ tagId, name: 'blank-edited' }),
      ]);
    });

    it('does not update tags on failed create', async () => {
      const setTags = vi.fn();

      mockEmitOnce('tags:create', (payload, callback) => {
        callback({ ok: false, error: 'boom' });
      });

      renderWithContext([], setTags);
      await userEvent.click(screen.getByText('New Tag'));
      await userEvent.click(screen.getByText('Save'));

      expect(setTags).not.toHaveBeenCalled();
    });
  });

  describe('update flow', () => {
    it('replaces the edited tag on successful update', async () => {
      const setTags = vi.fn();

      mockEmitOnce('tags:update', (payload, callback) => {
        callback({ ok: true, value: payload });
      });

      renderWithContext([jazz, pixies], setTags);

      const jazzRow = screen.getByTestId(`tag-row-${jazz.tagId}`);

      await userEvent.click(within(jazzRow).getByText('Edit'));
      await userEvent.click(within(jazzRow).getByText('Save'));

      expect(socket.emit).toHaveBeenCalledWith(
        'tags:update',
        expect.objectContaining({ tagId: tagId1, name: 'jazz-edited' }),
        expect.any(Function),
      );

      expect(setTags).toHaveBeenCalledWith([
        expect.objectContaining({ tagId: tagId1, name: 'jazz-edited' }),
        pixies,
      ]);
    });

    it('does not update tags on failed update', async () => {
      const setTags = vi.fn();

      mockEmitOnce('tags:update', (payload, callback) => {
        callback({ ok: false, error: 'boom' });
      });

      renderWithContext([jazz], setTags);

      await userEvent.click(screen.getByText('Edit'));
      await userEvent.click(screen.getByText('Save'));

      expect(setTags).not.toHaveBeenCalled();
    });
  });

  describe('delete flow', () => {
    it('removes the tag from context on successful delete', async () => {
      const setTags = vi.fn();

      mockEmitOnce('tags:delete', (payload, callback) => {
        callback({ ok: true });
      });

      renderWithContext([jazz, pixies], setTags);

      const jazzRow = screen.getByTestId(`tag-row-${jazz.tagId}`);
      await userEvent.click(within(jazzRow).getByText('Delete'));

      expect(socket.emit).toHaveBeenCalledWith(
        'tags:delete',
        { tagId: jazz.tagId },
        expect.any(Function),
      );

      expect(setTags).toHaveBeenCalledWith([pixies]);
    });

    it('does not remove the tag on failed delete', async () => {
      const setTags = vi.fn();

      mockEmitOnce('tags:delete', (payload, callback) => {
        callback({ ok: false, error: 'boom' });
      });

      renderWithContext([jazz], setTags);

      await userEvent.click(screen.getByText('Delete'));

      expect(setTags).not.toHaveBeenCalled();
    });

    it('does not show Delete while a row is being edited', async () => {
      renderWithContext([jazz]);

      await userEvent.click(screen.getByText('Edit'));

      expect(
        within(screen.getByTestId(`tag-row-${jazz.tagId}`)).queryByText(
          'Delete',
        ),
      ).not.toBeInTheDocument();
    });
  });
});
