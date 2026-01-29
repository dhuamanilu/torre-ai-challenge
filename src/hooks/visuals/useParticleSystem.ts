import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

export function useParticleSystem(canvasRef: React.RefObject<HTMLCanvasElement>) {
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: 0, y: 0 });
    const isMoving = useRef(false);
    const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#06b6d4', '#22c55e']; // Cyberpunk palette

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            isMoving.current = true;

            // Emit particles on move
            for (let i = 0; i < 5; i++) {
                particles.current.push(createParticle(mouse.current.x, mouse.current.y));
            }
        };

        const createParticle = (x: number, y: number): Particle => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            return {
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 3 + 1
            };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear screen

            // Background mesh (optional, subtle)
            ctx.fillStyle = 'rgba(0,0,0,0)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02; // Fade out
                p.size *= 0.95; // Shrink

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.life;
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // Resistance/Friction fallback
            if (!isMoving.current && particles.current.length === 0) {
                // Idle state optimization?
            }
            isMoving.current = false;

            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        handleResize(); // Init size
        animate(); // Start loop

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
}
