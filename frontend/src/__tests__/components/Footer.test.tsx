/**
 * Tests for Footer component
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '../../components/Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('displays company name', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.textContent).toContain('Meridian');
  });

  it('has correct HTML structure', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
