import { useState, useCallback } from 'react';
import { searchJobs } from '../services/torreApi';
import type { JobSearchResult } from '../types';

export function useJobSearch() {
    const [jobSearch, setJobSearch] = useState('');
    const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
    const [selectedJobs, setSelectedJobs] = useState<JobSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [error, setJobError] = useState<string | null>(null);

    const handleSearch = useCallback(async (queryOverride?: string) => {
        const queryToUse = queryOverride !== undefined ? queryOverride : jobSearch;

        if (!queryToUse.trim()) {
            setJobError('Please enter a job search term');
            return;
        }

        setSearching(true);
        setJobError(null);
        setSearchResults([]);

        try {
            const results = await searchJobs(queryToUse.trim());
            setSearchResults(results.results);
            if (results.results.length === 0) {
                setJobError('No jobs found. Try a different search term.');
            }
        } catch (err) {
            setJobError(err instanceof Error ? err.message : 'Failed to search jobs');
        } finally {
            setSearching(false);
        }
    }, [jobSearch]);

    const selectJob = useCallback((job: JobSearchResult) => {
        setSelectedJobs(prev => {
            if (prev.some(j => j.id === job.id)) {
                return prev.filter(j => j.id !== job.id);
            }
            // Limit removed per user request (was < 3)
            return [...prev, job];
        });
    }, []);

    const clearSelectedJobs = useCallback(() => {
        setSelectedJobs([]);
    }, []);

    return {
        jobSearch,
        setJobSearch,
        searchResults,
        selectedJobs,
        searching,
        jobError: error,
        setJobError,
        handleSearch,
        selectJob,
        clearSelectedJobs,
    };
}
