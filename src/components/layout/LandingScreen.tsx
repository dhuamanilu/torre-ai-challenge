import { useState } from 'react';
import { motion } from 'framer-motion';
import { ParticleBackground } from '../effects/ParticleBackground';
import { useApp } from '../../context/AppContext';

export function LandingScreen({ onComplete }: { onComplete: () => void }) {
    const [localUsername, setLocalUsername] = useState('');
    const { setUsername, loadProfile } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!localUsername.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            setUsername(localUsername);
            await loadProfile(localUsername); // Pass explicit username to avoid state race condition
            onComplete(); // Trigger transition to next screen
        } catch (err) {
            setError('User not found. Try "torrenegra"?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            className="landing-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-primary)', overflow: 'hidden'
            }}
        >
            <ParticleBackground />

            <div style={{ position: 'relative', zIndex: 20, textAlign: 'center', width: '100%', maxWidth: '800px', padding: '0 2rem' }}>
                <motion.h1
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    style={{
                        fontSize: '4rem', fontWeight: 900, marginBottom: '1rem',
                        background: 'linear-gradient(to right, #fff, #a5b4fc)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        lineHeight: 1.1
                    }}
                >
                    LEVERAGE YOUR<br />CAPABILITIES
                </motion.h1>

                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
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
                        style={{ marginTop: '2rem', fontSize: '0.9rem', letterSpacing: '2px' }}
                    >
                        PRESS ENTER TO INITIALIZE
                    </motion.div>
                </motion.form>
            </div>
        </motion.div>
    );
}
