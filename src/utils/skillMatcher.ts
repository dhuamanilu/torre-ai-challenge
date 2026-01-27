// Skill Matching Algorithm with Weighted Scoring
import type { TorreProfile, TorreJob, MatchResult, SkillMatch, LearningResource } from '../types';
import { SCORING_CONFIG, SKILL_LEVELS } from '../constants/config';

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
            const userLevel = SKILL_LEVELS.PROFICIENCY[userSkill.proficiency] || 2;
            const requiredLevel = SKILL_LEVELS.EXPERIENCE[required.experience || 'potential-to-develop'] || 2;

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
                const bonus = Math.min(userSkill.weight / SCORING_CONFIG.WEIGHT_DIVISOR, SCORING_CONFIG.BONUS_CAP);
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
                // Partial credit for having the skill at lower level
                matchedWeight += skillWeight * SCORING_CONFIG.PARTIAL_MATCH_FACTOR;
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
    const simpleScore = Math.round(((matched.length + partial.length * SCORING_CONFIG.PARTIAL_MATCH_FACTOR) / totalRequired) * 100);

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
