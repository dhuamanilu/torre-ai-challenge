import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import ForceGraph2D, { ForceGraphMethods } from 'react-force-graph-2d';
import { useApp } from '../../context/AppContext';
import { SKILL_CATEGORIES } from '../../utils/skillCategorizer';

export function ProfileGraph({ onNext, onBack }: { onNext: () => void, onBack: () => void }) {
    const { profile } = useApp();
    const fgRef = useRef<ForceGraphMethods>(null);
    const [highlightNodes, setHighlightNodes] = useState(new Set());
    const [highlightLinks, setHighlightLinks] = useState(new Set());
    const [hoverNode, setHoverNode] = useState<any>(null);

    // Color Palette per Category
    const CATEGORY_COLORS: Record<string, string> = {
        'Frontend': '#d946ef', // Magenta
        'Backend': '#3b82f6',  // Blue
        'Mobile': '#10b981',   // Emerald
        'Tools': '#f59e0b',    // Amber
        'General': '#8b5cf6',  // Violet
        'Other': '#64748b'     // Slate
    };

    const graphData = useMemo(() => {
        if (!profile) return { nodes: [], links: [] };

        const nodes: any[] = [];
        const links: any[] = [];

        // Root Node (The User)
        nodes.push({
            id: 'root',
            name: profile.person.name,
            val: 20,
            color: '#ffffff',
            type: 'root'
        });

        // Category Nodes
        const categories = Object.keys(SKILL_CATEGORIES);
        if (!categories.includes('Other')) categories.push('Other'); // Ensure Other exists

        categories.forEach(cat => {
            nodes.push({
                id: cat,
                name: cat,
                val: 10,
                color: CATEGORY_COLORS[cat] || '#888',
                type: 'category'
            });
            links.push({ source: 'root', target: cat });
        });

        // Skill Nodes
        profile.strengths.slice(0, 40).forEach(skill => {
            let parent = 'Other';
            const sName = skill.name.toLowerCase();

            for (const [cat, keywords] of Object.entries(SKILL_CATEGORIES)) {
                if (keywords.some(k => sName.includes(k))) {
                    parent = cat;
                    break;
                }
            }
            if (!categories.includes(parent)) parent = 'Other';

            nodes.push({
                id: skill.id,
                name: skill.name,
                val: skill.proficiency === 'master' ? 6 : 4,
                color: CATEGORY_COLORS[parent] || '#64748b',
                type: 'skill'
            });
            links.push({ source: parent, target: skill.id });
        });

        return { nodes, links };
    }, [profile]);

    // Physics Engine Tuning
    useEffect(() => {
        if (fgRef.current) {
            fgRef.current.d3Force('charge')?.strength(-100);
            fgRef.current.d3Force('link')?.distance(70);
            fgRef.current.d3Force('collide')?.radius((node: any) => (node.val || 4) * 2.5);
        }
    }, [graphData]);

    // Cleanup: Removed d3ReheatSimulation loop to prevent flickering/lag

    const handleNodeHover = (node: any) => {
        setHoverNode(node);
        const newHighlights = new Set<string>();
        const newLinks = new Set<string>();

        if (node) {
            newHighlights.add(node.id);
            node.neighbors?.forEach((neighbor: any) => newHighlights.add(neighbor.id));
            node.links?.forEach((link: any) => newLinks.add(link));
        }

        setHighlightNodes(newHighlights);
        setHighlightLinks(newLinks);

        document.body.style.cursor = node ? 'pointer' : 'default';
    };

    // Optimized Canvas Rendering (Simple Layers)
    const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        // SAFETY: Check coordinates
        if (!Number.isFinite(node.x) || !Number.isFinite(node.y)) return;

        const isHovered = node === hoverNode;
        const isNeighbor = highlightNodes.has(node.id);
        const isDimmed = hoverNode && !isHovered && !isNeighbor;

        const label = node.name;
        const fontSize = 12 / globalScale;
        const r = node.val || 4;
        const x = node.x;
        const y = node.y;

        ctx.save();

        if (isDimmed) {
            ctx.globalAlpha = 0.1;
        }

        // Draw Glow (Simple Alpha Circle - Faster than Gradient)
        ctx.beginPath();
        const glowRadius = isHovered ? r * 4 : r * 2.5;
        ctx.arc(x, y, glowRadius, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || '#fff';
        ctx.globalAlpha = isDimmed ? 0.05 : 0.15;
        ctx.fill();

        // Draw Core
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = node.color || '#fff';
        ctx.globalAlpha = isDimmed ? 0.2 : 1;
        ctx.fill();

        // Draw Label
        if (node.type === 'root' || node.type === 'category' || isHovered || globalScale > 2) {
            ctx.globalAlpha = isDimmed ? 0.2 : 0.9;
            ctx.font = `${node.type === 'root' ? 'bold' : ''} ${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            const textY = y + r + fontSize + 2;
            ctx.fillText(label, x, textY);
        }

        ctx.restore();
    }, [hoverNode, highlightNodes]);

    return (
        <div style={{ position: 'fixed', inset: 0, background: '#050505', overflow: 'hidden' }}>
            {/* UI Overlay */}
            <div style={{ position: 'absolute', top: '2rem', left: '2rem', zIndex: 10 }}>
                <button onClick={onBack} className="nav-btn" style={{ padding: '0.8rem 1.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                    ← BACK TO GALAXY
                </button>
            </div>

            <div style={{ position: 'absolute', bottom: '3rem', width: '100%', textAlign: 'center', zIndex: 10, pointerEvents: 'none' }}>
                <button
                    onClick={onNext}
                    style={{
                        pointerEvents: 'auto',
                        background: 'linear-gradient(45deg, #d946ef, #8b5cf6)',
                        border: 'none',
                        color: 'white',
                        padding: '1rem 3rem',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        borderRadius: '50px',
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
                        cursor: 'pointer'
                    }}
                >
                    EXPLORE OPPORTUNITIES 🚀
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
                linkColor={() => 'rgba(255,255,255,0.15)'}
                linkWidth={1}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.4}
                onEngineStop={() => fgRef.current?.zoomToFit(400, 50)}
            />
        </div>
    );
}
