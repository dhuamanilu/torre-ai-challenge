import React from 'react';
import { useApp } from '../../context/AppContext';
import { RadarChart } from '../RadarChart';
import { AnalysisSkeleton } from '../common/Skeleton';
import { getLearningResources } from '../../utils/skillMatcher';
import type { LearningResource } from '../../types';

export function AnalysisResults() {
    const {
        comparisons,
        activeComparison,
        setActiveComparison,
        profile,
        loading,
        showLearning,
        setShowLearning,
    } = useApp();

    if (loading) {
        return <AnalysisSkeleton />;
    }

    if (comparisons.length === 0 || !profile) {
        return null;
    }

    const currentComp = comparisons[activeComparison];

    return (
        <section className="results-section" aria-label="Analysis Results">
            {comparisons.length > 1 && (
                <div className="job-tabs" role="tablist">
                    {comparisons.map((comp, idx) => (
                        <button
                            key={comp.job.id}
                            className={`job-tab ${idx === activeComparison ? 'active' : ''}`}
                            onClick={() => setActiveComparison(idx)}
                            role="tab"
                            aria-selected={idx === activeComparison}
                        >
                            <span className="tab-score">{comp.result.weightedScore}%</span>
                            <span className="tab-title">{comp.job.objective}</span>
                        </button>
                    ))}
                </div>
            )}

            {currentComp && (
                <div className="bento-grid">
                    {/* Profile Card - R1 C1 */}
                    <div className="bento-card bento-profile">
                        <div className="profile-info-compact">
                            <h3>{profile.person.name}</h3>
                            <p className="subtitle-text">{profile.person.professionalHeadline}</p>
                        </div>
                    </div>

                    {/* Score Card - R1 C2 */}
                    <div className="bento-card bento-score">
                        <div className="score-value-large" style={{ color: 'var(--accent)', fontSize: '2.5rem', fontWeight: 800 }}>
                            {currentComp.result.weightedScore}%
                        </div>
                        <div className="score-label">Match Score</div>
                    </div>

                    {/* Radar Chart - R1-R2 C3-C4 */}
                    <div className="bento-card bento-chart">
                        <RadarChart
                            matched={currentComp.result.matched}
                            partial={currentComp.result.partial}
                            missing={currentComp.result.missing}
                            width={320}
                            height={320}
                        />
                    </div>

                    {/* Job Card - R2 C1-C2 */}
                    <div className="bento-card bento-job" style={{ gridColumn: 'span 2' }}>
                        <h3>Target Role</h3>
                        <div className="job-details-compact">
                            <strong style={{ fontSize: '1.2rem', display: 'block' }}>{currentComp.job.objective}</strong>
                            <span style={{ color: 'var(--text-secondary)' }}>{currentComp.job.organizations[0]?.name}</span>
                        </div>
                    </div>

                    {/* Skills - R3 Full Width */}
                    <div className="bento-card bento-skills">
                        <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                            <div className="skill-column">
                                <h4 style={{ color: 'var(--success)' }}>✅ Acquired</h4>
                                <div className="skill-list">
                                    {currentComp.result.matched.map(s => (
                                        <span key={s.name} className="skill-tag matched">{s.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="skill-column">
                                <h4 style={{ color: 'var(--warning)' }}>⚠️ Gap</h4>
                                <div className="skill-list">
                                    {currentComp.result.partial.map(s => (
                                        <span key={s.name} className="skill-tag partial">{s.name}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="skill-column">
                                <h4 style={{ color: 'var(--error)' }}>❌ Missing</h4>
                                <div className="skill-list">
                                    {currentComp.result.missing.map(s => (
                                        <span
                                            key={s.name}
                                            className="skill-tag missing clickable"
                                            onClick={() => setShowLearning(showLearning === s.name ? null : s.name)}
                                        >
                                            {s.name} 🔗
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Learning Resources Overlay/Expand */}
                        {showLearning && (
                            <div className="learning-panel" style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                                <h5>Learning: {showLearning}</h5>
                                <div className="learning-resources">
                                    {getLearningResources(showLearning).map(r => (
                                        <a key={r.platform} href={r.url} target="_blank" className="resource-link">{r.platform}</a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
