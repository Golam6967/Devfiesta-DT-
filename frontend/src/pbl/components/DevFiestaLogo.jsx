import React from "react";

export default function DevFiestaLogo() {
    return (
        <div className="flex items-center gap-4">
            <svg width="56" height="56" viewBox="0 0 80 80" className="flex-shrink-0">
                <circle cx="40" cy="40" r="35" fill="#6366f1" />
                <polygon points="40,40 75,15 75,65" fill="#06060d" />
                <circle cx="28" cy="23" r="4" fill="#06060d" />
            </svg>
            <span className="font-display font-extrabold text-3xl df-text-gradient">
                DevFiesta
            </span>
        </div>
    );
}
