import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trash2, Users } from 'lucide-react';
import axios from 'axios';
import { userContext } from '../hooks/AutoAuth';
import { API_BASE_URL } from '../utils/api';

export default function RegisterTeam() {
    const location = useLocation();
    const navigate = useNavigate();
    const { User } = userContext();
    const hackathon = location.state?.hackathon;

    const [teamName, setTeamName] = useState('');
    const [teamInfo, setTeamInfo] = useState('');
    const [members, setMembers] = useState(['']);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!hackathon?.hackathon_id) {
        return (
            <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">
                No hackathon selected. Go back and open a hackathon first.
            </div>
        );
    }

    const handleMemberChange = (index, value) => {
        setMembers((prev) => prev.map((m, i) => (i === index ? value : m)));
    };

    const addMemberField = () => setMembers((prev) => [...prev, '']);
    const removeMemberField = (index) => setMembers((prev) => prev.filter((_, i) => i !== index));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const teammateUsernames = members.map((m) => m.trim()).filter(Boolean);
        const myUsername = User?.user?.username;
        if (!myUsername) {
            setError('You need to be logged in to register a team.');
            return;
        }

        const team_participants = Array.from(new Set([myUsername, ...teammateUsernames]));

        if (!teamName.trim()) {
            setError('Team name is required.');
            return;
        }

        const token = localStorage.getItem('token');
        setSubmitting(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/participation/create`, {
                hackathon_id: hackathon.hackathon_id,
                team_name: teamName,
                team_info: teamInfo,
                team_participants,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const team_id = res.data?.data?.team_id;
            navigate('/addproject', { state: { hackathon, team_id } });
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to register team. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h2 className="font-display font-bold text-3xl text-white">Register Your Team</h2>
                    <p className="text-gray-400 mt-2">Joining {hackathon.hackathon_name}. You'll be added automatically — just add your teammates.</p>
                </div>

                <form onSubmit={handleSubmit} className="df-card p-8 flex flex-col gap-4">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
                            {error}
                        </div>
                    )}

                    <input required value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Team name" className="df-input" />
                    <textarea value={teamInfo} onChange={(e) => setTeamInfo(e.target.value)} placeholder="Briefly describe what your team is building (optional)" className="df-input min-h-[80px]" />

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-3">
                            <Users size={16} /> Teammates (usernames)
                        </label>
                        <div className="space-y-3">
                            {members.map((member, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        value={member}
                                        onChange={(e) => handleMemberChange(idx, e.target.value)}
                                        placeholder={`Teammate ${idx + 1} username`}
                                        className="df-input flex-grow"
                                    />
                                    {members.length > 1 && (
                                        <button type="button" onClick={() => removeMemberField(idx)} className="p-2.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addMemberField} className="mt-3 df-btn-secondary w-full text-sm">
                            + Add another teammate
                        </button>
                    </div>

                    <button type="submit" disabled={submitting} className="df-btn-primary w-full mt-2">
                        {submitting ? 'Registering...' : 'Register Team'}
                    </button>
                </form>
            </div>
        </div>
    );
}
