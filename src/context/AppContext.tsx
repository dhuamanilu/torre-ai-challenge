import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { TorreProfile, JobSearchResult, JobComparison } from '../types';
import { useTorreProfile } from '../hooks/useTorreProfile';
import { useJobSearch } from '../hooks/useJobSearch';
import { useSkillAnalysis } from '../hooks/useSkillAnalysis';

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

interface AppContextType {
    // Profile
    username: string;
    setUsername: (value: string) => void;
    profile: TorreProfile | null;
    profilePreview: TorreProfile | null;
    loadingProfile: boolean;
    loadProfile: (username?: string) => Promise<void>;

    // Job Search
    jobSearch: string;
    setJobSearch: (value: string) => void;
    searchResults: JobSearchResult[];
    selectedJobs: JobSearchResult[];
    searching: boolean;
    handleSearch: () => Promise<void>;
    selectJob: (job: JobSearchResult) => void;
    clearSelectedJobs: () => void;

    // Analysis
    comparisons: JobComparison[];
    activeComparison: number;
    setActiveComparison: (index: number) => void;
    loading: boolean;
    analyze: () => Promise<void>;

    // UI
    error: string;
    clearError: () => void;
    showLearning: string | null;
    setShowLearning: (skillName: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    // UI Local State
    const [showLearning, setShowLearning] = useState<string | null>(null);
    const [globalError, setGlobalError] = useState('');

    // Custom Hooks
    const profileHook = useTorreProfile();
    const jobSearchHook = useJobSearch();
    const analysisHook = useSkillAnalysis();

    // Sync errors
    useEffect(() => {
        if (profileHook.profileError) setGlobalError(profileHook.profileError);
        else if (jobSearchHook.jobError) setGlobalError(jobSearchHook.jobError);
        else if (analysisHook.analysisError) setGlobalError(analysisHook.analysisError);
        else setGlobalError('');
    }, [profileHook.profileError, jobSearchHook.jobError, analysisHook.analysisError]);

    const clearError = () => {
        setGlobalError('');
        profileHook.setProfileError(null);
        jobSearchHook.setJobError(null);
        analysisHook.setAnalysisError(null);
    };

    const handleAnalyze = async () => {
        const freshProfile = await analysisHook.analyze(profileHook.username, jobSearchHook.selectedJobs);
        if (freshProfile) {
            profileHook.setProfile(freshProfile);
        }
    };

    const value: AppContextType = {
        // Profile
        username: profileHook.username,
        setUsername: profileHook.setUsername,
        profile: profileHook.profile,
        profilePreview: profileHook.profilePreview,
        loadingProfile: profileHook.loadingProfile,
        loadProfile: profileHook.loadProfile,

        // Job Search
        jobSearch: jobSearchHook.jobSearch,
        setJobSearch: jobSearchHook.setJobSearch,
        searchResults: jobSearchHook.searchResults,
        selectedJobs: jobSearchHook.selectedJobs,
        searching: jobSearchHook.searching,
        handleSearch: jobSearchHook.handleSearch,
        selectJob: jobSearchHook.selectJob,
        clearSelectedJobs: jobSearchHook.clearSelectedJobs,

        // Analysis
        comparisons: analysisHook.comparisons,
        activeComparison: analysisHook.activeComparison,
        setActiveComparison: analysisHook.setActiveComparison,
        loading: analysisHook.loading,
        analyze: handleAnalyze,

        // UI
        error: globalError,
        clearError,
        showLearning,
        setShowLearning,
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
