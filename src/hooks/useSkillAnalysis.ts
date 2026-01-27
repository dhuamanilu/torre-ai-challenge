import { useState, useCallback } from 'react';
import { fetchJobDetails, fetchUserProfile } from '../services/torreApi';
import { compareSkills } from '../utils/skillMatcher';
import type { JobComparison, JobSearchResult } from '../types';

export function useSkillAnalysis() {
    const [comparisons, setComparisons] = useState<JobComparison[]>([]);
    const [activeComparison, setActiveComparison] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setAnalysisError] = useState<string | null>(null);

    const analyze = useCallback(async (username: string, selectedJobs: JobSearchResult[]) => {
        if (!username.trim()) {
            setAnalysisError('Please enter your Torre username');
            return;
        }
        if (selectedJobs.length === 0) {
            setAnalysisError('Please select at least one job');
            return;
        }

        setLoading(true);
        setAnalysisError(null);
        setComparisons([]);

        try {
            // Re-fetch profile to ensure latest data is used for analysis
            const profileData = await fetchUserProfile(username.trim());

            const jobPromises = selectedJobs.map(j => fetchJobDetails(j.id));
            const jobs = await Promise.all(jobPromises);

            const newComparisons: JobComparison[] = jobs.map(job => ({
                job,
                result: compareSkills(profileData, job),
            }));

            // Sort by score (highest first)
            newComparisons.sort((a, b) => b.result.weightedScore - a.result.weightedScore);

            setComparisons(newComparisons);
            setActiveComparison(0);

            // Return profile data so it can be updated in the main state if needed
            return profileData;

        } catch (err) {
            setAnalysisError(err instanceof Error ? err.message : 'An error occurred during analysis');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        comparisons,
        activeComparison,
        setActiveComparison,
        loading,
        analysisError: error,
        setAnalysisError,
        analyze,
    };
}
