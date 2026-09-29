import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';
import { API_BASE_URL } from '../utils/api';

const StatItem = ({ value, label, onClick, isActive }) => (
    <div onClick={onClick} className={`text-center cursor-pointer p-3 rounded-lg transition-colors duration-200 ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
        <p className="text-xl font-bold">{value}</p>
        <p className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase">{label}</p>
    </div>
);

const ProjectCard = ({ project }) => {
    const goto = useNavigate();
    return (
        <div className="df-card overflow-hidden hover:border-white/20 transition-colors">
            <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">{project.project_name}</h3>
                <p className="text-sm font-medium df-text-gradient mb-3">{project.genre}</p>
                <p className="text-gray-400 text-sm h-16 overflow-hidden">{project.overview}</p>
            </div>
            <div className="bg-white/5 px-6 py-3 border-t border-white/10">
                <a onClick={() => goto('/viewproject', { state: { project } })} className="df-text-gradient hover:opacity-80 font-semibold text-sm cursor-pointer">View Project</a>
            </div>
        </div>
    )
};

const HackathonCard = ({ hackathon }) => {
    const goto = useNavigate();
    return (
        <div className="df-card overflow-hidden hover:border-white/20 transition-colors">
            {hackathon.hackathon_image && (
                <img src={hackathon.hackathon_image} className="w-full h-32 object-cover" alt={hackathon.hackathon_name} />
            )}
            <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">{hackathon.hackathon_name}</h3>
                <p className="text-sm font-medium df-text-gradient mb-3">{hackathon.genre}</p>
                <p className="text-gray-400 text-sm h-16 overflow-hidden">{hackathon.overview}</p>
            </div>
            <div className="bg-white/5 px-6 py-3 border-t border-white/10">
                <a onClick={() => goto('/viewhackathon', { state: { hackathon } })} className="df-text-gradient hover:opacity-80 font-semibold text-sm cursor-pointer">View Hackathon</a>
            </div>
        </div>
    )
};

const Profileinfo = () => {
    const navigateto = useNavigate();
    const { User, loading } = userContext();

    const [activeTab, setActiveTab] = useState('projects');
    const [projects, setProjects] = useState([]);
    const [hackathons, setHackathons] = useState([]);
    const [judgedhackathons, setjudgedHackathons] = useState([]);

    useEffect(() => {
        const fetchProjects = async (username, token) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/project/my-projects`, {
                    params: { username },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setProjects(response.data.data.projects || []);
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        const fetchHackathons = async (username, token) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/hackathon/my-hackathons`, {
                    params: { username },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setHackathons(response.data.data.hackathons || []);
            } catch (error) {
                console.error('Error fetching hackathons:', error);
            }
        };

        const fetchJudgedHackathons = async (username, token) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/hackathon/my-judged`, {
                    params: { username },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setjudgedHackathons(response.data.data.hackathons || []);
            } catch (error) {
                console.error('Error fetching judged hackathons:', error);
            }
        };

        const token = localStorage.getItem('token');
        const projectUser = JSON.parse(localStorage.getItem('user'));
        const username = projectUser?.user?.username;

        if (username && token) {
            fetchProjects(username, token);
            fetchHackathons(username, token);
            fetchJudgedHackathons(username, token);
        }
    }, []);

    if (loading) {
        return <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">Loading profile...</div>;
    }

    const placeholderText = User?.user?.username ? User.user.username.slice(0, 2).toUpperCase() : '..';
    const profileImage = User?.user?.image || `https://placehold.co/192x192/1a1a2e/ffffff?text=${placeholderText}`;

    return (
        <div className="df-page df-glow-bg">
            <div className="w-full max-w-6xl mx-auto p-4 sm:p-6">
                <div className="md:relative">
                    <div className="h-40 md:h-56 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-t-2xl" />

                    <div className="flex flex-col items-center -mt-16 md:flex-row md:items-end md:absolute md:top-28 md:left-8 md:gap-6">
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/10 border-4 border-[#06060d] shadow-lg overflow-hidden flex-shrink-0">
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                        </div>

                        <div className="text-center md:text-left mt-3 md:mt-0 md:pb-4">
                            <h1 className="text-2xl md:text-3xl font-bold text-white">
                                {User?.user?.full_name}
                                <span className="text-lg text-gray-400 font-medium block sm:inline sm:ml-2">@{User?.user?.username}</span>
                            </h1>
                            <Link to="/settings" className="text-sm df-text-gradient hover:opacity-80 mt-1 block font-medium">
                                Edit your personal info, bio, and location.
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="df-card rounded-t-none pt-6 md:pt-24 px-6 pb-6 mt-0">
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                        <button onClick={() => navigateto('/settings')} className="w-full sm:w-auto df-btn-primary !py-2.5">
                            Edit info & settings
                        </button>
                        <button onClick={() => navigateto('/addproject')} className="w-full sm:w-auto df-btn-secondary !py-2.5">
                            Add a new project
                        </button>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                        <div className="grid grid-cols-3 gap-2 text-center md:flex md:justify-start md:gap-6">
                            <StatItem value={projects.length} label="Projects" onClick={() => setActiveTab('projects')} isActive={activeTab === 'projects'} />
                            <StatItem value={hackathons.length} label="Hackathons" onClick={() => setActiveTab('hackathons')} isActive={activeTab === 'hackathons'} />
                            <StatItem value={judgedhackathons.length} label="Judged" onClick={() => setActiveTab('judged')} isActive={activeTab === 'judged'} />
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    {activeTab === 'projects' && (
                        <>
                            <h2 className="font-display font-bold text-2xl text-white mb-6">Projects</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {projects.length > 0 ? projects.map((p, i) => <ProjectCard key={i} project={p} />) : (
                                    <p className="text-gray-500 col-span-full text-center py-10">No projects yet.</p>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === 'hackathons' && (
                        <>
                            <h2 className="font-display font-bold text-2xl text-white mb-6">Hackathons</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {hackathons.length > 0 ? hackathons.map((h, i) => <HackathonCard key={i} hackathon={h} />) : (
                                    <p className="text-gray-500 col-span-full text-center py-10">No hackathons hosted yet.</p>
                                )}
                            </div>
                        </>
                    )}
                    {activeTab === 'judged' && (
                        <>
                            <h2 className="font-display font-bold text-2xl text-white mb-6">Judged Hackathons</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {judgedhackathons.length > 0 ? judgedhackathons.map((h, i) => <HackathonCard key={i} hackathon={h} />) : (
                                    <p className="text-gray-500 col-span-full text-center py-10">Not judging any hackathons yet.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profileinfo;
