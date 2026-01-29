import React, { useRef, useMemo } from 'react';
import { useParticleCanvas } from '../../hooks/visuals/useParticleCanvas';

export const ParticleBackground = React.memo(() => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const options = useMemo(() => ({
        particleCount: 2000,      // More particles for density
        repulsionRadius: 180,     // Larger radius for "slow" effect to start earlier
        repulsionStrength: 15,    // Weaker kick for "heavier" feel
        springStrength: 0.005,    // VERY slow return (was 0.02)
        friction: 0.96,           // High friction for "floaty" feel (slide)
        colors: [
            '#6366f1', // Indigo
            '#8b5cf6', // Violet
            '#a855f7', // Purple
            '#4f46e5'  // Deep Blue
        ]
    }), []);

    useParticleCanvas(canvasRef as React.RefObject<HTMLCanvasElement>, options);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
                background: 'transparent',
                cursor: 'default' // Explicitly default (though pointerEvents: none might bypass this, the parent needs it)
            }}
        />
    );
});
