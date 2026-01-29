import { useEffect, useRef, useCallback, useMemo } from 'react';

interface Particle {
    x: number;
    y: number;
    homeX: number;
    homeY: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    // Idle motion offsets
    angle: number;
    speed: number;
}

interface ParticleCanvasOptions {
    particleCount?: number;
    repulsionRadius?: number;
    repulsionStrength?: number;
    springStrength?: number;
    friction?: number;
    colors?: string[];
}

const DEFAULT_OPTIONS: Required<ParticleCanvasOptions> = {
    particleCount: 1500,
    repulsionRadius: 150,
    repulsionStrength: 25,
    springStrength: 0.02,
    friction: 0.94,
    colors: ['#6366f1', '#8b5cf6', '#a855f7'] // Tight purple/indigo range
};

export function useParticleCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    options: ParticleCanvasOptions = {}
) {
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: -9999, y: -9999 });
    const animationFrameId = useRef<number>(0);

    // Memoize config to prevent re-init loops if parent re-renders
    const config = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }),
        [options.particleCount, options.repulsionRadius, options.repulsionStrength, options.springStrength, options.friction, JSON.stringify(options.colors)]);

    const initParticles = useCallback((width: number, height: number) => {
        particles.current = [];
        const cols = Math.ceil(Math.sqrt(config.particleCount * (width / height)));
        const rows = Math.ceil(config.particleCount / cols);
        const gridSpacingX = width / cols;
        const gridSpacingY = height / rows;

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                if (particles.current.length >= config.particleCount) break;

                // Add slight randomness to grid position
                const homeX = (i + 0.5) * gridSpacingX + (Math.random() - 0.5) * gridSpacingX * 0.5;
                const homeY = (j + 0.5) * gridSpacingY + (Math.random() - 0.5) * gridSpacingY * 0.5;

                particles.current.push({
                    x: homeX,
                    y: homeY,
                    homeX,
                    homeY,
                    vx: 0,
                    vy: 0,
                    color: config.colors[Math.floor(Math.random() * config.colors.length)],
                    size: Math.random() * 2 + 1,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.02 + 0.005
                });
            }
        }
    }, [config]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles(canvas.width, canvas.height);
        };

        // Listen to window to fix "text blocks effect"
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseLeave = () => {
            // Keep last known position or reset? Resetting makes it snap back weirdly sometimes.
            // Let's set it far away to allow settle
            mouse.current = { x: -9999, y: -9999 };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const { repulsionRadius, repulsionStrength, springStrength, friction } = config;
            const mx = mouse.current.x;
            const my = mouse.current.y;

            for (let i = 0; i < particles.current.length; i++) {
                const p = particles.current[i];

                // 1. Idle Float (Perlin noise simulation via Sine)
                p.angle += p.speed;
                const floatX = Math.cos(p.angle) * 10;
                const floatY = Math.sin(p.angle) * 10;
                const targetX = p.homeX + floatX;
                const targetY = p.homeY + floatY;

                // 2. Repulsion Force
                const dx = mx - p.x;
                const dy = my - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < repulsionRadius && dist > 0) {
                    const force = (repulsionRadius - dist) / repulsionRadius;
                    const angle = Math.atan2(dy, dx);
                    // Standard Repulsion:
                    // p.vx -= Math.cos(angle) * force * repulsionStrength;
                    // p.vy -= Math.sin(angle) * force * repulsionStrength;

                    // MASS/INERTIA SIMULATION:
                    // Instead of applying force directly to velocity, we apply it as an acceleration that ramps up?
                    // Or simply reduce the strength and rely on accumulation? 
                    // Let's reduce strength but maybe increase radius slightly?
                    // User said "demora en hacer el efecto" -> "Delays in taking effect".
                    // This implies the particle is heavy. If I reduce the force, it takes longer to accelerate.

                    const adjustedStrength = repulsionStrength * 0.5; // Reduced strength for "delay" feel
                    p.vx -= Math.cos(angle) * force * adjustedStrength;
                    p.vy -= Math.sin(angle) * force * adjustedStrength;
                }

                // 3. Spring Force (return to floating target)
                const homeDistX = targetX - p.x;
                const homeDistY = targetY - p.y;

                // User said "vuelvan a su lugar lentamente" (return slowly)
                // So springStrength needs to be lower.
                // But also "Self-correction" -> implies they should smoothly slide back.

                p.vx += homeDistX * springStrength;
                p.vy += homeDistY * springStrength;

                // 4. Friction
                p.vx *= friction;
                p.vy *= friction;

                // Update
                p.x += p.vx;
                p.y += p.vy;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }

            animationFrameId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove); // Window listener!
        window.addEventListener('mouseout', handleMouseLeave);

        handleResize();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [canvasRef, initParticles, config]); // config is now stable
}
