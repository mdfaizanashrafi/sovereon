/**
 * ============================================================================
 * INPUT COMPONENT TESTS
 * ============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../ui/input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles text input correctly', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    
    fireEvent.change(input, { target: { value: 'Hello World' } });
    expect(input).toHaveValue('Hello World');
  });

  it('handles different input types', () => {
    const { rerender } = render(<Input type="text" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');

    rerender(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

    rerender(<Input type="number" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('is not disabled by default', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).not.toBeDisabled();
  });

  it('has correct data-slot attribute', () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'input');
  });

  it('applies custom className', () => {
    render(<Input data-testid="input" className="custom-input-class" />);
    expect(screen.getByTestId('input')).toHaveClass('custom-input-class');
  });

  it('handles focus and blur events', () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    
    render(<Input data-testid="input" onFocus={onFocus} onBlur={onBlur} />);
    const input = screen.getByTestId('input');
    
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard events', () => {
    const onKeyDown = vi.fn();
    render(<Input data-testid="input" onKeyDown={onKeyDown} />);
    
    fireEvent.keyDown(screen.getByTestId('input'), { key: 'Enter' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it('forwards ref correctly', () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={(el) => { ref.current = el; }} data-testid="input" />);
    expect(screen.getByTestId('input')).toBe(ref.current);
  });

  it('renders with aria-invalid for invalid state', () => {
    render(<Input aria-invalid="true" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('aria-invalid', 'true');
  });

  it('handles required attribute', () => {
    render(<Input required data-testid="input" />);
    expect(screen.getByTestId('input')).toBeRequired();
  });

  it('handles readOnly attribute', () => {
    render(<Input readOnly data-testid="input" value="readonly value" />);
    expect(screen.getByTestId('input')).toHaveAttribute('readonly');
  });

  it('handles name attribute correctly', () => {
    render(<Input name="username" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('name', 'username');
  });

  it('handles id attribute correctly', () => {
    render(<Input id="user-input" data-testid="input" />);
    expect(screen.getByTestId('input')).toHaveAttribute('id', 'user-input');
  });
});
