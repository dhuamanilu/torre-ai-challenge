import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { JobSearch } from '../../components/features/JobSearch';

// Mock the AppContext
const mockUseApp = vi.fn();

vi.mock('../../context/AppContext', () => ({
    useApp: () => mockUseApp(),
    AppProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('JobSearch Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default mock implementation
        mockUseApp.mockReturnValue({
            jobSearch: '',
            searchResults: [],
            selectedJobs: [],
            searching: false,
            handleSearch: vi.fn(),
            setJobSearch: vi.fn(),
            selectJob: vi.fn(),
        });
    });

    it('renders JobSearch component correctly', () => {
        render(<JobSearch />);

        expect(screen.getByText('Search Jobs')).toBeInTheDocument();
        // The button has aria-label="Search jobs"
        expect(screen.getByTestId('search-button')).toBeInTheDocument();
    });

    it('displays search results when they exist', () => {
        mockUseApp.mockReturnValue({
            ...mockUseApp(),
            searchResults: [
                { id: '1', objective: 'React Dev', organizations: [{ name: 'Torre' }], compensation: {} }
            ],
            selectedJobs: [],
        });

        render(<JobSearch />);

        expect(screen.getByText('React Dev')).toBeInTheDocument();
        expect(screen.getByText('Torre')).toBeInTheDocument();
    });
});
