import type { TorreProfile, TorreJob } from '../../../types';

export const createMockProfile = (skills: Array<{ name: string; proficiency: string; weight?: number }>): TorreProfile => ({
    person: {
        name: 'Test User',
        professionalHeadline: 'Software Developer',
    },
    strengths: skills.map((skill, index) => ({
        id: `skill-${index}`,
        code: index,
        name: skill.name,
        proficiency: skill.proficiency,
        weight: skill.weight || 0,
    })),
    stats: {
        strengths: skills.length,
    },
});

export const createMockJob = (skills: Array<{ name: string; experience?: string }>): TorreJob => ({
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
