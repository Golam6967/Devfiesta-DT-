import React, { useState } from "react";

export default function SPLAdminPage() {
    const [activeTab, setActiveTab] = useState("teams");
    const [teams] = useState([
        {
            id: 1,
            name: "Team Alpha",
            members: ["John Doe", "Jane Smith", "Bob Johnson"],
            supervisor: "Dr. Wilson",
            evaluators: ["Prof. Davis", "Dr. Brown"],
            project: "E-commerce Platform",
        },
        {
            id: 2,
            name: "Team Beta",
            members: ["Alice Cooper", "Mike Ross", "Sarah Connor"],
            supervisor: "Dr. Anderson",
            evaluators: ["Prof. Miller", "Dr. Taylor"],
            project: "Learning Management System",
        },
    ]);

    const [evaluationCriteria] = useState([
        { name: "Technical Implementation", weight: 40 },
        { name: "Innovation & Creativity", weight: 25 },
        { name: "Presentation Quality", weight: 20 },
        { name: "Documentation", weight: 15 },
    ]);

    const statCards = [
        { label: "Total Teams", value: teams.length },
        { label: "Supervisors", value: new Set(teams.map(t => t.supervisor)).size },
        { label: "Evaluators", value: new Set(teams.flatMap(t => t.evaluators)).size },
        { label: "Students", value: teams.reduce((acc, t) => acc + t.members.length, 0) },
    ];

    const tabs = [
        { key: "teams", label: "Teams Management" },
        { key: "evaluations", label: "Evaluation Criteria" },
    ];

    return (
        <div className="df-page df-glow-bg">
            <header className="max-w-5xl mx-auto px-4 pt-16 pb-8">
                <h1 className="font-display font-bold text-3xl text-white">SPL Admin</h1>
            </header>

            <main className="max-w-5xl mx-auto px-4 pb-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                    {statCards.map((card, i) => (
                        <div key={i} className="df-card p-5">
                            <p className="text-xs text-gray-400 uppercase tracking-wide">{card.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{card.value}</p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === tab.key ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "teams" && (
                    <div className="df-card p-6">
                        <h2 className="font-bold text-white text-lg mb-1">Teams Management</h2>
                        <p className="text-sm text-gray-400 mb-6">Teams currently enrolled in this PBL module.</p>
                        <div className="space-y-4">
                            {teams.map((team) => (
                                <div key={team.id} className="bg-white/5 rounded-lg p-5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-white">{team.name}</h3>
                                        <span className="bg-white/10 text-gray-300 text-xs font-semibold px-2.5 py-1 rounded-full">{team.members.length} members</span>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4">Project: {team.project}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase mb-1">Members</p>
                                            {team.members.map((m, idx) => <p key={idx} className="text-gray-300">{m}</p>)}
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase mb-1">Supervisor</p>
                                            <p className="text-gray-300">{team.supervisor}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-xs uppercase mb-1">Evaluators</p>
                                            {team.evaluators.map((e, idx) => <p key={idx} className="text-gray-300">{e}</p>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "evaluations" && (
                    <div className="df-card p-6">
                        <h2 className="font-bold text-white text-lg mb-1">Evaluation Criteria</h2>
                        <p className="text-sm text-gray-400 mb-6">Weighted criteria used across evaluations.</p>
                        <div className="space-y-3">
                            {evaluationCriteria.map((c, idx) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-4 flex justify-between items-center">
                                    <h3 className="font-semibold text-white">{c.name}</h3>
                                    <span className="text-sm text-gray-400">Weight: {c.weight}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
