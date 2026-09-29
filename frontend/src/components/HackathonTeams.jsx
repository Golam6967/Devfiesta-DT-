import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Github, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const TeamCard = ({ team, navigate }) => {
    const [members, setMembers] = useState(null);
    const [project, setProject] = useState(null);
    const [loadingProject, setLoadingProject] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get(`${API_BASE_URL}/participation/members/${team.team_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            setMembers(res.data?.data?.members || []);
        }).catch(() => setMembers([]));

        axios.get(`${API_BASE_URL}/project/team/${team.team_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            const projects = res.data?.data?.project;
            setProject(projects?.[0] || null);
        }).catch(() => setProject(null))
            .finally(() => setLoadingProject(false));
    }, [team.team_id]);

    return (
        <div className="df-card p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white">{team.team_name}</h3>
                    {team.team_info && <p className="text-sm text-gray-400 mt-1">{team.team_info}</p>}
                </div>
                <span className="bg-white/10 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1.5">
                    <Users size={12} /> {members === null ? '...' : members.length} members
                </span>
            </div>

            <div className="mb-4">
                <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Team members</h4>
                {members === null ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : members.length === 0 ? (
                    <p className="text-gray-500 text-sm">No members found.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {members.map((m) => (
                            <span key={m.username} className="bg-white/5 text-gray-200 text-sm px-3 py-1.5 rounded-full">
                                @{m.username}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t border-white/10">
                <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Submitted project</h4>
                {loadingProject ? (
                    <p className="text-gray-500 text-sm">Loading...</p>
                ) : project ? (
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-white">{project.project_name}</p>
                            <p className="text-sm text-gray-400 line-clamp-1">{project.overview}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                            {project.git_repo && (
                                <a href={project.git_repo} target="_blank" rel="noopener noreferrer" className="df-btn-secondary !py-1.5 !px-3 text-xs">
                                    <Github size={14} />
                                </a>
                            )}
                            <button onClick={() => navigate('/viewproject', { state: { project } })} className="df-btn-primary !py-1.5 !px-3 text-xs">
                                View <ExternalLink size={12} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm italic">No project submitted yet.</p>
                )}
            </div>
        </div>
    );
};

const HackathonTeams = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const hackathon = location.state?.hackathon;
    const [teams, setTeams] = useState(null);

    useEffect(() => {
        if (!hackathon?.hackathon_id) {
            setTeams([]);
            return;
        }
        const token = localStorage.getItem('token');
        axios.get(`${API_BASE_URL}/participation/hackathon/${hackathon.hackathon_id}`, {
            headers: { Authorization: `Bearer ${token}` },
        }).then((res) => {
            setTeams(res.data?.data?.teams || []);
        }).catch(() => setTeams([]));
    }, [hackathon?.hackathon_id]);

    return (
        <div className="df-page df-glow-bg">
            <header className="max-w-5xl mx-auto px-4 pt-16 pb-8">
                <h1 className="font-display font-bold text-3xl text-white">
                    Teams & Projects
                </h1>
                <p className="text-gray-400 mt-2">
                    {hackathon?.hackathon_name ? `Registered teams for ${hackathon.hackathon_name}.` : 'Registered teams for this hackathon.'}
                </p>
            </header>

            <main className="max-w-5xl mx-auto px-4 pb-16">
                {teams === null ? (
                    <p className="text-gray-400">Loading teams...</p>
                ) : teams.length === 0 ? (
                    <div className="df-card text-center py-16">
                        <p className="text-gray-400">No teams have registered for this hackathon yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {teams.map((team) => (
                            <TeamCard key={team.team_id} team={team} navigate={navigate} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default HackathonTeams;
