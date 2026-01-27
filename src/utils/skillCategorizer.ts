// Skill Categorization Logic
// Maps skills to high-level categories for visualization

export const SKILL_CATEGORIES = {
    'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'frontend', 'ui', 'ux', 'webpack', 'vite', 'sass', 'less', 'styled-components', 'tailwind'],
    'Backend': ['node', 'python', 'java', 'go', 'golang', 'ruby', 'php', 'sql', 'database', 'mongo', 'postgres', 'api', 'server', 'aws', 'cloud', 'docker', 'kubernetes', 'redis', 'graphql'],
    'Mobile': ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile', 'dart'],
    'Tools': ['git', 'github', 'gitlab', 'jenkins', 'jira', 'agile', 'scrum', 'testing', 'jest', 'cypress', 'selenium', 'ci/cd'],
    'Soft Skills': ['communication', 'leadership', 'teamwork', 'english', 'spanish', 'management', 'mentoring', 'problem solving', 'time management'],
};

export const DEFAULT_CATEGORIES = ['Frontend', 'Backend', 'Tools', 'Soft Skills'];

export function categorizeSkill(skillName: string): string {
    const name = skillName.toLowerCase();

    for (const [category, keywords] of Object.entries(SKILL_CATEGORIES)) {
        if (keywords.some(k => name.includes(k))) {
            return category;
        }
    }

    return 'Other';
}
