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
        proficiency?: string;
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

export interface SkillMatch {
    name: string;
    status: 'matched' | 'partial' | 'missing';
    userProficiency?: string;
    requiredExperience?: string;
    weight?: number;
    recommendations?: number;
}

export interface MatchResult {
    matched: SkillMatch[];
    partial: SkillMatch[];
    missing: SkillMatch[];
    score: number;
    weightedScore: number;
    totalRequired: number;
}

export interface JobComparison {
    job: TorreJob;
    result: MatchResult;
}

export interface LearningResource {
    name: string;
    url: string;
    platform: string;
    type: 'course' | 'documentation' | 'tutorial';
}
