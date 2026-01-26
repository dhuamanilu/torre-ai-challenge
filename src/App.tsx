import { useState } from 'react';
import { fetchUserProfile, fetchJobDetails, searchJobs, TorreProfile, TorreJob, JobSearchResult } from './services/torreApi';
import { compareSkills, MatchResult } from './utils/skillMatcher';
import './App.css';

function App() {
    const [username, setUsername] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [selectedJobId, setSelectedJobId] = useState('');
    const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
    const [profile, setProfile] = useState<TorreProfile | null>(null);
    const [job, setJob] = useState<TorreJob | null>(null);
    const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!jobSearch.trim()) {
            setError('Please enter a job search term');
            return;
        }

        setSearching(true);
        setError('');
        setSearchResults([]);
        setSelectedJobId('');

        try {
            const results = await searchJobs(jobSearch.trim());
            setSearchResults(results.results);
            if (results.results.length === 0) {
                setError('No jobs found. Try a different search term.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search jobs');
        } finally {
            setSearching(false);
        }
    };

    const handleSelectJob = (jobId: string) => {
        setSelectedJobId(jobId);
        setSearchResults([]);
    };

    const handleAnalyze = async () => {
        if (!username.trim()) {
            setError('Please enter your Torre username');
            return;
        }
        if (!selectedJobId) {
            setError('Please search and select a job first');
            return;
        }

        setLoading(true);
        setError('');
        setMatchResult(null);

        try {
            const [profileData, jobData] = await Promise.all([
                fetchUserProfile(username.trim()),
                fetchJobDetails(selectedJobId),
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
                        <label htmlFor="jobSearch">Search Jobs</label>
                        <div className="search-row">
                            <input
                                id="jobSearch"
                                type="text"
                                placeholder="e.g., React Developer, Product Manager"
                                value={jobSearch}
                                onChange={(e) => setJobSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                disabled={loading || searching}
                            />
                            <button
                                className="search-btn"
                                onClick={handleSearch}
                                disabled={loading || searching}
                            >
                                {searching ? '...' : '🔍'}
                            </button>
                        </div>
                        <span className="hint">Search for jobs by title or keyword</span>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h4>Select a job ({searchResults.length} results)</h4>
                            <div className="job-list">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className={`job-item ${selectedJobId === result.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectJob(result.id)}
                                    >
                                        <div className="job-item-info">
                                            <strong>{result.objective}</strong>
                                            <span className="company">
                                                {result.organizations[0]?.name || 'Unknown Company'}
                                            </span>
                                        </div>
                                        <div className="job-item-meta">
                                            {result.remote && <span className="remote-badge">Remote</span>}
                                            {result.compensation && (
                                                <span className="salary">
                                                    ${result.compensation.minAmount?.toLocaleString()}
                                                    {result.compensation.maxAmount &&
                                                        ` - $${result.compensation.maxAmount.toLocaleString()}`
                                                    }
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedJobId && (
                        <div className="selected-job-badge">
                            ✅ Job selected: {selectedJobId}
                        </div>
                    )}

                    <button
                        className="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={loading || !username.trim() || !selectedJobId}
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
