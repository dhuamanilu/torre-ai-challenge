// Torre API Service Layer
import { API_CONFIG } from '../constants/config';
import type { TorreProfile, TorreJob, JobSearchResponse } from '../types';

export async function fetchUserProfile(username: string): Promise<TorreProfile> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/genome/bios/${username}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`User "${username}" not found on Torre`);
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return response.json();
}

export async function fetchJobDetails(jobId: string): Promise<TorreJob> {
    const response = await fetch(`${API_CONFIG.BASE_URL}/suite/opportunities/${jobId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Job "${jobId}" not found on Torre`);
        }
        throw new Error(`Failed to fetch job: ${response.statusText}`);
    }

    return response.json();
}

export async function searchJobs(keyword: string, limit: number = API_CONFIG.DEFAULTS.SEARCH_LIMIT): Promise<JobSearchResponse> {
    const response = await fetch(
        `${API_CONFIG.SEARCH_URL}/opportunities/_search?size=${limit}&lang=${API_CONFIG.DEFAULTS.LANGUAGE}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                and: [
                    {
                        keywords: {
                            term: keyword,
                            locale: 'en',
                        },
                    },
                    {
                        status: {
                            code: 'open',
                        },
                    },
                ],
            }),
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to search jobs: ${response.statusText}`);
    }

    const data = await response.json();
    return {
        results: data.results || [],
        total: data.total || 0,
    };
}

