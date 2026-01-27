import React from 'react';
import { useApp } from '../../context/AppContext';

export function JobSearch() {
    const {
        jobSearch,
        setJobSearch,
        searchResults,
        selectedJobs,
        searching,
        loading,
        handleSearch,
        selectJob,
    } = useApp();

    return (
        <>
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
                        aria-label="Job search input"
                    />
                    <button
                        className="search-btn"
                        onClick={handleSearch}
                        disabled={loading || searching}
                        aria-label="Search jobs"
                        data-testid="search-button"
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
                                onClick={() => selectJob(result)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === 'Enter' && selectJob(result)}
                                aria-pressed={selectedJobs.some(j => j.id === result.id)}
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
                                <button
                                    onClick={() => selectJob(job)}
                                    aria-label={`Remove ${job.objective}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
