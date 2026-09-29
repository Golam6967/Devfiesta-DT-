import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaGithub, FaFileAlt, FaGraduationCap,
    FaSignOutAlt, FaExternalLinkAlt, FaCheckCircle, FaClock
} from "react-icons/fa";

export default function ProjectDashboard() {
    const navigate = useNavigate();
    const [submissions] = useState([
        { type: "Proposal Presentation", dueDate: "2024-01-15", status: "submitted", uploadedFile: "proposal_slides.pdf" },
        { type: "Progress Presentation", dueDate: "2024-02-20", status: "submitted", uploadedFile: "progress_slides.pdf" },
        { type: "Final Presentation", dueDate: "2024-03-25", status: "pending", uploadedFile: null },
    ]);
    const [githubLink] = useState("https://github.com/team-alpha/ecommerce");
    const [activeTab, setActiveTab] = useState("submissions");

    const total = submissions.length;
    const submitted = submissions.filter(sub => sub.status === "submitted").length;
    const progress = Math.round((submitted / total) * 100);

    return (
        <div className="df-page df-glow-bg">
            <header className="border-b border-white/10">
                <div className="max-w-5xl mx-auto px-4 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl df-btn-primary !p-0 flex items-center justify-center">
                            <FaGraduationCap className="text-white" size={20} />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-white">SPL Automation System</h1>
                            <p className="text-xs text-gray-400">Student Dashboard</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/pbl/login')} className="df-btn-secondary !py-2 !px-4 text-sm">
                        <FaSignOutAlt size={14} /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                    <div className="df-card p-6">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-400">Overall Progress</span>
                            <span className="text-2xl font-bold df-text-gradient">{progress}%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                    <div className="df-card p-6 flex justify-between items-center">
                        <div>
                            <span className="text-sm text-gray-400">Submissions</span>
                            <div className="text-2xl font-bold text-white mt-1">{submitted}/{total}</div>
                        </div>
                        <FaFileAlt className="text-indigo-400" size={28} />
                    </div>
                </div>

                <div className="flex gap-2 mb-8">
                    <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "submissions" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`} onClick={() => setActiveTab("submissions")}>
                        Submissions
                    </button>
                    <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "github" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`} onClick={() => setActiveTab("github")}>
                        GitHub Repository
                    </button>
                </div>

                {activeTab === "submissions" && (
                    <div className="df-card p-6">
                        <h2 className="font-bold text-white text-lg">Presentation Submissions</h2>
                        <p className="text-sm text-gray-400 mb-6">Track your presentation slides for each phase.</p>
                        <div className="space-y-4">
                            {submissions.map((submission, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <div>
                                            <span className="font-semibold text-white flex items-center gap-2">
                                                {submission.type}
                                                {submission.status === "submitted" ? <FaCheckCircle className="text-emerald-400" size={14} /> : <FaClock className="text-amber-400" size={14} />}
                                            </span>
                                            <p className="text-xs text-gray-500 mt-1">Due: {submission.dueDate}</p>
                                        </div>
                                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${submission.status === "submitted" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>
                                            {submission.status}
                                        </span>
                                    </div>
                                    {submission.status === "submitted" ? (
                                        <div className="flex items-center gap-2 text-emerald-300 text-sm mt-3">
                                            <FaFileAlt /> {submission.uploadedFile}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-amber-300 text-sm mt-3">
                                            No file uploaded yet
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "github" && (
                    <div className="df-card p-6">
                        <h2 className="font-bold text-white text-lg">GitHub Repository</h2>
                        <p className="text-sm text-gray-400 mb-6">Your project's linked repository.</p>
                        <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
                            <span className="text-gray-300 text-sm break-all">{githubLink}</span>
                            <a href={githubLink} target="_blank" rel="noopener noreferrer" className="df-btn-secondary !py-2 !px-4 text-sm">
                                <FaGithub size={14} /> Visit <FaExternalLinkAlt size={11} />
                            </a>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
