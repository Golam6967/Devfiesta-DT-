import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const JudgesPage = () => {
    const navigate = useNavigate();
    const [judges, setJudges] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { ID } = location.state || {};

    useEffect(() => {
        if (!ID) return;
        const getJudges = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_BASE_URL}/hackathon/judges/${ID}`);
                setJudges(response.data.data.judges || []);
            } catch (error) {
                console.error('Failed to load judges:', error);
            } finally {
                setLoading(false);
            }
        };
        getJudges();
    }, [ID]);

    if (loading) {
        return <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">Loading judges...</div>;
    }

    return (
        <div className="df-page df-glow-bg p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm">
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Back
                    </button>
                    <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white">Meet the Judges</h1>
                    <p className="mt-4 text-gray-400">Our panel of experts who will be evaluating the projects.</p>
                </header>

                {judges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {judges.map((judge) => (
                            <div key={judge.username} className="df-card overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                                <div className="h-40 bg-white/5 flex items-center justify-center">
                                    <img src={`https://placehold.co/400x300/1a1a2e/ffffff?text=${judge.username.slice(0, 2).toUpperCase()}`} alt={judge.username} className="w-full h-full object-cover" />
                                </div>
                                <div className="p-6 text-center">
                                    <h2 className="text-lg font-bold text-white">{judge.full_name}</h2>
                                    <p className="text-gray-400 mt-1 text-sm">@{judge.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="df-card text-center py-16">
                        <p className="text-gray-400">No judges have been added yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JudgesPage;
