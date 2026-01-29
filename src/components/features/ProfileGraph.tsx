import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useApp } from '../../context/AppContext';
import { SKILL_CATEGORIES } from '../../utils/skillCategorizer';

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
        'General': '#f8fafc',  // White/Silver
        'Other': '#475569'     // Dark Slate
    };

    const graphData = useMemo(() => {
        if (!profile) return { nodes: [], links: [] };

        const nodes: any[] = [];
        const links: any[] = [];
        const activeCategories = new Set<string>();

        // 1. Process Skills first to identify active categories
        const skillNodes: any[] = [];
        const skillLinks: any[] = [];

        profile.strengths.slice(0, 50).forEach(skill => {
            let parent = 'Other';
            const sName = skill.name.toLowerCase();

            // Find category
            for (const [cat, keywords] of Object.entries(SKILL_CATEGORIES)) {
                if (keywords.some(k => sName.includes(k))) {
                    parent = cat;
                    break;
                }
            }

            // Only map if category exists in our filtered list (or matches Other)
            // But we want to find *which* categories have skills.
            activeCategories.add(parent);

            skillNodes.push({
                id: skill.id,
                name: skill.name,
                val: skill.proficiency === 'master' ? 6 : 3,
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
                color: CATEGORY_COLORS[cat] || '#888',
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
                // Note: 2D force graph doesn't support 3D camera orbit easily, 
                // but we can simulate "exploration" by gentle panning or rotating the view coordinates
                // Actually, let's allow the "Sea" physics to handle the movement aesthetic 
                // and use this for strictly camera "breathing" zooms
                fgRef.current.zoom(2.5 + Math.sin(angle * 2) * 0.1, 0);
            }
            frameId = requestAnimationFrame(animate);
        };
        // frameId = requestAnimationFrame(animate); 
        // Disabling camera orbit in favor of graph physics for now to avoid motion sickness
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

        // No auto-dimming to prevent flickering

        // Glow
        if (isHovered || node.type === 'category') {
            ctx.beginPath();
            ctx.arc(x, y, r * 3, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.globalAlpha = 0.2;
            ctx.fill();
        }

        // Core
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color;
        ctx.globalAlpha = 1;
        ctx.fill();

        // Label interaction
        const showLabel = node.type === 'root' || node.type === 'category' || isHovered || globalScale > 2.5;
        if (showLabel) {
            ctx.font = `${node.type === 'category' ? '600' : ''} ${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            const textY = y + r + fontSize + 2;
            ctx.fillText(node.name, x, textY);
        }

        ctx.restore();
    }, [hoverNode]);

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#050505', overflow: 'hidden' }}>

            {/* Back Button (Reset View) */}
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
                <button onClick={onBack} className="nav-btn" style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255,255,255,0.4)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '2px'
                }}>
                    ← Back to Orbit
                </button>
            </div>

            <div style={{ position: 'absolute', bottom: '2rem', width: '100%', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
                <button
                    onClick={onNext}
                    style={{
                        pointerEvents: 'auto',
                        background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem 3rem',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: '50px',
                        boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
                        cursor: 'pointer',
                        letterSpacing: '1px',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    EXPLORE OPPORTUNITIES
                </button>
            </div>

            <ForceGraph2D
                ref={fgRef as any}
                graphData={graphData}
                backgroundColor="#050505"
                nodeLabel="name"
                nodeVal="val"
                nodeCanvasObject={paintNode}
                onNodeHover={handleNodeHover}
                onNodeClick={handleNodeClick}
                linkColor={() => 'rgba(255,255,255,0.2)'}
                linkWidth={1.5}
                d3AlphaDecay={0.01}
                d3VelocityDecay={0.4} // Low friction for drift
            />
        </div>
    );
}
