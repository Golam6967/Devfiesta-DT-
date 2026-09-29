import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Calendar, Globe, Award, ChevronRight, Trophy } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const formatDuration = (ms) => {
    if (ms <= 0) return '0s';
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
};

const useCountdown = (startDateStr, endDateStr) => {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now > end) return { phase: 'ended', label: 'Hackathon ended', classes: 'bg-red-500/15 text-red-300' };
    if (now >= start) return { phase: 'running', label: `Ends in ${formatDuration(end - now)}`, classes: 'bg-emerald-500/15 text-emerald-300' };
    return { phase: 'upcoming', label: `Starts in ${formatDuration(start - now)}`, classes: 'bg-indigo-500/15 text-indigo-300' };
};

const Leaderboard = ({ hackathonId, isHost }) => {
    const [rows, setRows] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [declaring, setDeclaring] = useState(false);
    const [championMessage, setChampionMessage] = useState('');
    const [error, setError] = useState('');

    const fetchLeaderboard = () => {
        const token = localStorage.getItem('token');
        if (!token || !hackathonId) return;

        setLoading(true);
        axios.get(`${API_BASE_URL}/participation/leaderboard/${hackathonId}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            setRows(res.data?.data?.leaderboard || []);
        }).catch(() => {
            setRows([]);
        }).finally(() => setLoading(false));
    };

    const handleToggle = () => {
        if (!isOpen && rows === null) fetchLeaderboard();
        setIsOpen((prev) => !prev);
    };

    const handleDeclareChampion = async () => {
        const token = localStorage.getItem('token');
        setDeclaring(true);
        setError('');
        try {
            const res = await axios.post(
                `${API_BASE_URL}/notifications/hackathon/${hackathonId}/declare-champion`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setChampionMessage(res.data?.data?.message || 'Champion declared!');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to declare champion.');
        } finally {
            setDeclaring(false);
        }
    };

    return (
        <div className="mt-14 border-t border-white/10 pt-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-amber-400" /> Leaderboard
                </h2>
                <button onClick={handleToggle} className="df-btn-secondary !py-2 !px-4 text-sm">
                    {isOpen ? 'Hide Leaderboard' : 'View Leaderboard'}
                </button>
            </div>

            {isOpen && (
                <div className="mt-5">
                    {loading || rows === null ? (
                        <p className="text-gray-400">Loading leaderboard...</p>
                    ) : (
                        <>
                            {isHost && rows.length > 0 && (
                                <div className="flex justify-end mb-4">
                                    <button onClick={handleDeclareChampion} disabled={declaring} className="df-btn-primary !py-2 !px-4 text-sm">
                                        {declaring ? 'Declaring...' : 'Declare Champion'}
                                    </button>
                                </div>
                            )}

                            {championMessage && (
                                <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm px-4 py-3">
                                    {championMessage}
                                </div>
                            )}
                            {error && (
                                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
                                    {error}
                                </div>
                            )}

                            {rows.length === 0 ? (
                                <p className="text-gray-400">No scores submitted yet.</p>
                            ) : (
                                <div className="df-card divide-y divide-white/10 overflow-hidden">
                                    {rows.map((row) => (
                                        <div key={row.team_id} className="flex items-center justify-between px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${row.team_rank == 1 ? 'bg-amber-400 text-black' : row.team_rank == 2 ? 'bg-gray-300 text-black' : row.team_rank == 3 ? 'bg-amber-700 text-white' : 'bg-white/10 text-gray-300'}`}>
                                                    {row.team_rank}
                                                </span>
                                                <span className="font-semibold text-white">{row.team_name}</span>
                                            </div>
                                            <span className="df-text-gradient font-bold">{Number(row.total_marks) || 0} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const ViewHackathonPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [role, setRole] = useState('No Role');

    const finalData = location?.state?.hackathon || location?.state?.finalData;

    useEffect(() => {
        if (!finalData?.hackathon_id) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        axios.get(`${API_BASE_URL}/hackathon/role/${finalData.hackathon_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            const roleRow = res.data?.data?.role?.[0];
            if (roleRow?.role) setRole(roleRow.role);
        }).catch((err) => console.error('Failed to fetch role:', err));
    }, [finalData?.hackathon_id]);

    const countdown = useCountdown(finalData?.starting_date, finalData?.ending_date);

    const handleAddProject = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${API_BASE_URL}/participation/hackathon/${finalData.hackathon_id}/my-team`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const myTeam = Array.isArray(res.data) ? res.data[0] : null;
            navigate('/addproject', { state: { hackathon: finalData, team_id: myTeam?.team_id } });
        } catch (err) {
            console.error('Failed to look up your team:', err);
            navigate('/addproject', { state: { hackathon: finalData } });
        }
    };

    if (!finalData) {
        return (
            <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">
                Nothing to show.
            </div>
        );
    }

    return (
        <div className="df-page df-glow-bg">
            <div className="h-64 sm:h-80 w-full overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative">
                {finalData.hackathon_image ? (
                    <img
                        src={finalData.hackathon_image}
                        className="w-full h-full object-cover"
                        alt="Hackathon banner"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-8xl font-display font-extrabold text-white/20">
                        {finalData.hackathon_name?.charAt(0)}
                    </span>
                )}
            </div>

            <main className="max-w-6xl mx-auto py-14 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white">{finalData?.hackathon_name}</h1>

                        <div className="mt-8 flex flex-wrap gap-3">
                            {role === 'Host' && (
                                <>
                                    <button onClick={() => navigate('/hackathon-teams', { state: { hackathon: finalData } })} className="df-btn-primary">View Teams & Projects</button>
                                    <Link to="/judges" state={{ ID: finalData?.hackathon_id }} className="df-btn-secondary">View Judges</Link>
                                </>
                            )}

                            {role === 'Judge' && (
                                <>
                                    <button onClick={() => navigate('/markingpage', { state: { hackathon: finalData } })} className="df-btn-primary">Add Marks</button>
                                    <button onClick={() => navigate('/hackathon-teams', { state: { hackathon: finalData } })} className="df-btn-secondary">View Teams & Projects</button>
                                </>
                            )}

                            {role === 'Participant' && (
                                <button onClick={handleAddProject} className="df-btn-primary">Add Project</button>
                            )}

                            {role === 'No Role' && (
                                <button onClick={() => navigate('/register-team', { state: { hackathon: finalData } })} className="df-btn-primary">Register Your Team</button>
                            )}
                        </div>

                        <div className="mt-14 border-t border-white/10 pt-8">
                            <h2 className="text-2xl font-bold text-white">Who can participate</h2>
                            <ul className="mt-5 list-disc list-inside text-gray-400 space-y-2">
                                <li>Above legal age of majority in country of residence</li>
                                <li>All countries/territories, excluding standard exceptions</li>
                            </ul>
                            {finalData?.rule_book && (
                                <a href={finalData.rule_book} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-1 df-text-gradient font-semibold hover:opacity-80">
                                    View full rules <ChevronRight className="h-4 w-4" />
                                </a>
                            )}
                        </div>

                        <Leaderboard hackathonId={finalData?.hackathon_id} isHost={role === 'Host'} />
                    </div>

                    <aside>
                        <div className="df-card p-6">
                            <p className={`text-sm font-bold px-3 py-1.5 rounded-full inline-block ${countdown.classes}`}>
                                {countdown.label}
                            </p>

                            <div className="mt-6 flex flex-col text-gray-300 gap-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <span>Starts: {finalData.starting_date?.split('T')[0]}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-gray-500" />
                                    <span>Ends: {finalData.ending_date?.split('T')[0]}</span>
                                </div>
                            </div>

                            <div className="mt-6 border-t border-white/10 pt-6 space-y-4 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center text-gray-400"><Globe className="h-4 w-4 mr-2" /> Genre</span>
                                    <span className="font-semibold text-white">{finalData?.genre}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center text-gray-400"><Award className="h-4 w-4 mr-2" /> Duration</span>
                                    <span className="font-semibold text-white">{finalData?.duration}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

export default ViewHackathonPage;
