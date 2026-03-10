/**
 * ============================================================================
 * MODAL (DIALOG) COMPONENT TESTS
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '../ui/dialog';
import userEvent from '@testing-library/user-event';

describe('Modal (Dialog) Component', () => {
  it('renders trigger button', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent>Modal Content</DialogContent>
      </Dialog>
    );
    
    expect(screen.getByText('Open Modal')).toBeInTheDocument();
  });

  it('opens modal when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal Title</DialogTitle>
          <DialogDescription>Modal Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open Modal'));
    
    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
      expect(screen.getByText('Modal Description')).toBeInTheDocument();
    });
  });

  it('closes modal when close button is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Modal</DialogTrigger>
        <DialogContent>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open Modal'));
    
    await waitFor(() => {
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
  });

  it('renders modal with header, content, and footer', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Title</DialogTitle>
            <DialogDescription>Description</DialogDescription>
          </DialogHeader>
          <div>Main Content</div>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Main Content')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Confirm')).toBeInTheDocument();
    });
  });

  it('hides close button when showCloseButton is false', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent showCloseButton={false}>
          <DialogTitle>No Close Button</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('No Close Button')).toBeInTheDocument();
    });
    
    const closeButtons = screen.queryAllByRole('button', { name: /close/i });
    expect(closeButtons.length).toBe(0);
  });

  it('calls onOpenChange when modal state changes', async () => {
    const onOpenChange = vi.fn();
    
    render(
      <Dialog onOpenChange={onOpenChange}>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  it('renders with custom className', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent className="custom-modal-class">
          <DialogTitle>Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      const content = screen.getByText('Title').closest('[data-slot="dialog-content"]');
      expect(content).toHaveClass('custom-modal-class');
    });
  });

  it('renders controlled dialog with open prop', async () => {
    const { rerender } = render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Controlled Modal</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.queryByText('Controlled Modal')).not.toBeInTheDocument();
    
    rerender(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Controlled Modal</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Controlled Modal')).toBeInTheDocument();
    });
  });

  it('has correct data-slot attributes', async () => {
    render(
      <Dialog>
        <DialogTrigger data-testid="trigger">Open</DialogTrigger>
        <DialogContent data-testid="content">
          <DialogHeader data-testid="header">
            <DialogTitle data-testid="title">Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'dialog-trigger');
    
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'dialog-content');
      expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'dialog-header');
      expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'dialog-title');
    });
  });

  it('renders DialogClose component', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogClose asChild>
            <button>Custom Close</button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
    
    fireEvent.click(screen.getByText('Open'));
    
    await waitFor(() => {
      expect(screen.getByText('Custom Close')).toBeInTheDocument();
    });
  });
});
