import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/ProjectContext';
import { Tag, Calendar, Github, ExternalLink, Lightbulb, Search, SlidersHorizontal } from 'lucide-react';

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

const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
        return 'Invalid Date';
    }
};

const ProjectCard = ({ project }) => {
    const navigate = useNavigate();
    const features = parseFeatures(project.features);

    return (
        <div
            onClick={() => navigate('/viewproject', { state: { project } })}
            className="df-card overflow-hidden flex flex-col cursor-pointer hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200"
        >
            <div className="w-full h-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                {project.project_image ? (
                    <img
                        src={project.project_image}
                        alt={`${project.project_name} preview`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-3xl font-display font-extrabold text-white/30">
                        {project.project_name?.charAt(0)}
                    </span>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1 gap-2">
                    <h3 className="text-base font-bold text-white truncate">{project.project_name}</h3>
                    <span className="bg-indigo-500/15 text-indigo-300 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap">{project.project_genre}</span>
                </div>

                <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar size={12} className="mr-1.5" />
                    <span>{formatDate(project.creation_date)}</span>
                </div>

                <p className="text-gray-400 mb-3 flex-grow text-xs line-clamp-2">{project.overview}</p>

                <div className="flex items-start text-xs text-gray-300 italic mb-4 p-2 bg-amber-500/10 rounded-md">
                    <Lightbulb size={16} className="mr-2 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="line-clamp-2">{project.motivation}</p>
                </div>

                <div>
                    <h4 className="font-semibold text-gray-500 mb-2 text-xs uppercase tracking-wide">Features</h4>
                    <div className="flex flex-wrap gap-1.5">
                        {features.length > 0 ? (
                            features.slice(0, 3).map((feature, index) => (
                                <span key={index} className="bg-white/10 text-gray-300 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                                    <Tag size={10} className="mr-1" />
                                    {feature}
                                </span>
                            ))
                        ) : (
                            <p className="text-xs text-gray-500">No features listed.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white/5 p-3 flex justify-end items-center gap-2 border-t border-white/10">
                <a href={project.git_repo} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-300 bg-white/10 hover:bg-white/20 rounded-md transition-colors">
                    <Github size={14} /> GitHub
                </a>
                <a
                    href={project.demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => { e.stopPropagation(); if (!project.demo_link) e.preventDefault(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors ${project.demo_link ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-white/10 cursor-not-allowed opacity-50'}`}
                >
                    <ExternalLink size={14} /> Demo
                </a>
            </div>
        </div>
    );
};

const Projects = () => {
    const { projects, Loading } = useProjects();

    const [filteredProjects, setFilteredProjects] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [activeSort, setActiveSort] = useState('relevant');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let tempProjects = projects || [];

        if (searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            tempProjects = tempProjects.filter(p =>
                p.project_name.toLowerCase().includes(term) ||
                (p.overview && p.overview.toLowerCase().includes(term))
            );
        }
        if (selectedGenre) {
            tempProjects = tempProjects.filter(p => p.project_genre === selectedGenre);
        }

        const sortedProjects = [...tempProjects];
        if (activeSort === 'submission') {
            sortedProjects.sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date));
        }

        setFilteredProjects(sortedProjects);
    }, [projects, searchTerm, selectedGenre, activeSort]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setActiveSort('relevant');
    };

    if (Loading) {
        return <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">Loading projects...</div>;
    }

    return (
        <div className="df-page df-glow-bg">
            <header className="text-center py-16 px-4">
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white">Explore Projects</h1>
            </header>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="relative flex items-center mb-6 max-w-2xl mx-auto">
                    <Search className="absolute left-4 h-5 w-5 text-gray-500" />
                    <input
                        type="search"
                        placeholder="Search by project title or keyword"
                        className="df-input pl-12 h-14 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="mb-8 max-w-2xl mx-auto">
                    <button onClick={() => setShowFilters(!showFilters)} className="w-full df-btn-secondary">
                        <SlidersHorizontal size={18} />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </button>

                    {showFilters && (
                        <div className="mt-4 df-card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold text-white">Filters</h2>
                                <button onClick={handleClearFilters} className="text-sm df-text-gradient font-semibold hover:opacity-80">Clear All</button>
                            </div>
                            <select className="df-input" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                                <option value="">All Genres</option>
                                <option value="Web">Web</option>
                                <option value="App Development">App Development</option>
                                <option value="AI">AI</option>
                                <option value="Blockchain">Blockchain</option>
                                <option value="Cybersecurity">Cybersecurity</option>
                                <option value="Cloud / DevOps">Cloud / DevOps</option>
                                <option value="AR/VR / XR">AR/VR / XR</option>
                                <option value="Game Development">Game Development</option>
                                <option value="Data Science">Data Science</option>
                                <option value="University">University</option>
                            </select>
                        </div>
                    )}
                </div>

                <main>
                    <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-5 mb-8 gap-4">
                        <p className="text-sm text-gray-400">Showing {filteredProjects.length} projects</p>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold text-gray-400 mr-1">Sort:</span>
                            <button onClick={() => setActiveSort('relevant')} className={`px-3 py-1.5 rounded-md ${activeSort === 'relevant' ? 'df-text-gradient font-bold bg-white/10' : 'text-gray-400 hover:text-white'}`}>Most relevant</button>
                            <button onClick={() => setActiveSort('submission')} className={`px-3 py-1.5 rounded-md ${activeSort === 'submission' ? 'df-text-gradient font-bold bg-white/10' : 'text-gray-400 hover:text-white'}`}>Submission date</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((project) => <ProjectCard key={project.project_id} project={project} />)
                        ) : (
                            <div className="col-span-full text-center py-16 df-card">
                                <h3 className="text-xl font-bold text-white">No Projects Found</h3>
                                <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Projects;
