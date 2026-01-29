import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '../effects/ParticleBackground';
import { useApp } from '../../context/AppContext';

export function LandingScreen({ onComplete }: { onComplete: () => void }) {
    const [localUsername, setLocalUsername] = useState('');
    const { setUsername, loadProfile } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Intro State
    const [text, setText] = useState('');
    const fullText = "LEVERAGE YOUR CAPABILITIES";
    const [showUI, setShowUI] = useState(false);
    const [showParticles, setShowParticles] = useState(false);

    // Audio removed per user request

    // Typewriter Effect
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index <= fullText.length) {
                const char = fullText.slice(0, index);
                setText(char);
                if (index > 0 && index <= fullText.length) {
                    // Silent typing
                }
                index++;
            } else {
                clearInterval(interval);
                // Sequence: Text done -> Wait -> Show UI + Particles
                setTimeout(() => {
                    setShowParticles(true);
                    setTimeout(() => setShowUI(true), 500);
                }, 800);
            }
        }, 80); // Speed: 80ms (slightly faster for "pro" feel)

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localUsername.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            setUsername(localUsername);
            await loadProfile(localUsername);
            onComplete();
        } catch (err) {
            setError('User not found. Try "torrenegra"?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="landing-screen"
            style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary)', overflow: 'hidden',
                cursor: 'default' // Ensure default cursor everywhere
            }}
        >
            <AnimatePresence>
                {showParticles && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 2 }} // Slow fade in for chaos
                        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
                    >
                        <ParticleBackground />
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ position: 'relative', zIndex: 20, textAlign: 'center', width: '100%', maxWidth: '800px', padding: '0 2rem' }}>
                <h1 style={{
                    fontSize: '4rem', fontWeight: 900, marginBottom: '1rem',
                    background: 'linear-gradient(to right, #fff, #a5b4fc)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    minHeight: '8rem', // Reserve space
                    display: 'flex', flexDirection: 'column', justifyContent: 'center'
                }}>
                    {/* Split Text for 2 lines if needed, or just standard wrapping container */}
                    {text}<span className="cursor blink">|</span>
                </h1>

                <style>{`
                    .cursor.blink { animation: blink 1s step-end infinite; }
                    @keyframes blink { 50% { opacity: 0; } }
                `}</style>

                <AnimatePresence>
                    {showUI && (
                        <motion.form
                            onSubmit={handleSubmit}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ marginTop: '3rem' }}
                        >
                            <input
                                type="text"
                                value={localUsername}
                                onChange={(e) => setLocalUsername(e.target.value)}
                                placeholder="Enter your username..."
                                autoFocus
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    borderBottom: '2px solid rgba(255,255,255,0.2)',
                                    fontSize: '3rem',
                                    color: 'white',
                                    textAlign: 'center',
                                    outline: 'none',
                                    padding: '1rem',
                                    fontFamily: 'inherit',
                                    transition: 'border-color 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent)'}
                                onBlur={(e) => e.target.style.borderBottomColor = 'rgba(255,255,255,0.2)'}
                            />

                            {isLoading && <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Connecting to Genome...</p>}
                            {error && <p style={{ marginTop: '1rem', color: 'var(--error)' }}>{error}</p>}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.5 }}
                                transition={{ delay: 1 }}
                                style={{ marginTop: '2rem', fontSize: '0.9rem', letterSpacing: '2px' }}
                            >
                                PRESS ENTER TO INITIALIZE
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
