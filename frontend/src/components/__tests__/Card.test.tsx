/**
 * ============================================================================
 * CARD COMPONENT TESTS
 * ============================================================================
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../ui/card';

describe('Card Component', () => {
  it('renders Card with content', () => {
    render(
      <Card data-testid="card">
        <CardContent>Card Content</CardContent>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies custom className to Card', () => {
    render(<Card data-testid="card" className="custom-class">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('renders Card with header, title, and description', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
  });

  it('renders Card with action', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
          <CardAction>
            <button>Action</button>
          </CardAction>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders Card with footer', () => {
    render(
      <Card>
        <CardContent>Content</CardContent>
        <CardFooter data-testid="card-footer">Footer Content</CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('card-footer')).toBeInTheDocument();
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('renders complete Card with all subcomponents', () => {
    render(
      <Card data-testid="complete-card">
        <CardHeader>
          <CardTitle>Complete Card</CardTitle>
          <CardDescription>A full card example</CardDescription>
        </CardHeader>
        <CardContent>Main content goes here</CardContent>
        <CardFooter>Footer actions</CardFooter>
      </Card>
    );
    
    expect(screen.getByTestId('complete-card')).toBeInTheDocument();
    expect(screen.getByText('Complete Card')).toBeInTheDocument();
    expect(screen.getByText('A full card example')).toBeInTheDocument();
    expect(screen.getByText('Main content goes here')).toBeInTheDocument();
    expect(screen.getByText('Footer actions')).toBeInTheDocument();
  });

  it('has correct data-slot attributes', () => {
    render(
      <Card data-testid="card">
        <CardHeader data-testid="header">
          <CardTitle data-testid="title">Title</CardTitle>
        </CardHeader>
      </Card>
    );
    
    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card');
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header');
    expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title');
  });

  it('forwards refs correctly', () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Card ref={(el) => { ref.current = el; }} data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toBe(ref.current);
  });

  it('handles click events on Card', () => {
    const handleClick = vi.fn();
    render(
      <Card data-testid="card" onClick={handleClick}>
        <CardContent>Clickable Card</CardContent>
      </Card>
    );
    
    screen.getByTestId('card').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
