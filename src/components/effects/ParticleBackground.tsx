import React, { useRef } from 'react';
import { useParticleSystem } from '../../hooks/visuals/useParticleSystem';

export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useParticleSystem(canvasRef as React.RefObject<HTMLCanvasElement>);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0, // Behind refined-content but visible
                pointerEvents: 'none', // Allow clicks pass through
                background: 'transparent'
            }}
        />
    );
}
