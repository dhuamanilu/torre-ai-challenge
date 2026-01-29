import React, { useMemo, memo } from 'react';
import type { SkillMatch } from '../types';
import { categorizeSkill, DEFAULT_CATEGORIES } from '../utils/skillCategorizer';

interface RadarChartProps {
    matched: SkillMatch[];
    partial: SkillMatch[];
    missing: SkillMatch[];
    width?: number;
    height?: number;
}

export const RadarChart = memo(function RadarChart({ matched, partial, missing, width = 300, height = 300 }: RadarChartProps) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 55; // Increased padding from 40 to 55 to prevent label clipping

    // Memoize category calculation to avoid recalculating on every render if props don't change
    const { points, activeCategories, angleStep, polygonPoints } = useMemo(() => {
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
            const category = categorizeSkill(skill.name);
            categoryScores[category].total += 1;

            if (skill.status === 'matched') {
                categoryScores[category].obtained += 1;
            } else if (skill.status === 'partial') {
                categoryScores[category].obtained += 0.5;
            }
        });

        // Filter categories that have at least one requirement
        const activeCats = Object.keys(categoryScores).filter(cat => categoryScores[cat].total > 0 && cat !== 'Other');

        // Ensure we have enough axes to form a shape
        if (activeCats.length < 3) {
            DEFAULT_CATEGORIES.forEach(cat => {
                if (!activeCats.includes(cat)) activeCats.push(cat);
            });
        }

        const step = (Math.PI * 2) / activeCats.length;

        // Calculate points
        const calculatedPoints = activeCats.map((cat, i) => {
            const score = categoryScores[cat].total > 0
                ? categoryScores[cat].obtained / categoryScores[cat].total
                : 0;

            const angle = i * step - Math.PI / 2; // Start from top
            const value = score * radius;

            const x = cx + Math.cos(angle) * value;
            const y = cy + Math.sin(angle) * value;

            const labelX = cx + Math.cos(angle) * (radius + 20);
            const labelY = cy + Math.sin(angle) * (radius + 20);

            return { x, y, labelX, labelY, cat, score };
        });

        const polyPoints = calculatedPoints.map(p => `${p.x},${p.y}`).join(' ');

        return {
            points: calculatedPoints,
            activeCategories: activeCats,
            angleStep: step,
            polygonPoints: polyPoints
        };
    }, [matched, partial, missing, cx, cy, radius]);

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
});
