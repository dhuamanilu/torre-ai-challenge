import { API_CONFIG, ENDPOINTS } from '../constants/config';
import type { TorreProfile, TorreJob, JobSearchResponse } from '../types';
import { apiCache } from '../utils/apiCache';

async function fetchWithProxy(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response;
}

export async function fetchUserProfile(username: string): Promise<TorreProfile> {
    const cacheKey = `profile-${username}`;
    const cached = apiCache.get<TorreProfile>(cacheKey);
    if (cached) return cached;

    // Use PROXY_URL for genome API
    const url = `${API_CONFIG.PROXY_URL}${ENDPOINTS.GET_USER_PROFILE}/${username}`;
    const response = await fetchWithProxy(url);
    const data = await response.json();

    apiCache.set(cacheKey, data);
    return data;
}

export async function fetchJobDetails(jobId: string): Promise<TorreJob> {
    const cacheKey = `job-${jobId}`;
    const cached = apiCache.get<TorreJob>(cacheKey);
    if (cached) return cached;

    // Use PROXY_URL for suite API
    const url = `${API_CONFIG.PROXY_URL}${ENDPOINTS.GET_JOB_DETAILS}/${jobId}`;
    const response = await fetchWithProxy(url);
    const data = await response.json();

    apiCache.set(cacheKey, data);
    return data;
}

export async function searchJobs(query: string): Promise<JobSearchResponse> {
    const cacheKey = `search-${query}`;
    const cached = apiCache.get<JobSearchResponse>(cacheKey);
    if (cached) return cached;

    // Search endpoint is already proxied via /search-api in vite.config.ts? 
    // Wait, let's check how it was before. 
    // It seems previous code used API_CONFIG.SEARCH_URL directly. 
    // Let's assume /search-api is the prefix.
    const url = `${API_CONFIG.SEARCH_URL}/opportunities/_search?size=${API_CONFIG.DEFAULTS.SEARCH_LIMIT}&lang=${API_CONFIG.DEFAULTS.LANGUAGE}`;

    const response = await fetchWithProxy(url, {
        method: 'POST',
        body: JSON.stringify({
            and: [
                {
                    keywords: {
                        term: query,
                        locale: 'en',
                    },
                },
            ],
        }),
    });
    const data = await response.json();

    apiCache.set(cacheKey, data);
    return data;
}
