import { describe, it, expect } from 'vitest';
import { getLearningResources } from '../../../utils/skillMatcher';

describe('getLearningResources', () => {
    it('should return learning resources for a skill', () => {
        const resources = getLearningResources('JavaScript');

        expect(resources.length).toBeGreaterThan(0);
        expect(resources.some(r => r.platform === 'Coursera')).toBe(true);
        expect(resources.some(r => r.platform === 'Udemy')).toBe(true);
        expect(resources.some(r => r.platform === 'YouTube')).toBe(true);
    });

    it('should encode skill names in URLs', () => {
        const resources = getLearningResources('React Native');

        expect(resources[0].url).toContain('React%20Native');
    });
});
