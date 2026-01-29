import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';

export function JobSearchScreen({ onSearch, onBack }: { onSearch: () => void, onBack: () => void }) {
    const [query, setQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const { username, setJobSearch, handleSearch, searchResults, selectJob, selectedJobs, loading, analyze } = useApp();
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Auto-search disabled per user request. No pre-filling.
    useEffect(() => {
        // Clean state if needed
    }, []);

    // Scroll-up to go back navigation
    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            // If at the top and scrolling up
            if (window.scrollY === 0 && e.deltaY < -50) {
                onBack();
            }
        };
        window.addEventListener('wheel', handleWheel);
        return () => window.removeEventListener('wheel', handleWheel);
    }, [onBack]);

    const doSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setJobSearch(query);
        await handleSearch(query); // Pass query directly to fix double-enter bug
        setHasSearched(true);
    };

    const handleAnalyze = async () => {
        if (selectedJobs.length > 0) {
            setIsAnalyzing(true);
            try {
                await analyze();
                onSearch();
            } catch (error) {
                console.error("Analysis failed", error);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    return (
        <motion.div
            className="job-search-screen"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: hasSearched ? 'flex-start' : 'center',
                background: 'var(--bg-primary)',
                padding: '2rem',
                paddingTop: hasSearched ? '4rem' : '2rem',
                transition: 'all 0.5s ease',
                overflowY: 'auto'
            }}
        >
            <div style={{ width: '100%', maxWidth: '800px', textAlign: 'center' }}>
                <motion.h2
                    layout
                    style={{ fontSize: hasSearched ? '2rem' : '2.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}
                >
                    {hasSearched ? 'Select your target opportunity' : 'What is your target?'}
                </motion.h2>

                <form onSubmit={doSearch}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="e.g. Senior React Developer"
                            autoFocus
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '2px solid var(--accent)',
                                fontSize: hasSearched ? '2rem' : '3rem',
                                color: 'white',
                                textAlign: 'center',
                                outline: 'none',
                                padding: '1rem',
                                marginBottom: '2rem',
                                transition: 'all 0.5s ease'
                            }}
                        />
                        {!hasSearched && !loading && (
                            <motion.button
                                type="submit"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                    background: 'white', color: 'black',
                                    border: 'none', padding: '1rem 3rem',
                                    borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold',
                                    cursor: 'pointer', marginTop: '1rem'
                                }}
                            >
                                SEARCH JOBS 🔍
                            </motion.button>
                        )}
                    </div>
                </form>

                {loading && <div className="loading-spinner" style={{ marginTop: '2rem' }}>Scanning Opportunities...</div>}

                {/* Results List */}
                <AnimatePresence>
                    {hasSearched && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1rem',
                                textAlign: 'left',
                                // Listbox Style Container
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '16px',
                                padding: '1rem',
                                maxHeight: '60vh',
                                overflowY: 'auto'
                            }}
                        >
                            <div className="results-grid" style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: '1fr' }}>
                                {searchResults.map((job) => {
                                    const isSelected = selectedJobs.some(j => j.id === job.id);
                                    return (
                                        <motion.div
                                            key={job.id}
                                            onClick={() => selectJob(job)}
                                            whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                            whileTap={{ scale: 0.99 }}
                                            style={{
                                                background: isSelected ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
                                                border: isSelected ? '1px solid var(--accent)' : '1px solid transparent',
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                padding: '1.2rem',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                transition: 'background 0.2s, border 0.2s'
                                            }}
                                        >
                                            <div style={{ width: '100%' }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: isSelected ? 'white' : 'rgba(255,255,255,0.9)' }}>{job.objective}</h3>
                                                <p style={{ margin: '0.4rem 0 0', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    {job.organizations[0]?.name} • {job.remote ? 'Remote' : job.locations[0]}
                                                </p>
                                            </div>
                                            {/* Removed Checkmark Emoji */}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Sticky Action Bar */}
                            {selectedJobs.length > 0 && (
                                <motion.div
                                    initial={{ y: 100 }} animate={{ y: 0 }}
                                    style={{
                                        position: 'fixed', bottom: '2rem', left: '50%', x: '-50%',
                                        background: 'rgba(15, 15, 25, 0.9)',
                                        backdropFilter: 'blur(10px)',
                                        padding: '1rem 2rem',
                                        borderRadius: '50px',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold' }}>{selectedJobs.length} Selected</span>
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        style={{
                                            background: 'var(--accent)', color: 'white',
                                            border: 'none', padding: '0.8rem 2rem',
                                            borderRadius: '30px', fontWeight: 'bold',
                                            cursor: isAnalyzing ? 'wait' : 'pointer',
                                            opacity: isAnalyzing ? 0.7 : 1
                                        }}
                                    >
                                        {isAnalyzing ? 'ANALYZING...' : 'ANALYZE GAP →'}
                                    </button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                {hasSearched && searchResults.length === 0 && !loading && (
                    <div style={{ marginTop: '2rem', color: 'var(--text-secondary)' }}>No jobs found. Try searching for specific roles like "Senior Developer" or "Project Manager".</div>
                )}
            </div>
            <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                <button onClick={onBack} className="nav-btn" style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' }}>
                    ← NEW SEARCH
                </button>
            </div>
        </motion.div>
    );
}
