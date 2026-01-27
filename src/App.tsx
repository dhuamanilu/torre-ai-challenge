import React from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProfileInput } from './components/features/ProfileInput';
import { JobSearch } from './components/features/JobSearch';
import { AnalyzeButton } from './components/features/AnalyzeButton';
import { AnalysisResults } from './components/features/AnalysisResults';
import { ErrorMessage } from './components/common/ErrorMessage';
import './App.css';

function App() {
    return (
        <div className="app">
            <Header />

            <main className="main">
                <section className="input-section">
                    <ProfileInput />
                    <JobSearch />
                    <AnalyzeButton />
                    <ErrorMessage />
                </section>

                <AnalysisResults />
            </main>

            <Footer />
        </div>
    );
}

export default App;
