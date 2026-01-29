import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SmoothScroll } from './components/common/SmoothScroll';
import { LandingScreen } from './components/layout/LandingScreen';
import { ProfileGraph } from './components/features/ProfileGraph';
import { JobSearchScreen } from './components/features/JobSearchScreen';
import { AnalysisResults } from './components/features/AnalysisResults';
import { Header } from './components/layout/Header';
import './styles/main.css';

type ViewState = 'landing' | 'profile' | 'search' | 'results';

function App() {
    const [view, setView] = useState<ViewState>('landing');

    // Simple mock routing for development - in prod use a real router
    return (
        <SmoothScroll>
            <div className="app">
                <AnimatePresence mode="wait">
                    {/* Screen 1: Landing (Mega Input) */}
                    {view === 'landing' && (
                        <LandingScreen key="landing" onComplete={() => setView('profile')} />
                    )}

                    {/* Screen 2: Profile Graph */}
                    {view === 'profile' && (
                        <ProfileGraph
                            key="profile"
                            onNext={() => setView('search')}
                            onBack={() => setView('landing')}
                        />
                    )}

                    {/* Screen 3: Job Search */}
                    {view === 'search' && (
                        <JobSearchScreen
                            key="search"
                            onSearch={() => setView('results')}
                            onBack={() => setView('profile')}
                        />
                    )}

                    {/* Screen 4: Results (Traditional Layout) */}
                    {view === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
                        >
                            <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 100 }}>
                                <button
                                    onClick={() => setView('search')}
                                    style={{
                                        background: 'transparent', border: 'none',
                                        color: 'rgba(255,255,255,0.6)',
                                        cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold',
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        textTransform: 'uppercase', letterSpacing: '1px'
                                    }}
                                >
                                    <span>←</span> New Search
                                </button>
                            </div>
                            <Header />
                            <main className="main" style={{ flex: 1 }}>
                                <section className="results-container" style={{ paddingTop: '2rem' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                        {/* Button moved to top-left */}
                                    </div>
                                    <AnalysisResults />
                                </section>
                            </main>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </SmoothScroll>
    );
}

export default App;
