import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { err, ok } from 'neverthrow';
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
          backendTagValidationResult={ok(tag)}
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
          backendTagValidationResult={ok(tag)}
        />,
      );

      const badge = screen.getByText('name: pixies');

      expect(badge).toHaveStyle({ color: 'rgb(0, 0, 0)' });
      expect(badge).toHaveStyle({ backgroundColor: 'rgb(255, 255, 255)' });
    });

    it('renders the Edit and Delete buttons', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={false}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onStartEdit when clicking the Edit button', async () => {
      const user = userEvent.setup();
      const onStartEdit = vi.fn();

      render(
        <TagRow
          tag={tag}
          isEditing={false}
          onStartEdit={onStartEdit}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Edit' }));

      expect(onStartEdit).toHaveBeenCalledTimes(1);
    });

    it('calls onStartEdit when clicking the Edit button', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      render(
        <TagRow
          tag={tag}
          isEditing={false}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={onDelete}
          backendTagValidationResult={ok(tag)}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Delete' }));

      expect(onDelete).toHaveBeenCalledTimes(1);
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
          backendTagValidationResult={ok(tag)}
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
          backendTagValidationResult={ok(tag)}
        />,
      );

      expect(screen.getByLabelText('Color')).toHaveValue('#000000');
      expect(screen.getByLabelText('Background color')).toHaveValue('#ffffff');
    });

    it('renders the Save and Cancel buttons', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('calls onSave when clicking the Save button', async () => {
      const user = userEvent.setup();
      const onSave = vi.fn();

      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={onSave}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSave).toHaveBeenCalledWith(tag);
    });

    it('calls onCancel when clicking the Cancel button', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();

      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={onCancel}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('lets the user change name and description', async () => {
      const user = userEvent.setup();

      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      const nameInput = screen.getByLabelText('Name');
      await user.clear(nameInput);
      await user.type(nameInput, 'Sell');

      const descriptionInput = screen.getByLabelText('Description');
      await user.clear(descriptionInput);
      await user.type(descriptionInput, 'Will no longer listen to this');

      expect(nameInput).toHaveValue('Sell');
      expect(descriptionInput).toHaveValue('Will no longer listen to this');
    });

    it('lets the user select color and background color', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      const colorInput = screen.getByLabelText('Color');
      const backgroundColorInput = screen.getByLabelText('Background color');

      fireEvent.change(colorInput, { target: { value: '#123456' } });
      fireEvent.change(backgroundColorInput, { target: { value: '#654321' } });

      expect(colorInput).toHaveValue('#123456');
      expect(backgroundColorInput).toHaveValue('#654321');
    });

    it('shows a frontend validation error when the tag name is missing', () => {
      const emptyNameTag: Tag = { ...tag, name: '' };

      render(
        <TagRow
          tag={emptyNameTag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={ok(tag)}
        />,
      );

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('shows a backend validation error when the tag name is missing', () => {
      render(
        <TagRow
          tag={tag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={err([
            { field: 'name', message: 'Name is required' },
          ])}
        />,
      );

      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    it('shows a single error when frontend and backend fail to validate the same thing', () => {
      const emptyNameTag: Tag = { ...tag, name: '' };

      render(
        <TagRow
          tag={emptyNameTag}
          isEditing={true}
          onStartEdit={() => {}}
          onSave={() => {}}
          onCancel={() => {}}
          onDelete={() => {}}
          backendTagValidationResult={err([
            { field: 'name', message: 'Name is required' },
          ])}
        />,
      );

      expect(screen.getAllByText('Name is required')).toHaveLength(1);
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
          backendTagValidationResult={ok(tag)}
        />,
      );

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });
});
