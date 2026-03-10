/**
 * ============================================================================
 * CONTACT PAGE TESTS
 * ============================================================================
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactPage } from '../ContactPage';
import { MemoryRouter } from 'react-router-dom';

// Mock fetch
global.fetch = vi.fn();
const mockFetch = vi.mocked(fetch);

// Mock SEO component
vi.mock('@/components/SEO', () => ({
  SEO: ({ title }: { title: string }) => <div data-testid="seo" data-title={title} />,
  buildLocalBusinessSchema: () => ({ '@type': 'LocalBusiness' }),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('ContactPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderWithRouter(<ContactPage />);
    expect(screen.getByText(/Let's Talk/i)).toBeInTheDocument();
  });

  it('renders SEO with correct title', () => {
    renderWithRouter(<ContactPage />);
    const seo = screen.getByTestId('seo');
    expect(seo).toHaveAttribute('data-title', 'Contact Us');
  });

  it('displays page header with badge', () => {
    renderWithRouter(<ContactPage />);
    
    expect(screen.getByText('Start a Conversation')).toBeInTheDocument();
    expect(screen.getByText(/Let's Talk/i)).toBeInTheDocument();
  });

  it('renders contact info cards', () => {
    renderWithRouter(<ContactPage />);
    
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
    expect(screen.getByText('Hours')).toBeInTheDocument();
  });

  it('renders contact form', () => {
    renderWithRouter(<ContactPage />);
    
    expect(screen.getByText('Send a Message')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toBeInTheDocument();
  });

  it('renders honeypot field hidden', () => {
    const { container } = renderWithRouter(<ContactPage />);
    
    const honeypotLabel = container.querySelector('label[for="company_website"]');
    expect(honeypotLabel?.parentElement).toHaveStyle({ display: 'none' });
  });

  it('updates form state on input change', async () => {
    renderWithRouter(<ContactPage />);
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'John Doe');
    
    expect(nameInput).toHaveValue('John Doe');
  });

  it('updates email input', async () => {
    renderWithRouter(<ContactPage />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'john@example.com');
    
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('updates phone input', async () => {
    renderWithRouter(<ContactPage />);
    
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '1234567890');
    
    expect(phoneInput).toHaveValue('1234567890');
  });

  it('updates company input', async () => {
    renderWithRouter(<ContactPage />);
    
    const companyInput = screen.getByLabelText(/Company Name/i);
    await userEvent.clear(companyInput);
    await userEvent.type(companyInput, 'Acme Inc');
    
    expect(companyInput).toHaveValue('Acme Inc');
  });

  it('updates message textarea', async () => {
    renderWithRouter(<ContactPage />);
    
    const messageInput = screen.getByLabelText(/Message/i);
    await userEvent.clear(messageInput);
    await userEvent.type(messageInput, 'This is a test message');
    
    expect(messageInput).toHaveValue('This is a test message');
  });

  it('has service interest select field', () => {
    renderWithRouter(<ContactPage />);
    
    // Look for the select trigger button instead of label
    expect(screen.getByText(/Service Interest/i)).toBeInTheDocument();
  });

  it('submits form successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    renderWithRouter(<ContactPage />);
    
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Test message');
    
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/contact'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('shows loading state during submission', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // Never resolves

    renderWithRouter(<ContactPage />);
    
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Test message');
    
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Sending/i)).toBeInTheDocument();
    });
  });

  it('shows success message after submission', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    } as Response);

    renderWithRouter(<ContactPage />);
    
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Test message');
    
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Message Sent')).toBeInTheDocument();
    });
  });

  it('renders map iframe', () => {
    renderWithRouter(<ContactPage />);
    
    const mapIframe = screen.getByTitle(/Sovereon Inc. Office Location/i);
    expect(mapIframe).toBeInTheDocument();
    expect(mapIframe).toHaveAttribute('src');
    expect(mapIframe).toHaveAttribute('loading', 'lazy');
  });

  it('renders social media links', () => {
    renderWithRouter(<ContactPage />);
    
    expect(screen.getByText(/@sovereoninc/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Sovereon Inc./i).length).toBeGreaterThan(0);
  });

  it('has tel: link for phone number', () => {
    renderWithRouter(<ContactPage />);
    
    const phoneLink = screen.getByRole('link', { name: /7004095896/i });
    expect(phoneLink).toHaveAttribute('href', expect.stringContaining('tel:'));
  });

  it('has mailto: link for email', () => {
    renderWithRouter(<ContactPage />);
    
    const emailLink = screen.getByRole('link', { name: /sovereon@sovereon.online/i });
    expect(emailLink).toHaveAttribute('href', expect.stringContaining('mailto:'));
  });

  it('has required fields marked', () => {
    renderWithRouter(<ContactPage />);
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const messageInput = screen.getByLabelText(/Message/i);
    
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(messageInput).toBeRequired();
  });

  it('has correct email input type', () => {
    renderWithRouter(<ContactPage />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('has correct phone input type', () => {
    renderWithRouter(<ContactPage />);
    
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    expect(phoneInput).toHaveAttribute('type', 'tel');
  });

  it('handles form submission error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    renderWithRouter(<ContactPage />);
    
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Test message');
    
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    
    // Wait for the submission to complete and check that isSubmitting becomes false
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Message/i })).not.toBeDisabled();
    });
    
    consoleSpy.mockRestore();
  });

  it('handles network error during submission', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<ContactPage />);
    
    await userEvent.type(screen.getByLabelText(/Full Name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/Email Address/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/Message/i), 'Test message');
    
    const submitButton = screen.getByRole('button', { name: /Send Message/i });
    fireEvent.click(submitButton);
    
    // Wait for the submission to complete and check that isSubmitting becomes false
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Send Message/i })).not.toBeDisabled();
    });
    
    consoleSpy.mockRestore();
  });

  it('honeypot field has negative tabIndex', () => {
    const { container } = renderWithRouter(<ContactPage />);
    
    const honeypotInput = container.querySelector('#company_website') as HTMLInputElement;
    expect(honeypotInput).toHaveAttribute('tabIndex', '-1');
  });

  it('honeypot field has autocomplete off', () => {
    const { container } = renderWithRouter(<ContactPage />);
    
    const honeypotInput = container.querySelector('#company_website') as HTMLInputElement;
    expect(honeypotInput).toHaveAttribute('autocomplete', 'off');
  });

  it('has responsive container classes', () => {
    const { container } = renderWithRouter(<ContactPage />);
    
    const containerDiv = container.querySelector('.container');
    expect(containerDiv).toBeInTheDocument();
  });
});
