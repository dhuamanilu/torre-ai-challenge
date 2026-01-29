import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MagneticButton } from '../../components/common/MagneticButton';

describe('MagneticButton', () => {
    it('renders children correctly', () => {
        render(<MagneticButton>Click Me</MagneticButton>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('handles click events', () => {
        const handleClick = vi.fn();
        render(<MagneticButton onClick={handleClick}>Click Me</MagneticButton>);

        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has motion capabilities', () => {
        const { container } = render(<MagneticButton>Motion</MagneticButton>);
        // Framer motion components render as normal elements but with extra props.
        // We verify it rendered a button.
        expect(container.querySelector('button')).toBeInTheDocument();
    });
});
