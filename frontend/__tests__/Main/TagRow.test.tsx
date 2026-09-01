import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Tag } from '../../../shared/internal/tag';
import TagRow from '../../src/Main/TagRow';

describe('TagRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('view mode', () => {
    const tag: Tag = {
      tagId: '019e03d4-e449-702e-a9bd-5e8612f4cb80',
      name: 'name: pixies',
      description: 'description: Pixies',
      color: '#000000',
      backgroundColor: '#ffffff',
    };

    it('renders tag name and description', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={false}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
        />,
      );

      expect(screen.getByText('name: pixies')).toBeInTheDocument();
      expect(screen.getByText('description: Pixies')).toBeInTheDocument();
    });

    it('renders the tag badge with the correct colors', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={false}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
        />,
      );

      const badge = screen.getByText('name: pixies');

      expect(badge).toHaveStyle({ color: 'rgb(0, 0, 0)' });
      expect(badge).toHaveStyle({ backgroundColor: 'rgb(255, 255, 255)' });
    });
  });

  describe('edit mode', () => {
    const tag: Tag = {
      tagId: '019e03d4-e449-702e-a9bd-5e8612f4cb80',
      name: 'name: pixies',
      description: 'description: Pixies',
      color: '#000000',
      backgroundColor: '#ffffff',
    };

    it('renders an existing tag row in edit mode with pre-filled values', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
        'name: pixies',
      );
      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
        'description: Pixies',
      );
    });

    it('renders the color inputs in edit mode with pre-filled values', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
        />,
      );

      expect(screen.getByLabelText('Color')).toHaveValue('#000000');
      expect(screen.getByLabelText('Background color')).toHaveValue('#ffffff');
    });

    it('shows a placeholder with the validation error when the name is missing', () => {
      const emptyNameTag: Tag = { ...tag, name: '' };

      render(
        <TagRow
          tag={emptyNameTag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
        />,
      );

      expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute(
        'placeholder',
        'Name is required',
      );
    });

    it('disables Save when the name is missing', () => {
      const emptyNameTag: Tag = { ...tag, name: '' };

      render(
        <TagRow
          tag={emptyNameTag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
        />,
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });
});
