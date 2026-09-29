import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../utils/uploadImage';
import { API_BASE_URL } from '../utils/api';

const DRAFT_PROJECT_KEY = 'cofiesta_current_project_draft';

const initialProjectState = {
    project_name: '',
    project_genre: '',
    git_repo: '',
    motivation: '',
    overview: '',
    features: [],
    project_image: '',
};

const SectionCard = ({ title, children }) => (
    <section className="df-card p-8">
        <h2 className="font-display font-bold text-2xl text-white mb-6 pb-4 border-b border-white/10">{title}</h2>
        {children}
    </section>
);

export default function Addproject() {
    const navigateto = useNavigate();
    const location = useLocation();
    const team_id = location.state?.team_id;
    const [projectData, setProjectData] = useState(initialProjectState);
    const [newFeature, setNewFeature] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        const savedDraft = localStorage.getItem(DRAFT_PROJECT_KEY);
        if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            setProjectData(parsed);
            if (parsed.project_image) setImagePreview(parsed.project_image);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(DRAFT_PROJECT_KEY, JSON.stringify(projectData));
    }, [projectData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prev => ({ ...prev, [name]: value }));
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setProjectData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
            setNewFeature('');
        }
    };

    const removeFeature = (indexToRemove) => {
        setProjectData(prev => ({ ...prev, features: prev.features.filter((_, index) => index !== indexToRemove) }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImagePreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const imageUrl = await uploadImage(file);
            setProjectData(prev => ({ ...prev, project_image: imageUrl }));
        } catch (err) {
            console.error('Image upload failed:', err);
            setError('Image upload failed. Please try again.');
            setImagePreview('');
        } finally {
            setUploading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const token = localStorage.getItem('token');
        const User = JSON.parse(localStorage.getItem('user'));
        const username = User?.user?.username;

        if (!projectData.project_name || !projectData.project_genre) {
            setError('Please fill in the project name and genre.');
            return;
        }

        const dataToSubmit = team_id
            ? { ...projectData, features: JSON.stringify(projectData.features), team_id }
            : { ...projectData, features: JSON.stringify(projectData.features), username };
        const endpoint = team_id ? `${API_BASE_URL}/project/team-project` : `${API_BASE_URL}/project/create`;

        setSubmitting(true);
        try {
            await axios.post(endpoint, dataToSubmit, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            localStorage.removeItem(DRAFT_PROJECT_KEY);
            setProjectData(initialProjectState);
            setImagePreview('');
            navigateto('/profileinfo');
        } catch (err) {
            console.error("Submission failed:", err.response?.data || err.message);
            setError(err.response?.data?.error || 'Failed to submit project. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const openRepo = () => {
        if (projectData.git_repo && /^https?:\/\//i.test(projectData.git_repo)) {
            window.open(projectData.git_repo, '_blank', 'noopener,noreferrer');
        } else {
            setError('Please enter a valid repository URL starting with http:// or https://.');
        }
    };

    return (
        <div className="df-page df-glow-bg">
            <main className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="font-display font-extrabold text-4xl text-white text-center mb-10">Submit your project</h1>

                {error && (
                    <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
                    <SectionCard title="Project Info">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <input name="project_name" type="text" value={projectData.project_name} onChange={handleChange} placeholder="Project name" className="df-input" />
                            <input name="project_genre" type="text" value={projectData.project_genre} onChange={handleChange} placeholder="e.g. Web App, Game, Tool" className="df-input" />
                        </div>

                        <label className="block text-sm font-medium text-gray-300 mb-2">Showcase image (optional)</label>
                        <input id="project-image-upload" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} className="hidden" />
                        <label htmlFor="project-image-upload" className="cursor-pointer flex items-center justify-center gap-2 w-full df-btn-secondary">
                            <ImageIcon size={16} />
                            {uploading ? 'Uploading...' : projectData.project_image ? 'Change image' : 'Upload an image'}
                        </label>
                        {imagePreview && (
                            <div className="mt-4">
                                <img src={imagePreview} alt="Project preview" className="w-full h-auto max-h-56 rounded-lg object-cover" />
                            </div>
                        )}
                    </SectionCard>

                    <SectionCard title="GitHub Repository">
                        <div className="flex flex-col sm:flex-row items-stretch gap-3">
                            <input name="git_repo" type="url" value={projectData.git_repo} onChange={handleChange} placeholder="Enter GitHub repo URL" className="df-input flex-grow" />
                            <button type="button" onClick={openRepo} className="df-btn-secondary flex-shrink-0">Open</button>
                        </div>
                    </SectionCard>

                    <SectionCard title="Motivation">
                        <textarea name="motivation" value={projectData.motivation} onChange={handleChange} placeholder="What was your motivation for this project?" className="df-input min-h-[120px]" />
                    </SectionCard>

                    <SectionCard title="Overview">
                        <textarea name="overview" value={projectData.overview} onChange={handleChange} placeholder="Provide a brief overview of your project." className="df-input min-h-[120px]" />
                    </SectionCard>

                    <SectionCard title="Features">
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <input
                                type="text"
                                placeholder="Type a new feature..."
                                value={newFeature}
                                onChange={e => setNewFeature(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); } }}
                                className="df-input flex-grow"
                            />
                            <button type="button" onClick={addFeature} className="df-btn-secondary flex-shrink-0">Add</button>
                        </div>
                        <div className="flex flex-col gap-3">
                            {projectData.features.length === 0 ? (
                                <p className="text-gray-500 italic">No features added yet.</p>
                            ) : (
                                projectData.features.map((feature, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white/5 border-l-4 border-indigo-500 p-3 rounded-md">
                                        <span className="text-gray-200">{feature}</span>
                                        <button type="button" onClick={() => removeFeature(idx)} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none px-2">✕</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </SectionCard>

                    <div className="flex justify-center mt-4">
                        <button type="submit" disabled={submitting} className="df-btn-primary w-full md:w-1/2">
                            {submitting ? 'Submitting...' : 'Submit Project'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
