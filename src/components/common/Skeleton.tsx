import React from 'react';
import './Skeleton.css';

interface SkeletonProps {
    type?: 'text' | 'rect' | 'circle';
    width?: string | number;
    height?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export function Skeleton({
    type = 'text',
    width,
    height,
    className = '',
    style
}: SkeletonProps) {
    const styles: React.CSSProperties = {
        width,
        height,
        ...style,
    };

    return (
        <span
            className={`skeleton skeleton-${type} ${className}`}
            style={styles}
            aria-hidden="true"
        />
    );
}

export function ProfileSkeleton() {
    return (
        <div className="profile-summary-card skeleton-card">
            <div className="profile-summary-header">
                <Skeleton type="circle" width={60} height={60} />
                <div className="profile-summary-info">
                    <Skeleton type="text" width="60%" height={24} style={{ marginBottom: 8 }} />
                    <Skeleton type="text" width="40%" height={16} />
                    <Skeleton type="text" width="30%" height={14} style={{ marginTop: 8 }} />
                </div>
            </div>
            <div className="top-skills">
                <Skeleton type="text" width="40%" height={20} style={{ marginBottom: 16 }} />
                <div className="top-skills-list">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Skeleton key={i} type="rect" width={80} height={32} style={{ borderRadius: 16 }} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function AnalysisSkeleton() {
    return (
        <div className="results-section">
            <div className="comparison-header">
                <div className="profile-card">
                    <Skeleton type="circle" width={50} height={50} />
                    <div className="profile-info">
                        <Skeleton type="text" width={120} height={20} />
                        <Skeleton type="text" width={100} height={14} />
                    </div>
                </div>

                <div className="score-container">
                    <Skeleton type="circle" width={90} height={90} />
                    <Skeleton type="text" width={80} height={20} style={{ marginTop: 10 }} />
                </div>

                <div className="radar-chart-wrapper">
                    <Skeleton type="circle" width={200} height={200} />
                </div>
            </div>

            <div className="skills-breakdown">
                {[1, 2, 3].map(cat => (
                    <div key={cat} className="skill-category">
                        <Skeleton type="text" width={150} height={24} style={{ marginBottom: 16 }} />
                        <div className="skill-list">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} type="rect" width={100} height={32} style={{ borderRadius: 4 }} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
