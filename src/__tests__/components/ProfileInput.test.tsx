import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ProfileInput } from '../../components/features/ProfileInput';

// Mock the AppContext
const mockUseApp = vi.fn();

vi.mock('../../context/AppContext', () => ({
    useApp: () => mockUseApp(),
    AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ProfileInput Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation
        mockUseApp.mockReturnValue({
            username: '',
            loadingProfile: false,
            loading: false,
            setUsername: vi.fn(),
            loadProfile: vi.fn(),
        });
    });

    it('renders ProfileInput component correctly', () => {
        render(<ProfileInput />);

        expect(screen.getByLabelText(/Torre Username/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Load profile/i })).toBeInTheDocument();
    });

    it('updates username input state via context', () => {
        const setUsernameMock = vi.fn();
        mockUseApp.mockReturnValue({
            ...mockUseApp(),
            setUsername: setUsernameMock,
        });

        render(<ProfileInput />);

        const input = screen.getByLabelText(/Torre Username/i);
        fireEvent.change(input, { target: { value: 'torreuser' } });

        expect(setUsernameMock).toHaveBeenCalledWith('torreuser');
    });
});
