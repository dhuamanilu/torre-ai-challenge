import { useState, useCallback } from 'react';
import { fetchUserProfile } from '../services/torreApi';
import type { TorreProfile } from '../types';

export function useTorreProfile() {
    const [username, setUsername] = useState('');
    const [profile, setProfile] = useState<TorreProfile | null>(null);
    const [profilePreview, setProfilePreview] = useState<TorreProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [error, setProfileError] = useState<string | null>(null);

    const loadProfile = useCallback(async (explicitUsername?: string) => {
        const userToLoad = explicitUsername || username;
        if (!userToLoad.trim()) {
            setProfileError('Please enter your Torre username');
            return;
        }

        setLoadingProfile(true);
        setProfileError(null);

        try {
            const profileData = await fetchUserProfile(userToLoad.trim());
            // Important: We set BOTH profile (actual) and preview (for consistency/fallback)
            // The original logic only setPreview, but V2 Graph uses 'profile'.
            // Let's standardise on setting 'profile'.
            setProfile(profileData);
            setProfilePreview(profileData);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
            throw err; // Re-throw so UI knows it failed
        } finally {
            setLoadingProfile(false);
        }
    }, [username]);

    return {
        username,
        setUsername,
        profile,
        setProfile,
        profilePreview,
        loadingProfile,
        profileError: error,
        setProfileError, // Exposed to allow clearing error from context
        loadProfile,
    };
}
