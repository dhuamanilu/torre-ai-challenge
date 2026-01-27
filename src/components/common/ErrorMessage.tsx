import React from 'react';
import { useApp } from '../../context/AppContext';

export function ErrorMessage() {
    const { error, clearError } = useApp();

    if (!error) return null;

    return (
        <div className="error" role="alert">
            <span>{error}</span>
            <button
                onClick={clearError}
                className="error-close"
                aria-label="Dismiss error"
            >
                ×
            </button>
        </div>
    );
}
