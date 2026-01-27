import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { TorreProfile, JobSearchResult, JobComparison } from '../types';
import { fetchUserProfile, fetchJobDetails, searchJobs } from '../services/torreApi';
import { compareSkills } from '../utils/skillMatcher';

interface AppState {
    // Profile state
    username: string;
    profile: TorreProfile | null;
    profilePreview: TorreProfile | null;
    loadingProfile: boolean;

    // Job search state
    jobSearch: string;
    searchResults: JobSearchResult[];
    selectedJobs: JobSearchResult[];
    searching: boolean;

    // Analysis state
    comparisons: JobComparison[];
    activeComparison: number;
    loading: boolean;

    // UI state
    error: string;
    showLearning: string | null;
}

interface AppContextType extends AppState {
    setUsername: (value: string) => void;
    setJobSearch: (value: string) => void;
    setActiveComparison: (index: number) => void;
    setShowLearning: (skillName: string | null) => void;
    loadProfile: () => Promise<void>;
    handleSearch: () => Promise<void>;
    selectJob: (job: JobSearchResult) => void;
    analyze: () => Promise<void>;
    clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [username, setUsername] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [selectedJobs, setSelectedJobs] = useState<JobSearchResult[]>([]);
    const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
    const [profile, setProfile] = useState<TorreProfile | null>(null);
    const [profilePreview, setProfilePreview] = useState<TorreProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [comparisons, setComparisons] = useState<JobComparison[]>([]);
    const [activeComparison, setActiveComparison] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [showLearning, setShowLearning] = useState<string | null>(null);

    const clearError = useCallback(() => setError(''), []);

    const loadProfile = useCallback(async () => {
        if (!username.trim()) {
            setError('Please enter your Torre username');
            return;
        }
        setLoadingProfile(true);
        setError('');
        try {
            const profileData = await fetchUserProfile(username.trim());
            setProfilePreview(profileData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setLoadingProfile(false);
        }
    }, [username]);

    const handleSearch = useCallback(async () => {
        if (!jobSearch.trim()) {
            setError('Please enter a job search term');
            return;
        }
        setSearching(true);
        setError('');
        setSearchResults([]);
        try {
            const results = await searchJobs(jobSearch.trim());
            setSearchResults(results.results);
            if (results.results.length === 0) {
                setError('No jobs found. Try a different search term.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search jobs');
        } finally {
            setSearching(false);
        }
    }, [jobSearch]);

    const selectJob = useCallback((job: JobSearchResult) => {
        setSelectedJobs(prev => {
            if (prev.some(j => j.id === job.id)) {
                return prev.filter(j => j.id !== job.id);
            }
            if (prev.length < 3) {
                return [...prev, job];
            }
            return prev;
        });
    }, []);

    const analyze = useCallback(async () => {
        if (!username.trim()) {
            setError('Please enter your Torre username');
            return;
        }
        if (selectedJobs.length === 0) {
            setError('Please select at least one job');
            return;
        }
        setLoading(true);
        setError('');
        setComparisons([]);
        try {
            const profileData = await fetchUserProfile(username.trim());
            setProfile(profileData);
            const jobPromises = selectedJobs.map(j => fetchJobDetails(j.id));
            const jobs = await Promise.all(jobPromises);
            const newComparisons: JobComparison[] = jobs.map(job => ({
                job,
                result: compareSkills(profileData, job),
            }));
            newComparisons.sort((a, b) => b.result.weightedScore - a.result.weightedScore);
            setComparisons(newComparisons);
            setActiveComparison(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    }, [username, selectedJobs]);

    const value: AppContextType = {
        username,
        profile,
        profilePreview,
        loadingProfile,
        jobSearch,
        searchResults,
        selectedJobs,
        searching,
        comparisons,
        activeComparison,
        loading,
        error,
        showLearning,
        setUsername,
        setJobSearch,
        setActiveComparison,
        setShowLearning,
        loadProfile,
        handleSearch,
        selectJob,
        analyze,
        clearError,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
