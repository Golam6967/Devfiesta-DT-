import React, { useEffect, useState } from 'react';
import { userContext } from '../hooks/AutoAuth';
import axios from 'axios';
import { uploadImage } from '../utils/uploadImage';
import { API_BASE_URL } from '../utils/api';

const InputField = ({ label, placeholder, type = 'text', value = '', onChange, readOnly = false }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`df-input ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
    </div>
);

const SelectField = ({ label, options, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
        <select value={value} onChange={onChange} className="df-input appearance-none">
            <option value="" disabled className="bg-[#0d0d1a]">Select your institution</option>
            {options.map(option => (
                <option key={option} value={option} className="bg-[#0d0d1a]">{option}</option>
            ))}
        </select>
    </div>
);

const institutions = [
    "University of Dhaka",
    "Bangladesh University of Engineering and Technology (BUET)",
    "Islamic University of Technology (IUT)",
    "University of Rajshahi",
    "University of Chittagong",
    "Jahangirnagar University",
    "Khulna University",
    "Khulna University of Engineering & Technology (KUET)",
    "Rajshahi University of Engineering & Technology (RUET)",
    "Chittagong University of Engineering & Technology (CUET)",
    "North South University (NSU)",
    "BRAC University",
    "Independent University, Bangladesh (IUB)",
    "Ahsanullah University of Science and Technology (AUST)",
    "United International University (UIU)",
    "East West University (EWU)",
    "American International University-Bangladesh (AIUB)",
    "Daffodil International University (DIU)",
    "Bangladesh University of Business and Technology (BUBT)",
    "Premier University, Chittagong",
    "University of Liberal Arts Bangladesh (ULAB)",
    "Southeast University",
    "University of Asia Pacific (UAP)",
    "Bangladesh University of Professionals (BUP)"
];

const SettingsPage = () => {
    const { User, loading, uploadDetails } = userContext();
    const [institution, setInstitution] = useState('');
    const [image, setImage] = useState('');
    const [bios, setBios] = useState('');
    const [github, setGithub] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (User && User.user) {
            setInstitution(User.user.institution || '');
            setBios(User.user.bio || '');
            setGithub(User.user.github_link || '');
            const initials = (User.user.full_name || '??').slice(0, 2).toUpperCase();
            setImage(User.user.image || `https://placehold.co/96x96/1a1a2e/ffffff?text=${initials}`);
        }
    }, [User]);

    if (loading) {
        return <div className="df-page df-glow-bg flex items-center justify-center text-gray-400">Loading...</div>;
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const imageUrl = await uploadImage(file);
            setImage(imageUrl);
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);
        uploadDetails(image, institution, bios, github);
        try {
            const token = localStorage.getItem('token');
            User.user.github_link = github;
            User.user.institution = institution;
            User.user.bio = bios;
            User.user.image = image;
            await axios.put(`${API_BASE_URL}/auth/profile`, User.user, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (error) {
            console.error("Failed to save settings:", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="df-page df-glow-bg">
            <header className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                <h1 className="font-display font-bold text-4xl text-white">Settings</h1>
            </header>

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <section className="w-full max-w-2xl">
                    <form onSubmit={handleSubmit} className="df-card p-8 flex flex-col gap-8">
                        <div>
                            <h2 className="font-display font-bold text-2xl text-white">Profile info</h2>
                            <p className="text-gray-400 mt-1">This information will appear on your public profile.</p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-white/10 overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                                <img src={image} className="w-full h-full object-cover" alt="Profile" />
                            </div>
                            <label className="cursor-pointer df-btn-secondary !py-2 !px-4 text-sm">
                                Upload photo
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputField label="Full name" value={User?.user?.full_name} readOnly />
                            <InputField label="Email" value={User?.user?.email} readOnly />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                            <textarea
                                onChange={(e) => setBios(e.target.value)}
                                value={bios}
                                rows="4"
                                className="df-input"
                                placeholder="Tell us about yourself..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputField label="GitHub" onChange={(e) => setGithub(e.target.value)} value={github} placeholder="your-username" />
                            <SelectField label="Institution" options={institutions} value={institution} onChange={(e) => setInstitution(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-4">
                            <button type="submit" disabled={saving} className="df-btn-primary">
                                {saving ? 'Saving...' : 'Save changes'}
                            </button>
                            {saved && <span className="text-emerald-400 text-sm font-medium">Saved!</span>}
                        </div>
                    </form>
                </section>
            </main>
        </div>
    );
};

export default SettingsPage;
