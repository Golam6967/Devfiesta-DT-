import React from 'react';
import { useLocation } from 'react-router-dom';
import { FaGithub } from "react-icons/fa";
import { Tag } from 'lucide-react';

const parseFeatures = (featuresString) => {
    if (Array.isArray(featuresString)) return featuresString;
    if (typeof featuresString !== 'string' || !featuresString) return [];
    try {
        const features = JSON.parse(featuresString);
        return Array.isArray(features) ? features : [];
    } catch {
        return [];
    }
};

export default function Viewproject() {
    const location = useLocation();
    const project = location.state?.project;

    const displayProject = project || {
        project_name: '',
        project_genre: '',
        git_repo: '',
        motivation: '',
        overview: '',
        features: [],
        project_image: '',
    };

    const features = parseFeatures(displayProject.features);

    const openRepo = () => {
        if (displayProject.git_repo) {
            window.open(displayProject.git_repo, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="df-page df-glow-bg p-4 sm:p-6 lg:p-8 2xl:p-12">
            <main className="max-w-screen-2xl mx-auto py-8">
                <header className="mb-10 text-center">
                    <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">{displayProject.project_name}</h1>
                    <p className="text-lg text-gray-400 mt-2">{displayProject.project_genre}</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col gap-8">
                        <section className="df-card p-6">
                            <h2 className="text-2xl font-bold text-white mb-4">Project Showcase</h2>
                            <div className="w-full aspect-video rounded-lg flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
                                {displayProject.project_image ? (
                                    <img
                                        src={displayProject.project_image}
                                        alt={`${displayProject.project_name} showcase`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="text-6xl font-display font-extrabold text-white/30">
                                        {displayProject.project_name?.charAt(0)}
                                    </span>
                                )}
                            </div>
                        </section>

                        <section className="df-card p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                            <p className="text-gray-300 leading-relaxed">{displayProject.overview}</p>
                        </section>

                        <section className="df-card p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-white mb-4">Motivation</h2>
                            <p className="text-gray-300 leading-relaxed">{displayProject.motivation}</p>
                        </section>
                    </div>

                    <div className="flex flex-col gap-8">
                        <section className="df-card p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-5">Repository</h2>
                            <button
                                onClick={openRepo}
                                disabled={!displayProject.git_repo}
                                className="df-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FaGithub size={20} />
                                <span>View on GitHub</span>
                            </button>
                        </section>

                        <section className="df-card p-6 md:p-8">
                            <h2 className="text-xl font-bold text-white mb-4">Features</h2>
                            {features.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {features.map((feature, idx) => (
                                        <span key={idx} className="bg-white/10 text-gray-200 text-sm font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                            <Tag size={12} />
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No features listed.</p>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
