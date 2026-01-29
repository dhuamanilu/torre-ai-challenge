import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useApp } from '../../context/AppContext';
import { SKILL_CATEGORIES } from '../../utils/skillCategorizer';
import { ParticleBackground } from '../effects/ParticleBackground';

export function ProfileGraph({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
    const { profile } = useApp();
    const fgRef = useRef<ForceGraphMethods>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [hoverNode, setHoverNode] = useState<any>(null);
    const [isAutoRotating, setIsAutoRotating] = useState(true);

    // Narrower Color Palette (Cool/Deep Space Spectrum)
    const CATEGORY_COLORS: Record<string, string> = {
        'Frontend': '#06b6d4', // Cyan
        'Backend': '#3b82f6',  // Blue
        'Mobile': '#8b5cf6',   // Violet
        'Tools': '#64748b',    // Slate
        'Soft Skills': '#10b981', // Emerald
        'General': '#f8fafc',  // White/Silver
        'Other': '#475569'     // Dark Slate
    };

    const graphData = useMemo(() => {
        if (!profile || !Array.isArray(profile.strengths)) return { nodes: [], links: [] };

        const nodes: any[] = [];
        const links: any[] = [];
        const activeCategories = new Set<string>();

        // 1. Process Skills (Deduplicate & Sanitize)
        const skillNodes: any[] = [];
        const skillLinks: any[] = [];
        const processedIds = new Set<string>();

        // Limit to 60 to prevent slow rendering on chaos
        const safeStrengths = profile.strengths.filter(s => s.name && s.id);

        safeStrengths.slice(0, 60).forEach(skill => {
            // Prevent duplicates
            if (processedIds.has(skill.id)) return;
            processedIds.add(skill.id);

            // Avoid ID conflicts with reserved keywords
            if (['root', 'Frontend', 'Backend', 'Mobile', 'Tools', 'Soft Skills', 'Other'].includes(skill.id)) {
                return;
            }

            let parent = 'Other';
            const sName = skill.name.toLowerCase();

            // Find category
            for (const [cat, keywords] of Object.entries(SKILL_CATEGORIES)) {
                if (keywords.some(k => sName.includes(k))) {
                    parent = cat;
                    break;
                }
            }

            activeCategories.add(parent);

            skillNodes.push({
                id: skill.id,
                name: skill.name,
                val: (skill.proficiency === 'master' || skill.proficiency === 'expert') ? 6 : 3,
                color: CATEGORY_COLORS[parent] || '#64748b',
                type: 'skill',
                parent: parent
            });
            skillLinks.push({ source: parent, target: skill.id });
        });

        // 2. Add Root Node
        nodes.push({
            id: 'root',
            name: profile.person.name,
            val: 15,
            color: '#ffffff',
            type: 'root'
        });

        // 3. Add ONLY Active Category Nodes
        activeCategories.forEach(cat => {
            nodes.push({
                id: cat,
                name: cat,
                val: 8,
                color: CATEGORY_COLORS[cat] || '#888888', // Fixed: 6-digit hex fallback
                type: 'category'
            });
            links.push({ source: 'root', target: cat });
        });

        // Add skill nodes and links
        nodes.push(...skillNodes);
        links.push(...skillLinks);

        return { nodes, links };
    }, [profile]);

    // Auto-Navigation / Camera Orbit
    useEffect(() => {
        let frameId: number;
        let angle = 0;

        const animate = () => {
            if (fgRef.current && isAutoRotating) {
                angle += 0.001; // Slow rotation
                const distance = 400;
                // Orbit camera around center
                fgRef.current.zoom(2.5 + Math.sin(angle * 2) * 0.1, 0);
            }
            frameId = requestAnimationFrame(animate);
        };
        // frameId = requestAnimationFrame(animate); 
        return () => cancelAnimationFrame(frameId);
    }, [isAutoRotating]);


    // Initial Physics Setup
    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge')?.strength(-100);
            fgRef.current.d3Force('link')?.distance(70);

            // "Sea" Current - Continuous gentle drift
            fgRef.current.d3Force('sea', (alpha) => {
                const nodes = graphData.nodes as any[];
                nodes.forEach(n => {
                    // Vortex / Galaxy Spin
                    const dy = n.y;
                    const dx = n.x;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        const falloff = Math.max(0.1, 1 - dist / 1000);
                        // Tangential force
                        n.vx += (dy / dist) * 0.5 * alpha * falloff;
                        n.vy += (-dx / dist) * 0.5 * alpha * falloff;
                    }
                });
            });

            setTimeout(() => {
                fgRef.current?.zoom(2.2, 2000);
            }, 500);
        }
    }, [graphData]);


    const handleNodeHover = (node: any) => {
        setHoverNode(node);
        document.body.style.cursor = node ? 'pointer' : 'default';
        setIsAutoRotating(!node); // Pause auto-effects on hover
    };

    const handleNodeClick = (node: any) => {
        if (node && fgRef.current) {
            // Zoom to node and its cluster
            const scale = node.type === 'category' ? 4 : 3;
            fgRef.current.centerAt(node.x, node.y, 1000);
            fgRef.current.zoom(scale, 1000);
            setIsAutoRotating(false); // Stop auto-nav on manual interaction
        }
    };

    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

        const isHovered = node === hoverNode;
        const fontSize = 12 / globalScale;
        const r = node.val || 4;
        const x = node.x;
        const y = node.y;

        ctx.save();

        // Star / Planet Glow Effect
        // Star / Planet Glow Effect
        const glowRadius = r * (isHovered || node.type === 'category' ? 4 : 2);

        try {
            const gradient = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);

            // Safe hex alpha appending
            let transparentColor = node.color;
            if (node.color.startsWith('#') && node.color.length === 7) {
                transparentColor = `${node.color}40`; // Valid 8-digit hex
            } else {
                // Fallback for short hex or named colors
                transparentColor = 'rgba(255,255,255,0.2)';
            }

            gradient.addColorStop(0, node.color); // Core
            gradient.addColorStop(0.4, transparentColor); // Mid glow
            gradient.addColorStop(1, 'transparent'); // Fade out

            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = gradient;
            ctx.fill();
        } catch (e) {
            // Fallback
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fill();
        }

        // Solid Core (smaller)
        ctx.beginPath();
        ctx.arc(x, y, r * 0.8, 0, 2 * Math.PI, false);
        ctx.fillStyle = isHovered ? '#fff' : node.color; // White core on hover
        ctx.fill();

        // Ring for Categories
        if (node.type === 'category') {
            ctx.beginPath();
            ctx.arc(x, y, r * 1.5, 0, 2 * Math.PI, false);
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.5 / globalScale;
            ctx.stroke();
        }

        // Label interaction
        const showLabel = node.type === 'root' || node.type === 'category' || isHovered || globalScale > 2.5;
        if (showLabel) {
            ctx.font = `${node.type === 'category' ? '600' : ''} ${fontSize}px "Inter", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            // Add shadow to text for readability against particles
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            const textY = y + r + fontSize + 4;
            ctx.fillText(node.name, x, textY);
            ctx.shadowBlur = 0; // Reset
        }

        ctx.restore();
    }, [hoverNode]);

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#050505', overflow: 'hidden' }}>
            {/* 1. Background Layer */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                <ParticleBackground />
            </div>

            {/* Back Button (Reset View) */}
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 20 }}>
                <button onClick={onBack} className="nav-btn" style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontWeight: 600
                }}>
                    ← Back to Orbit
                </button>
            </div>

            {/* CTA Button */}
            <div style={{ position: 'absolute', bottom: '3rem', width: '100%', textAlign: 'center', zIndex: 20, pointerEvents: 'none' }}>
                <button
                    onClick={onNext}
                    style={{
                        pointerEvents: 'auto',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '1rem 3rem',
                        fontSize: '1rem',
                        fontWeight: '600',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(99, 102, 241, 0.4)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.5)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    Explore Opportunities
                </button>
            </div>

            {/* 2. Graph Layer */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <ForceGraph2D
                    ref={fgRef as any}
                    graphData={graphData}
                    backgroundColor="rgba(0,0,0,0)" // Transparent!
                    nodeLabel="name"
                    nodeVal="val"
                    nodeCanvasObject={paintNode}
                    onNodeHover={handleNodeHover}
                    onNodeClick={handleNodeClick}
                    linkColor={() => 'rgba(100, 200, 255, 0.1)'} // Subtler cyan links
                    linkWidth={1}
                    d3AlphaDecay={0.01}
                    d3VelocityDecay={0.4}
                />
            </div>
        </div>
    );
}
