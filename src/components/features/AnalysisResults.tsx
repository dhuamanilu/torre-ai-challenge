import React from 'react';
import { useApp } from '../../context/AppContext';
import { RadarChart } from '../RadarChart';
import { getLearningResources } from '../../utils/skillMatcher';
import type { LearningResource } from '../../types';

export function AnalysisResults() {
    const {
        comparisons,
        activeComparison,
        setActiveComparison,
        profile,
        showLearning,
        setShowLearning,
    } = useApp();

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
                            aria-controls={`panel-${idx}`}
                        >
                            <span className="tab-score">{comp.result.weightedScore}%</span>
                            <span className="tab-title">{comp.job.objective}</span>
                        </button>
                    ))}
                </div>
            )}

            {currentComp && (
                <div role="tabpanel" id={`panel-${activeComparison}`}>
                    <div className="comparison-header">
                        <div className="profile-card">
                            {profile.person.pictureThumbnail && (
                                <img
                                    src={profile.person.pictureThumbnail}
                                    alt={profile.person.name}
                                    className="profile-image"
                                />
                            )}
                            <div className="profile-info">
                                <h3>{profile.person.name}</h3>
                                <p>{profile.person.professionalHeadline}</p>
                            </div>
                        </div>

                        <div className="score-container">
                            <div className="score-circle" key={`${currentComp.job.id}-${activeComparison}`}>
                                <svg viewBox="0 0 100 100" aria-hidden="true">
                                    <circle className="score-bg" cx="50" cy="50" r="45" />
                                    <circle
                                        className="score-progress"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        style={{
                                            strokeDasharray: `${currentComp.result.weightedScore * 2.83} 283`,
                                        }}
                                    />
                                </svg>
                                <div className="score-text">
                                    <span className="score-value">{currentComp.result.weightedScore}%</span>
                                    <span className="score-label">Weighted</span>
                                </div>
                            </div>
                            <div className="score-simple">
                                Simple: {currentComp.result.score}%
                            </div>
                        </div>

                        <div className="radar-chart-wrapper">
                            <RadarChart
                                matched={currentComp.result.matched}
                                partial={currentComp.result.partial}
                                missing={currentComp.result.missing}
                                width={280}
                                height={280}
                            />
                        </div>

                        <div className="job-card">
                            {currentComp.job.organizations[0]?.picture && (
                                <img
                                    src={currentComp.job.organizations[0].picture}
                                    alt={currentComp.job.organizations[0].name}
                                    className="job-image"
                                />
                            )}
                            <div className="job-info">
                                <h3>{currentComp.job.objective}</h3>
                                <p>{currentComp.job.organizations[0]?.name || 'Unknown Company'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="skills-breakdown">
                        <div className="skill-category matched">
                            <h4>✅ Skills You Have ({currentComp.result.matched.length})</h4>
                            <div className="skill-list">
                                {currentComp.result.matched.length === 0 ? (
                                    <p className="empty-message">No matched skills found</p>
                                ) : (
                                    currentComp.result.matched.map((skill) => (
                                        <div key={skill.name} className="skill-tag">
                                            <span className="skill-name">{skill.name}</span>
                                            <span className="proficiency">{skill.userProficiency}</span>
                                            {skill.weight && skill.weight > 0 && (
                                                <span className="weight-badge" title="Skill strength">
                                                    ⭐ {Math.round(skill.weight)}
                                                </span>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="skill-category partial">
                            <h4>⚠️ Skills to Improve ({currentComp.result.partial.length})</h4>
                            <div className="skill-list">
                                {currentComp.result.partial.length === 0 ? (
                                    <p className="empty-message">No partial matches</p>
                                ) : (
                                    currentComp.result.partial.map((skill) => (
                                        <div key={skill.name} className="skill-tag">
                                            <span className="skill-name">{skill.name}</span>
                                            <span className="proficiency">
                                                {skill.userProficiency} → {skill.requiredExperience}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="skill-category missing">
                            <h4>❌ Skills to Learn ({currentComp.result.missing.length})</h4>
                            <div className="skill-list">
                                {currentComp.result.missing.length === 0 ? (
                                    <p className="empty-message">No missing skills - great match!</p>
                                ) : (
                                    currentComp.result.missing.map((skill) => (
                                        <div
                                            key={skill.name}
                                            className="skill-tag clickable"
                                            onClick={() => setShowLearning(showLearning === skill.name ? null : skill.name)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => e.key === 'Enter' && setShowLearning(showLearning === skill.name ? null : skill.name)}
                                            aria-expanded={showLearning === skill.name}
                                        >
                                            <span className="skill-name">{skill.name}</span>
                                            {skill.requiredExperience && (
                                                <span className="proficiency">requires {skill.requiredExperience}</span>
                                            )}
                                            <span className="learn-btn">📚 Learn</span>

                                            {showLearning === skill.name && (
                                                <div className="learning-resources">
                                                    {getLearningResources(skill.name).map((resource: LearningResource) => (
                                                        <a
                                                            key={resource.platform}
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="resource-link"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {resource.platform === 'Coursera' && '🎓'}
                                                            {resource.platform === 'Udemy' && '📺'}
                                                            {resource.platform === 'YouTube' && '▶️'}
                                                            {resource.platform === 'Google' && '📖'}
                                                            {' '}{resource.platform}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
