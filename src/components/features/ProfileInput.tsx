import React from 'react';
import { useApp } from '../../context/AppContext';
import { ProfileSkeleton } from '../common/Skeleton';

export function ProfileInput() {
    const {
        username,
        setUsername,
        profilePreview,
        loadingProfile,
        loading,
        loadProfile,
    } = useApp();

    return (
        <div className="input-group">
            <label htmlFor="username">Torre Username</label>
            <div className="search-row">
                <input
                    id="username"
                    type="text"
                    placeholder="e.g., torrenegra"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadProfile()}
                    disabled={loading || loadingProfile}
                    aria-label="Torre username input"
                />
                <button
                    className="search-btn"
                    onClick={() => loadProfile()}
                    disabled={loading || loadingProfile || !username.trim()}
                    aria-label="Load profile"
                >
                    {loadingProfile ? '...' : '👤'}
                </button>
            </div>
            <span className="hint">Enter username and click 👤 to preview your profile</span>

            {loadingProfile ? (
                <ProfileSkeleton />
            ) : profilePreview && (
                <div className="profile-summary-card">
                    <div className="profile-summary-header">
                        {profilePreview.person.pictureThumbnail && (
                            <img
                                src={profilePreview.person.pictureThumbnail}
                                alt={profilePreview.person.name}
                                className="profile-summary-image"
                            />
                        )}
                        <div className="profile-summary-info">
                            <h3>{profilePreview.person.name}</h3>
                            <p>{profilePreview.person.professionalHeadline}</p>
                            <span className="skill-count">
                                {profilePreview.strengths.length} skills on profile
                            </span>
                        </div>
                    </div>
                    <div className="top-skills">
                        <h4>🌟 Your Top Skills</h4>
                        <div className="top-skills-list">
                            {profilePreview.strengths
                                .sort((a, b) => (b.weight || 0) - (a.weight || 0))
                                .slice(0, 8)
                                .map((skill) => (
                                    <div key={skill.id} className="top-skill-tag">
                                        <span className="skill-name">{skill.name}</span>
                                        <span className="skill-proficiency">{skill.proficiency}</span>
                                        {skill.weight > 0 && (
                                            <span className="skill-weight">⭐ {Math.round(skill.weight)}</span>
                                        )}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
