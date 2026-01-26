// Torre API Service Layer
// Using relative path to go through Vite proxy (avoids CORS)
const TORRE_API_BASE = '/api';
const TORRE_SEARCH_BASE = '/search-api';

export interface TorreProfile {
    person: {
        name: string;
        professionalHeadline?: string;
        picture?: string;
        pictureThumbnail?: string;
    };
    strengths: Array<{
        id: string;
        code: number;
        name: string;
        proficiency: string;
        weight: number;
    }>;
    stats: {
        strengths: number;
    };
}

export interface TorreJob {
    id: string;
    objective: string;
    organizations: Array<{
        name: string;
        picture?: string;
    }>;
    strengths: Array<{
        id: string;
        code: number;
        name: string;
        experience?: string;
    }>;
    compensation?: {
        currency: string;
        minAmount?: number;
        maxAmount?: number;
        periodicity?: string;
    };
    remote: boolean;
    locations: string[];
}

export interface JobSearchResult {
    id: string;
    objective: string;
    organizations: Array<{
        name: string;
        picture?: string;
    }>;
    remote: boolean;
    compensation?: {
        currency: string;
        minAmount?: number;
        maxAmount?: number;
    };
    locations: string[];
}

export interface JobSearchResponse {
    results: JobSearchResult[];
    total: number;
}

export async function fetchUserProfile(username: string): Promise<TorreProfile> {
    const response = await fetch(`${TORRE_API_BASE}/genome/bios/${username}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`User "${username}" not found on Torre`);
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return response.json();
}

export async function fetchJobDetails(jobId: string): Promise<TorreJob> {
    const response = await fetch(`${TORRE_API_BASE}/suite/opportunities/${jobId}`);

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error(`Job "${jobId}" not found on Torre`);
        }
        throw new Error(`Failed to fetch job: ${response.statusText}`);
    }

    return response.json();
}

export async function searchJobs(keyword: string, limit: number = 10): Promise<JobSearchResponse> {
    const response = await fetch(
        `${TORRE_SEARCH_BASE}/opportunities/_search?size=${limit}&lang=en`,
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

