import React from 'react';
import type { SkillMatch } from '../types';

interface RadarChartProps {
    matched: SkillMatch[];
    partial: SkillMatch[];
    missing: SkillMatch[];
    width?: number;
    height?: number;
}

// Simple categorization keyword mapping
const CATEGORIES = {
    'Frontend': ['react', 'vue', 'angular', 'html', 'css', 'javascript', 'typescript', 'frontend', 'ui', 'ux', 'webpack', 'vite'],
    'Backend': ['node', 'python', 'java', 'go', 'golang', 'ruby', 'php', 'sql', 'database', 'mongo', 'postgres', 'api', 'server', 'aws', 'cloud'],
    'Mobile': ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter', 'mobile'],
    'Tools': ['git', 'docker', 'kubernetes', 'jenkins', 'jira', 'agile', 'scrum', 'testing', 'jest', 'cypress'],
    'Soft Skills': ['communication', 'leadership', 'teamwork', 'english', 'spanish', 'management', 'mentoring'],
};

export function RadarChart({ matched, partial, missing, width = 300, height = 300 }: RadarChartProps) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Calculate category scores
    const categoryScores: Record<string, { total: number; obtained: number }> = {
        'Frontend': { total: 0, obtained: 0 },
        'Backend': { total: 0, obtained: 0 },
        'Mobile': { total: 0, obtained: 0 },
        'Tools': { total: 0, obtained: 0 },
        'Soft Skills': { total: 0, obtained: 0 },
        'Other': { total: 0, obtained: 0 },
    };

    const allSkills = [...matched, ...partial, ...missing];

    allSkills.forEach(skill => {
        const name = skill.name.toLowerCase();
        let category = 'Other';

        for (const [cat, keywords] of Object.entries(CATEGORIES)) {
            if (keywords.some(k => name.includes(k))) {
                category = cat;
                break;
            }
        }

        categoryScores[category].total += 1;

        if (skill.status === 'matched') {
            categoryScores[category].obtained += 1;
        } else if (skill.status === 'partial') {
            categoryScores[category].obtained += 0.5;
        }
    });

    // Filter categories that have at least one requirement
    const activeCategories = Object.keys(categoryScores).filter(cat => categoryScores[cat].total > 0 && cat !== 'Other');

    // Use at least the main categories if job is too specific, to keep the shape
    if (activeCategories.length < 3) {
        ['Frontend', 'Backend', 'Tools', 'Soft Skills'].forEach(cat => {
            if (!activeCategories.includes(cat)) activeCategories.push(cat);
        });
    }

    const totalAxes = activeCategories.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Calculate points
    const points = activeCategories.map((cat, i) => {
        const score = categoryScores[cat].total > 0
            ? categoryScores[cat].obtained / categoryScores[cat].total
            : 0; // Default to 0 if no requirements

        const angle = i * angleStep - Math.PI / 2; // Start from top
        const value = score * radius;

        const x = cx + Math.cos(angle) * value;
        const y = cy + Math.sin(angle) * value;

        const labelX = cx + Math.cos(angle) * (radius + 20);
        const labelY = cy + Math.sin(angle) * (radius + 20);

        return { x, y, labelX, labelY, cat, score };
    });

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="radar-chart-container">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                {/* Background Web */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
                    <polygon
                        key={i}
                        points={activeCategories.map((_, j) => {
                            const angle = j * angleStep - Math.PI / 2;
                            const r = radius * scale;
                            return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
                        }).join(' ')}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="1"
                        style={{ opacity: 0.3 }}
                    />
                ))}

                {/* Axes */}
                {activeCategories.map((_, i) => {
                    const angle = i * angleStep - Math.PI / 2;
                    return (
                        <line
                            key={i}
                            x1={cx}
                            y1={cy}
                            x2={cx + Math.cos(angle) * radius}
                            y2={cy + Math.sin(angle) * radius}
                            stroke="var(--border)"
                            strokeWidth="1"
                            style={{ opacity: 0.5 }}
                        />
                    );
                })}

                {/* Data Shape */}
                <polygon
                    points={polygonPoints}
                    fill="rgba(99, 102, 241, 0.3)" /* accent with opacity */
                    stroke="var(--accent)"
                    strokeWidth="2"
                    className="radar-polygon"
                />

                {/* Data Points */}
                {points.map((p, i) => (
                    <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="var(--accent)"
                        className="radar-point"
                    >
                        <title>{`${p.cat}: ${Math.round(p.score * 100)}% Match`}</title>
                    </circle>
                ))}

                {/* Labels */}
                {points.map((p, i) => (
                    <text
                        key={i}
                        x={p.labelX}
                        y={p.labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="var(--text-secondary)"
                        fontSize="10"
                        className="radar-label"
                    >
                        {p.cat}
                    </text>
                ))}
            </svg>
        </div>
    );
}
