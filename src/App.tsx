import { useState } from 'react';
import { fetchUserProfile, fetchJobDetails, searchJobs, TorreProfile, TorreJob, JobSearchResult } from './services/torreApi';
import { compareSkills, MatchResult, getLearningResources, LearningResource } from './utils/skillMatcher';
import './App.css';

interface JobComparison {
    job: TorreJob;
    result: MatchResult;
}

function App() {
    const [username, setUsername] = useState('');
    const [jobSearch, setJobSearch] = useState('');
    const [selectedJobs, setSelectedJobs] = useState<JobSearchResult[]>([]);
    const [searchResults, setSearchResults] = useState<JobSearchResult[]>([]);
    const [profile, setProfile] = useState<TorreProfile | null>(null);
    const [profilePreview, setProfilePreview] = useState<TorreProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [comparisons, setComparisons] = useState<JobComparison[]>([]);
    const [activeComparison, setActiveComparison] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');
    const [showLearning, setShowLearning] = useState<string | null>(null);

    const handleLoadProfile = async () => {
        if (!username.trim()) {
            setError('Please enter your Torre username');
            return;
        }

        setLoadingProfile(true);
        setError('');

        try {
            const profileData = await fetchUserProfile(username.trim());
            setProfilePreview(profileData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
        } finally {
            setLoadingProfile(false);
        }
    };

    const handleSearch = async () => {
        if (!jobSearch.trim()) {
            setError('Please enter a job search term');
            return;
        }

        setSearching(true);
        setError('');
        setSearchResults([]);

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

    const handleSelectJob = (job: JobSearchResult) => {
        if (selectedJobs.some(j => j.id === job.id)) {
            setSelectedJobs(selectedJobs.filter(j => j.id !== job.id));
        } else if (selectedJobs.length < 3) {
            setSelectedJobs([...selectedJobs, job]);
        }
    };

    const handleAnalyze = async () => {
        if (!username.trim()) {
            setError('Please enter your Torre username');
            return;
        }
        if (selectedJobs.length === 0) {
            setError('Please select at least one job');
            return;
        }

        setLoading(true);
        setError('');
        setComparisons([]);

        try {
            const profileData = await fetchUserProfile(username.trim());
            setProfile(profileData);

            const jobPromises = selectedJobs.map(j => fetchJobDetails(j.id));
            const jobs = await Promise.all(jobPromises);

            const newComparisons: JobComparison[] = jobs.map(job => ({
                job,
                result: compareSkills(profileData, job),
            }));

            // Sort by score (highest first)
            newComparisons.sort((a, b) => b.result.weightedScore - a.result.weightedScore);
            setComparisons(newComparisons);
            setActiveComparison(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const currentComp = comparisons[activeComparison];

    return (
        <div className="app">
            <header className="header">
                <h1>🎯 Skill Gap Analyzer</h1>
                <p className="subtitle">Compare your Torre profile skills against multiple job requirements</p>
            </header>

            <main className="main">
                <section className="input-section">
                    <div className="input-group">
                        <label htmlFor="username">Torre Username</label>
                        <div className="search-row">
                            <input
                                id="username"
                                type="text"
                                placeholder="e.g., torrenegra"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLoadProfile()}
                                disabled={loading || loadingProfile}
                            />
                            <button
                                className="search-btn"
                                onClick={handleLoadProfile}
                                disabled={loading || loadingProfile || !username.trim()}
                            >
                                {loadingProfile ? '...' : '👤'}
                            </button>
                        </div>
                        <span className="hint">Enter username and click 👤 to preview your profile</span>
                    </div>

                    {profilePreview && (
                        <div className="profile-summary-card">
                            <div className="profile-summary-header">
                                {profilePreview.person.pictureThumbnail && (
                                    <img
                                        src={profilePreview.person.pictureThumbnail}
                                        alt={profilePreview.person.name}
                                        className="profile-summary-image"
                                    />
                                )}
                                <div className="profile-summary-info">
                                    <h3>{profilePreview.person.name}</h3>
                                    <p>{profilePreview.person.professionalHeadline}</p>
                                    <span className="skill-count">
                                        {profilePreview.strengths.length} skills on profile
                                    </span>
                                </div>
                            </div>
                            <div className="top-skills">
                                <h4>🌟 Your Top Skills</h4>
                                <div className="top-skills-list">
                                    {profilePreview.strengths
                                        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                                        .slice(0, 8)
                                        .map((skill) => (
                                            <div key={skill.id} className="top-skill-tag">
                                                <span className="skill-name">{skill.name}</span>
                                                <span className="skill-proficiency">{skill.proficiency}</span>
                                                {skill.weight > 0 && (
                                                    <span className="skill-weight">⭐ {Math.round(skill.weight)}</span>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    )}

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
                        <span className="hint">Select up to 3 jobs to compare</span>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="search-results">
                            <h4>Select jobs to compare ({selectedJobs.length}/3 selected)</h4>
                            <div className="job-list">
                                {searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        className={`job-item ${selectedJobs.some(j => j.id === result.id) ? 'selected' : ''}`}
                                        onClick={() => handleSelectJob(result)}
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

                    {selectedJobs.length > 0 && (
                        <div className="selected-jobs">
                            <h4>Selected Jobs:</h4>
                            <div className="selected-job-tags">
                                {selectedJobs.map(job => (
                                    <span key={job.id} className="selected-job-tag">
                                        {job.objective}
                                        <button onClick={() => handleSelectJob(job)}>×</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        className="analyze-btn"
                        onClick={handleAnalyze}
                        disabled={loading || !username.trim() || selectedJobs.length === 0}
                    >
                        {loading ? 'Analyzing...' : `Analyze ${selectedJobs.length} Job${selectedJobs.length !== 1 ? 's' : ''}`}
                    </button>

                    {error && <div className="error">{error}</div>}
                </section>

                {comparisons.length > 0 && profile && (
                    <section className="results-section">
                        {comparisons.length > 1 && (
                            <div className="job-tabs">
                                {comparisons.map((comp, idx) => (
                                    <button
                                        key={comp.job.id}
                                        className={`job-tab ${idx === activeComparison ? 'active' : ''}`}
                                        onClick={() => setActiveComparison(idx)}
                                    >
                                        <span className="tab-score">{comp.result.weightedScore}%</span>
                                        <span className="tab-title">{comp.job.objective}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentComp && (
                            <>
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
                                            <svg viewBox="0 0 100 100">
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
                                                    <div key={skill.name} className="skill-tag clickable" onClick={() => setShowLearning(showLearning === skill.name ? null : skill.name)}>
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
                            </>
                        )}
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
