import React from 'react';
import { useApp } from '../../context/AppContext';

export function AnalyzeButton() {
    const { loading, username, selectedJobs, analyze } = useApp();

    return (
        <button
            className="analyze-btn"
            onClick={analyze}
            disabled={loading || !username.trim() || selectedJobs.length === 0}
            aria-busy={loading}
        >
            {loading ? 'Analyzing...' : `Analyze ${selectedJobs.length} Job${selectedJobs.length !== 1 ? 's' : ''}`}
        </button>
    );
}
