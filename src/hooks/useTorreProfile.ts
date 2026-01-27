import { useState, useCallback } from 'react';
import { fetchUserProfile } from '../services/torreApi';
import type { TorreProfile } from '../types';

export function useTorreProfile() {
    const [username, setUsername] = useState('');
    const [profile, setProfile] = useState<TorreProfile | null>(null);
    const [profilePreview, setProfilePreview] = useState<TorreProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [error, setProfileError] = useState<string | null>(null);

    const loadProfile = useCallback(async () => {
        if (!username.trim()) {
            setProfileError('Please enter your Torre username');
            return;
        }

        setLoadingProfile(true);
        setProfileError(null);

        try {
            const profileData = await fetchUserProfile(username.trim());
            setProfilePreview(profileData);
        } catch (err) {
            setProfileError(err instanceof Error ? err.message : 'Failed to load profile');
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
