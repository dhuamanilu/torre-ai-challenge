import React, { useState } from 'react';
import { fetchUserProfile, fetchJobDetails, TorreProfile, TorreJob } from './services/torreApi';
import { compareSkills, MatchResult } from './utils/skillMatcher';
import './App.css';

function App() {
    const [username, setUsername] = useState('');
    const [jobId, setJobId] = useState('');
    const [profile, setProfile] = useState<TorreProfile | null>(null);
    const [job, setJob] = useState<TorreJob | null>(null);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        if (!username.trim() || !jobId.trim()) {
            setError('Please enter both username and job ID');
            return;
        }

        setLoading(true);
        setError('');
        setMatchResult(null);

        try {
            const [profileData, jobData] = await Promise.all([
                fetchUserProfile(username.trim()),
                fetchJobDetails(jobId.trim()),
            ]);

            setProfile(profileData);
            setJob(jobData);

            const result = compareSkills(profileData, jobData);
            setMatchResult(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <h1>🎯 Skill Gap Analyzer</h1>
                <p className="subtitle">Compare your Torre profile skills against job requirements</p>
            </header>

            <main className="main">
                <section className="input-section">
                    <div className="input-group">
                        <label htmlFor="username">Torre Username</label>
                        <input
                            id="username"
                            type="text"
                            placeholder="e.g., torrenegra"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                        />
                        <span className="hint">Found at the end of your Torre profile URL</span>
                    </div>

                    <div className="input-group">
                        <label htmlFor="jobId">Job ID</label>
                        <input
                            id="jobId"
                            type="text"
                            placeholder="e.g., PW9yY63W"
                            value={jobId}
                            onChange={(e) => setJobId(e.target.value)}
                            disabled={loading}
                        />
                        <span className="hint">Found at the end of the job posting URL</span>
                    </div>

                    <button
                        className="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={loading}
                    >
                        {loading ? 'Analyzing...' : 'Analyze Skill Gap'}
                    </button>

                    {error && <div className="error">{error}</div>}
                </section>

                {matchResult && profile && job && (
                    <section className="results-section">
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

                            <div className="score-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle
                                        className="score-bg"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                    />
                                    <circle
                                        className="score-progress"
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        style={{
                                            strokeDasharray: `${matchResult.score * 2.83} 283`,
                                        }}
                                    />
                                </svg>
                                <div className="score-text">
                                    <span className="score-value">{matchResult.score}%</span>
                                    <span className="score-label">Match</span>
                                </div>
                            </div>

                            <div className="job-card">
                                {job.organizations[0]?.picture && (
                                    <img
                                        src={job.organizations[0].picture}
                                        alt={job.organizations[0].name}
                                        className="job-image"
                                    />
                                )}
                                <div className="job-info">
                                    <h3>{job.objective}</h3>
                                    <p>{job.organizations[0]?.name || 'Unknown Company'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="skills-breakdown">
                            <div className="skill-category matched">
                                <h4>✅ Skills You Have ({matchResult.matched.length})</h4>
                                <div className="skill-list">
                                    {matchResult.matched.length === 0 ? (
                                        <p className="empty-message">No matched skills found</p>
                                    ) : (
                                        matchResult.matched.map((skill) => (
                                            <div key={skill.name} className="skill-tag">
                                                {skill.name}
                                                <span className="proficiency">{skill.userProficiency}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="skill-category partial">
                                <h4>⚠️ Skills to Improve ({matchResult.partial.length})</h4>
                                <div className="skill-list">
                                    {matchResult.partial.length === 0 ? (
                                        <p className="empty-message">No partial matches</p>
                                    ) : (
                                        matchResult.partial.map((skill) => (
                                            <div key={skill.name} className="skill-tag">
                                                {skill.name}
                                                <span className="proficiency">
                                                    {skill.userProficiency} → {skill.requiredExperience}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="skill-category missing">
                                <h4>❌ Skills to Learn ({matchResult.missing.length})</h4>
                                <div className="skill-list">
                                    {matchResult.missing.length === 0 ? (
                                        <p className="empty-message">No missing skills - great match!</p>
                                    ) : (
                                        matchResult.missing.map((skill) => (
                                            <div key={skill.name} className="skill-tag">
                                                {skill.name}
                                                {skill.requiredExperience && (
                                                    <span className="proficiency">requires {skill.requiredExperience}</span>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <footer className="footer">
                <p>Built with Torre APIs • Skill Gap Analyzer</p>
            </footer>
        </div>
    );
}

export default App;
