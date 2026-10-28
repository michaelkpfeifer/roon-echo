import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Modal from '../../src/Components/Modal';

describe('Modal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Test Modal Content</p>
      </Modal>,
    );

    expect(screen.getByText('Test Modal Content')).toBeInTheDocument();
  });

  it('has the dialog ARIA attribute', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Test Modal Content</p>
      </Modal>,
    );

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('calls onClose when the close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Test Modal Content</p>
      </Modal>,
    );
    const closeButton = screen.getByRole('button', { name: /×/i });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking the backdrop overlay', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal Content</p>
      </Modal>,
    );

    const overlay = screen.getByTestId('modal-overlay');
    expect(overlay).toBeInTheDocument();
    await user.click(overlay);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when clicking inside the modal content', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal Content</p>
      </Modal>,
    );

    const contentText = screen.getByText('Modal Content');
    await user.click(contentText);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the Escape key is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal Content</p>
      </Modal>,
    );
    await user.keyboard('{Escape}');

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when a key other than Escape is pressed', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Modal Content</p>
      </Modal>,
    );

    await user.keyboard('{Enter}');

    expect(handleClose).not.toHaveBeenCalled();
  });
});
