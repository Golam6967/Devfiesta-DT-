import React, { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useHackathons } from '../hooks/HackathonContext';

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FilterCheckbox = ({ label, value, onChange, checked }) => (
    <label className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer">
        <input type="checkbox" value={value} onChange={onChange} checked={checked} className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
        <span className="text-sm">{label}</span>
    </label>
);

const FilterGroup = ({ title, children }) => (
    <div className="mb-8">
        <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
        <div className="space-y-3">{children}</div>
    </div>
);

const getHackathonStatus = (startDateStr, endDateStr) => {
    const now = new Date();
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (now > end) return { text: 'Ended' };
    if (now >= start && now <= end) return { text: 'Running' };
    const daysLeft = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
    return { text: 'Upcoming', timeLeft: `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left` };
};

const getStatusClasses = (statusText) => {
    switch (statusText) {
        case 'Running': return 'bg-emerald-500/15 text-emerald-300';
        case 'Ended': return 'bg-red-500/15 text-red-300';
        case 'Upcoming': return 'bg-indigo-500/15 text-indigo-300';
        default: return 'bg-white/10 text-gray-300';
    }
};

const HackathonCard = ({ info }) => {
    const navigateto = useNavigate();
    const status = getHackathonStatus(info.starting_date, info.ending_date);
    const statusClasses = getStatusClasses(status.text);

    return (
        <div
            onClick={() => navigateto('/viewhackathon', { state: { hackathon: info } })}
            className="df-card overflow-hidden hover:border-white/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
            <div className="h-36 w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
                {info.hackathon_image ? (
                    <img
                        src={info.hackathon_image}
                        alt={`${info.hackathon_name} banner`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-5xl font-display font-extrabold text-white/30">
                        {info.hackathon_name.charAt(0)}
                    </span>
                )}
                <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Globe size={12} />
                    {info.genre}
                </span>
            </div>
            <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">{info.hackathon_name}</h3>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className={`${statusClasses} font-semibold px-3 py-1 rounded-full`}>
                        {status.text === 'Upcoming' ? status.timeLeft : status.text}
                    </span>
                    <span className="text-gray-500">
                        {info.starting_date?.split('T')[0]} - {info.ending_date?.split('T')[0]}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Hackathons = () => {
    const { hackathons, Loading } = useHackathons();
    const [searchParams] = useSearchParams();

    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedDurations, setSelectedDurations] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [activeSort, setActiveSort] = useState('');
    const [filteredHackathons, setFilteredHackathons] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let tempHackathons = hackathons || [];

        if (searchTerm.trim() !== '') {
            tempHackathons = tempHackathons.filter(h => h.hackathon_name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (selectedGenre) {
            tempHackathons = tempHackathons.filter(h => h.genre === selectedGenre);
        }
        if (selectedDurations.length > 0) {
            tempHackathons = tempHackathons.filter(h => selectedDurations.includes(h.duration));
        }
        if (selectedStatuses.length > 0) {
            tempHackathons = tempHackathons.filter(h => selectedStatuses.includes(getHackathonStatus(h.starting_date, h.ending_date).text));
        }

        const sortedHackathons = [...tempHackathons];
        if (activeSort === 'submission') {
            sortedHackathons.sort((a, b) => new Date(a.ending_date) - new Date(b.ending_date));
        } else if (activeSort === 'recent') {
            sortedHackathons.sort((a, b) => new Date(b.added_date) - new Date(a.added_date));
        }

        setFilteredHackathons(sortedHackathons);
    }, [searchTerm, selectedGenre, selectedDurations, selectedStatuses, activeSort, hackathons]);

    const handleDurationChange = (event) => {
        const { value, checked } = event.target;
        setSelectedDurations(prev => checked ? [...prev, value] : prev.filter(d => d !== value));
    };

    const handleStatusChange = (event) => {
        const { value, checked } = event.target;
        setSelectedStatuses(prev => checked ? [...prev, value] : prev.filter(s => s !== value));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setSelectedDurations([]);
        setSelectedStatuses([]);
        setActiveSort('');
    };

    if (Loading) {
        return <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">Loading hackathons...</div>;
    }

    return (
        <div className="df-page df-glow-bg">
            <header className="text-center py-16 px-4">
                <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white">
                    Explore hackathons and test your skills
                </h1>
            </header>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                <div className="relative flex items-center mb-10 max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <SearchIcon />
                    </div>
                    <input
                        type="search"
                        placeholder="Search by hackathon title or keyword"
                        className="df-input pl-12 h-14 text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="lg:grid lg:grid-cols-4 lg:gap-12">
                    <aside className={`lg:col-span-1 lg:block ${showFilters ? 'block' : 'hidden'} mb-8 lg:mb-0`}>
                        <div className="df-card p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold text-white">Filters</h2>
                                <button onClick={clearAllFilters} className="text-sm df-text-gradient font-semibold hover:opacity-80">Clear</button>
                            </div>

                            <FilterGroup title="Status">
                                <FilterCheckbox label="Upcoming" value="Upcoming" onChange={handleStatusChange} checked={selectedStatuses.includes('Upcoming')} />
                                <FilterCheckbox label="Running" value="Running" onChange={handleStatusChange} checked={selectedStatuses.includes('Running')} />
                                <FilterCheckbox label="Ended" value="Ended" onChange={handleStatusChange} checked={selectedStatuses.includes('Ended')} />
                            </FilterGroup>

                            <FilterGroup title="Duration">
                                <FilterCheckbox label="12hr" value="12" onChange={handleDurationChange} checked={selectedDurations.includes('12')} />
                                <FilterCheckbox label="24hr" value="24" onChange={handleDurationChange} checked={selectedDurations.includes('24')} />
                                <FilterCheckbox label="48hr" value="48" onChange={handleDurationChange} checked={selectedDurations.includes('48')} />
                            </FilterGroup>

                            <FilterGroup title="Genre">
                                <select className="df-input text-sm" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)}>
                                    <option value="">All Genres</option>
                                    <option value="Web Development">Web Development</option>
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
                            </FilterGroup>
                        </div>
                    </aside>

                    <main className="lg:col-span-3">
                        <div className="flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-5 mb-8 gap-4">
                            <p className="text-sm text-gray-400">Showing {filteredHackathons.length} hackathons</p>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="font-semibold text-gray-400 mr-1">Sort:</span>
                                <button onClick={() => setActiveSort('submission')} className={`px-3 py-1.5 rounded-md ${activeSort === 'submission' ? 'df-text-gradient font-bold bg-white/10' : 'text-gray-400 hover:text-white'}`}>
                                    Submission date
                                </button>
                                <button onClick={() => setActiveSort('recent')} className={`px-3 py-1.5 rounded-md ${activeSort === 'recent' ? 'df-text-gradient font-bold bg-white/10' : 'text-gray-400 hover:text-white'}`}>
                                    Recently added
                                </button>
                            </div>
                        </div>

                        <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden w-full mb-6 df-btn-secondary">
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {filteredHackathons.length > 0 ? (
                                filteredHackathons.map((info) => <HackathonCard key={info.hackathon_id} info={info} />)
                            ) : (
                                <div className="col-span-full text-center py-16 df-card">
                                    <h3 className="text-xl font-bold text-white">No hackathons found</h3>
                                    <p className="text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Hackathons;
