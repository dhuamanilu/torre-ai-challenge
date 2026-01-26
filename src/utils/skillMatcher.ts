// Skill Matching Algorithm
import type { TorreProfile, TorreJob } from '../services/torreApi';

export interface SkillMatch {
    name: string;
    status: 'matched' | 'partial' | 'missing';
    userProficiency?: string;
    requiredExperience?: string;
}

export interface MatchResult {
    matched: SkillMatch[];
    partial: SkillMatch[];
    missing: SkillMatch[];
    score: number;
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
    const userSkills = new Map<string, { name: string; proficiency: string }>();

    // Build user skills map (normalized to lowercase for comparison)
    profile.strengths.forEach(skill => {
        userSkills.set(skill.name.toLowerCase(), {
            name: skill.name,
            proficiency: skill.proficiency,
        });
    });

    const matched: SkillMatch[] = [];
    const partial: SkillMatch[] = [];
    const missing: SkillMatch[] = [];

    // Compare against job requirements
    job.strengths.forEach(required => {
        const normalizedName = required.name.toLowerCase();
        const userSkill = userSkills.get(normalizedName);

        if (userSkill) {
            const userLevel = PROFICIENCY_LEVELS[userSkill.proficiency] || 2;
            const requiredLevel = EXPERIENCE_LEVELS[required.experience || 'potential-to-develop'] || 2;

            if (userLevel >= requiredLevel) {
                matched.push({
                    name: required.name,
                    status: 'matched',
                    userProficiency: userSkill.proficiency,
                    requiredExperience: required.experience,
                });
            } else {
                partial.push({
                    name: required.name,
                    status: 'partial',
                    userProficiency: userSkill.proficiency,
                    requiredExperience: required.experience,
                });
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
    const score = Math.round(((matched.length + partial.length * 0.5) / totalRequired) * 100);

    return {
        matched,
        partial,
        missing,
        score: Math.min(score, 100),
        totalRequired,
    };
}
