import { describe, it, expect } from 'vitest';
import { compareSkills, MatchResult } from '../utils/skillMatcher';
import type { TorreProfile, TorreJob } from '../services/torreApi';

// Mock profile data
const createMockProfile = (skills: Array<{ name: string; proficiency: string }>): TorreProfile => ({
    person: {
        name: 'Test User',
        professionalHeadline: 'Software Developer',
    },
    strengths: skills.map((skill, index) => ({
        id: `skill-${index}`,
        code: index,
        name: skill.name,
        proficiency: skill.proficiency,
        weight: 1,
    })),
    stats: {
        strengths: skills.length,
    },
});

// Mock job data
const createMockJob = (skills: Array<{ name: string; experience?: string }>): TorreJob => ({
    id: 'test-job',
    objective: 'Test Job',
    organizations: [{ name: 'Test Company' }],
    strengths: skills.map((skill, index) => ({
        id: `req-${index}`,
        code: index,
        name: skill.name,
        experience: skill.experience,
    })),
    remote: true,
    locations: ['Remote'],
});

describe('compareSkills', () => {
    it('should return 100% match when user has all required skills at or above required level', () => {
        const profile = createMockProfile([
            { name: 'JavaScript', proficiency: 'expert' },
            { name: 'React', proficiency: 'proficient' },
        ]);
        const job = createMockJob([
            { name: 'JavaScript', experience: '1-3-years' },
            { name: 'React', experience: '1-3-years' },
        ]);

        const result = compareSkills(profile, job);

        expect(result.score).toBe(100);
        expect(result.matched.length).toBe(2);
        expect(result.partial.length).toBe(0);
        expect(result.missing.length).toBe(0);
    });

    it('should correctly identify missing skills', () => {
        const profile = createMockProfile([
            { name: 'JavaScript', proficiency: 'expert' },
        ]);
        const job = createMockJob([
            { name: 'JavaScript', experience: '1-3-years' },
            { name: 'TypeScript', experience: '1-3-years' },
            { name: 'React', experience: '1-3-years' },
        ]);

        const result = compareSkills(profile, job);

        expect(result.matched.length).toBe(1);
        expect(result.missing.length).toBe(2);
        expect(result.missing.map(s => s.name)).toContain('TypeScript');
        expect(result.missing.map(s => s.name)).toContain('React');
    });

    it('should identify partial matches when user proficiency is lower than required', () => {
        const profile = createMockProfile([
            { name: 'Python', proficiency: 'novice' },
        ]);
        const job = createMockJob([
            { name: 'Python', experience: '5-plus-years' },
        ]);

        const result = compareSkills(profile, job);

        expect(result.matched.length).toBe(0);
        expect(result.partial.length).toBe(1);
        expect(result.partial[0].name).toBe('Python');
    });

    it('should be case-insensitive when matching skills', () => {
        const profile = createMockProfile([
            { name: 'JAVASCRIPT', proficiency: 'expert' },
            { name: 'react.js', proficiency: 'proficient' },
        ]);
        const job = createMockJob([
            { name: 'javascript', experience: '1-3-years' },
            { name: 'React.JS', experience: '1-3-years' },
        ]);

        const result = compareSkills(profile, job);

        expect(result.matched.length).toBe(2);
        expect(result.missing.length).toBe(0);
    });

    it('should calculate score correctly with mixed results', () => {
        const profile = createMockProfile([
            { name: 'JavaScript', proficiency: 'expert' },
            { name: 'Python', proficiency: 'novice' },
        ]);
        const job = createMockJob([
            { name: 'JavaScript', experience: '1-3-years' },
            { name: 'Python', experience: '5-plus-years' },
            { name: 'Go', experience: '1-3-years' },
            { name: 'Rust', experience: '1-3-years' },
        ]);

        const result = compareSkills(profile, job);

        // 1 matched + 1 partial * 0.5 = 1.5 / 4 = 37.5% -> 38% rounded
        expect(result.matched.length).toBe(1);
        expect(result.partial.length).toBe(1);
        expect(result.missing.length).toBe(2);
        expect(result.score).toBe(38);
    });

    it('should handle empty job requirements', () => {
        const profile = createMockProfile([
            { name: 'JavaScript', proficiency: 'expert' },
        ]);
        const job = createMockJob([]);

        const result = compareSkills(profile, job);

        expect(result.score).toBe(0);
        expect(result.totalRequired).toBe(1);
    });

    it('should handle user with no skills', () => {
        const profile = createMockProfile([]);
        const job = createMockJob([
            { name: 'JavaScript', experience: '1-3-years' },
        ]);

        const result = compareSkills(profile, job);

        expect(result.score).toBe(0);
        expect(result.missing.length).toBe(1);
    });
});
