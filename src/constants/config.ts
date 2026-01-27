export const API_CONFIG = {
    BASE_URL: 'https://torre.bio/api', // Original URL for reference
    PROXY_URL: '/api', // Vite proxy prefix
    SEARCH_URL: '/search-api', // Vite proxy prefix for search
    DEFAULTS: {
        SEARCH_LIMIT: 10,
        LANGUAGE: 'en',
    },
};

export const ENDPOINTS = {
    GET_USER_PROFILE: '/genome/bios',
    GET_JOB_DETAILS: '/suite/opportunities',
    SEARCH_JOBS: '/search-api/opportunities/_search',
};

export const SCORING_CONFIG = {
    BONUS_CAP: 0.2, // Max 20% bonus
    PARTIAL_MATCH_FACTOR: 0.5,
    WEIGHT_DIVISOR: 100,
};

export const VISUALIZATION_CONFIG = {
    RADAR: {
        WIDTH: 280,
        HEIGHT: 280,
        RADIUS_OFFSET: 20,
        LEVEL_STEP: 20, // 100/5 levels
        LABEL_OFFSET: 15,
        DOT_RADIUS: 4,
    },
    SCORE_CIRCLE: {
        RADIUS: 45,
        CIRCUMFERENCE: 283, // 2 * PI * 45
    }
};

export const SKILL_LEVELS = {
    PROFICIENCY: {
        'master': 5,
        'expert': 4,
        'proficient': 3,
        'novice': 2,
        'no-experience-interested': 1,
    } as Record<string, number>,
    EXPERIENCE: {
        '5-plus-years': 5,
        '3-5-years': 4,
        '1-3-years': 3,
        'potential-to-develop': 2,
    } as Record<string, number>,
};
