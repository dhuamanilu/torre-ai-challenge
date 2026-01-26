// Skill Matching Algorithm with Weighted Scoring
import type { TorreProfile, TorreJob } from '../services/torreApi';

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

const PROFICIENCY_LEVELS: Record<string, number> = {
    'master': 5,
    'expert': 4,
    'proficient': 3,
    'novice': 2,
    'no-experience-interested': 1,
};

const EXPERIENCE_LEVELS: Record<string, number> = {
    '5-plus-years': 5,
    '3-5-years': 4,
    '1-3-years': 3,
    'potential-to-develop': 2,
};

export function compareSkills(profile: TorreProfile, job: TorreJob): MatchResult {
    const userSkills = new Map<string, { name: string; proficiency: string; weight: number; recommendations?: number }>();

    // Build user skills map (normalized to lowercase for comparison)
    profile.strengths.forEach(skill => {
        userSkills.set(skill.name.toLowerCase(), {
            name: skill.name,
            proficiency: skill.proficiency,
            weight: skill.weight || 0,
            recommendations: (skill as any).recommendations || 0,
        });
    });

    const matched: SkillMatch[] = [];
    const partial: SkillMatch[] = [];
    const missing: SkillMatch[] = [];

    let totalWeight = 0;
    let matchedWeight = 0;

    // Compare against job requirements
    job.strengths.forEach(required => {
        const normalizedName = required.name.toLowerCase();
        const userSkill = userSkills.get(normalizedName);

        // Weight each skill equally for now (could use job.strengths weight if available)
        const skillWeight = 1;
        totalWeight += skillWeight;

        if (userSkill) {
            const userLevel = PROFICIENCY_LEVELS[userSkill.proficiency] || 2;
            const requiredLevel = EXPERIENCE_LEVELS[required.experience || 'potential-to-develop'] || 2;

            if (userLevel >= requiredLevel) {
                matched.push({
                    name: required.name,
                    status: 'matched',
                    userProficiency: userSkill.proficiency,
                    requiredExperience: required.experience,
                    weight: userSkill.weight,
                    recommendations: userSkill.recommendations,
                });
                // Full credit for matched, with bonus for high weight/recommendations
                const bonus = Math.min(userSkill.weight / 100, 0.2); // Up to 20% bonus
                matchedWeight += skillWeight * (1 + bonus);
            } else {
                partial.push({
                    name: required.name,
                    status: 'partial',
                    userProficiency: userSkill.proficiency,
                    requiredExperience: required.experience,
                    weight: userSkill.weight,
                    recommendations: userSkill.recommendations,
                });
                // Partial credit (50%) for having the skill at lower level
                matchedWeight += skillWeight * 0.5;
            }
        } else {
            missing.push({
                name: required.name,
                status: 'missing',
                requiredExperience: required.experience,
            });
        }
    });

    const totalRequired = job.strengths.length || 1;

    // Simple score (original formula)
    const simpleScore = Math.round(((matched.length + partial.length * 0.5) / totalRequired) * 100);

    // Weighted score (considers user's skill strength)
    const weightedScore = totalWeight > 0
        ? Math.round((matchedWeight / totalWeight) * 100)
        : 0;

    return {
        matched,
        partial,
        missing,
        score: Math.min(simpleScore, 100),
        weightedScore: Math.min(weightedScore, 100),
        totalRequired,
    };
}

// Learning resources API - using free public APIs
export interface LearningResource {
    name: string;
    url: string;
    platform: string;
    type: 'course' | 'documentation' | 'tutorial';
}

export function getLearningResources(skillName: string): LearningResource[] {
    const encodedSkill = encodeURIComponent(skillName);

    return [
        {
            name: `Learn ${skillName} on Coursera`,
            url: `https://www.coursera.org/search?query=${encodedSkill}`,
            platform: 'Coursera',
            type: 'course',
        },
        {
            name: `${skillName} Courses on Udemy`,
            url: `https://www.udemy.com/courses/search/?q=${encodedSkill}`,
            platform: 'Udemy',
            type: 'course',
        },
        {
            name: `${skillName} on YouTube`,
            url: `https://www.youtube.com/results?search_query=${encodedSkill}+tutorial`,
            platform: 'YouTube',
            type: 'tutorial',
        },
        {
            name: `${skillName} Documentation`,
            url: `https://www.google.com/search?q=${encodedSkill}+documentation`,
            platform: 'Google',
            type: 'documentation',
        },
    ];
}
