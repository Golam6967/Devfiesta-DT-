import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Star, Check, ExternalLink } from 'lucide-react';

const ProjectJudgingCard = ({ project, scoringCriteria }) => {
    const [scores, setScores] = useState(() => {
        const initialScores = {};
        scoringCriteria.forEach(criterion => { initialScores[criterion.name] = 0; });
        return initialScores;
    });
    const [comments, setComments] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const handleScoreChange = (criterionName, value) => {
        const newScore = Math.max(0, Math.min(10, Number(value)));
        setScores(prev => ({ ...prev, [criterionName]: newScore }));
        setIsSaved(false);
    };

    const totalScore = scoringCriteria.reduce((sum, c) => sum + (scores[c.name] || 0), 0);
    const maxScore = scoringCriteria.length * 10;

    const handleSave = () => {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="df-card overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-semibold df-text-gradient">{project.team}</p>
                        <h3 className="text-xl font-bold text-white mt-1">{project.name}</h3>
                    </div>
                    <a href="#" className="text-gray-400 hover:text-white p-2">
                        <ExternalLink size={18} />
                    </a>
                </div>
                <p className="text-gray-400 mt-2 text-sm">{project.overview}</p>
            </div>

            <div className="bg-white/5 p-6 border-y border-white/10">
                <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wide">Scoring</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                    {scoringCriteria.map(criterion => (
                        <div key={criterion.name} className="flex items-center justify-between">
                            <label className="text-gray-300 text-sm">{criterion.name}</label>
                            <input
                                type="number"
                                value={scores[criterion.name]}
                                onChange={(e) => handleScoreChange(criterion.name, e.target.value)}
                                className="df-input w-20 text-center !py-1.5"
                                min="0"
                                max="10"
                            />
                        </div>
                    ))}
                </div>
                <div className="mt-5 pt-5 border-t border-white/10 flex justify-end items-center font-bold">
                    <span className="text-gray-400 mr-3 text-sm">Total:</span>
                    <span className="df-text-gradient">{totalScore} / {maxScore}</span>
                </div>
            </div>

            <div className="p-6">
                <label className="text-sm font-semibold text-white mb-2 block">Comments</label>
                <textarea
                    rows="3"
                    value={comments}
                    onChange={(e) => { setComments(e.target.value); setIsSaved(false); }}
                    placeholder="Provide constructive feedback..."
                    className="df-input"
                />
            </div>

            <div className="px-6 py-4 flex justify-end border-t border-white/10">
                <button onClick={handleSave} className={isSaved ? 'df-btn-secondary' : 'df-btn-primary'}>
                    {isSaved ? <Check size={18} /> : <Star size={18} />}
                    {isSaved ? 'Saved!' : 'Save Score'}
                </button>
            </div>
        </div>
    );
};

const Markingpage = () => {
    const location = useLocation();
    const hackathonData = location.state?.hackathon || { hackathon_name: 'Hackathon', criteria: [] };
    const projects = [];

    return (
        <div className="df-page df-glow-bg">
            <header className="border-b border-white/10 py-10 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">Project Judging</h1>
                    <p className="text-gray-400 mt-2">Review and score the submissions for {hackathonData.hackathon_name}.</p>
                </div>
            </header>
            <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {projects.map(project => (
                            <ProjectJudgingCard key={project.id} project={project} scoringCriteria={hackathonData.criteria} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 df-card">
                        <h2 className="text-xl font-semibold text-white">No projects submitted yet</h2>
                        <p className="mt-2 text-gray-400">Check back later once participants have submitted their projects.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Markingpage;
