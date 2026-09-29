import React, { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import WeeklyMarkingForm from "../components/WeeklyMarkingForm";

export default function SupervisorDashboard() {
    const [teams, setTeams] = useState([]);
    const [activeTab, setActiveTab] = useState("teams");

    useEffect(() => {
        setTeams([
            {
                id: 1,
                name: "Team Gamma",
                members: [
                    { name: "Alice Cooper", attendance: 88, contribution: 85 },
                    { name: "Mike Ross", attendance: 95, contribution: 92 },
                    { name: "Sarah Connor", attendance: 90, contribution: 89 },
                ],
                project: "Task Management App",
                githubLink: "https://github.com/team-gamma/taskmanager",
                slidesLink: "https://drive.google.com/team-gamma-slides",
                lastUpdate: "1 day ago",
            },
            {
                id: 2,
                name: "Team X",
                members: [
                    { name: "Zafor", attendance: 88, contribution: 85 },
                    { name: "Utsho", attendance: 95, contribution: 92 },
                    { name: "Ahir", attendance: 90, contribution: 89 },
                ],
                project: "Devfiesta Backend",
                githubLink: "https://github.com/team-x/devfiesta",
                slidesLink: "https://drive.google.com/team-x-slides",
                lastUpdate: "1 day ago",
            },
        ]);
    }, []);

    useEffect(() => {
        const savedMarks = localStorage.getItem("weeklyMarks");
        if (savedMarks) {
            const marks = JSON.parse(savedMarks);
            setTeams((prev) => prev.map((team) => ({
                ...team,
                members: team.members.map((m) => ({ ...m, weeklyMark: marks[`${team.id}-${m.name}`] || null })),
            })));
        }
    }, []);

    const handleSaveWeeklyMarks = (marks) => {
        localStorage.setItem("weeklyMarks", JSON.stringify(marks));
        setTeams((prev) => prev.map((team) => ({
            ...team,
            members: team.members.map((m) => ({ ...m, weeklyMark: marks[`${team.id}-${m.name}`] || null })),
        })));
        setActiveTab("teams");
    };

    const totalStudents = teams.reduce((acc, t) => acc + t.members.length, 0);

    return (
        <div className="df-page df-glow-bg">
            <header className="max-w-5xl mx-auto px-4 pt-16 pb-8">
                <h1 className="font-display font-bold text-3xl text-white">Supervisor Dashboard</h1>
            </header>

            <main className="max-w-5xl mx-auto px-4 pb-16">
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="df-card p-6">
                        <div className="text-sm text-gray-400">Assigned Teams</div>
                        <div className="text-3xl font-bold text-white mt-1">{teams.length}</div>
                    </div>
                    <div className="df-card p-6">
                        <div className="text-sm text-gray-400">Total Students</div>
                        <div className="text-3xl font-bold text-white mt-1">{totalStudents}</div>
                    </div>
                </div>

                <div className="flex gap-2 mb-8">
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "teams" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
                        onClick={() => setActiveTab("teams")}
                    >
                        My Teams
                    </button>
                    <button
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === "marking" ? "bg-white/10 text-white" : "text-gray-400 hover:text-white"}`}
                        onClick={() => setActiveTab("marking")}
                    >
                        Weekly Marking
                    </button>
                </div>

                {activeTab === "teams" ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {teams.map((team) => <TeamCard key={team.id} team={team} />)}
                    </div>
                ) : (
                    <WeeklyMarkingForm teams={teams} onSave={handleSaveWeeklyMarks} />
                )}
            </main>
        </div>
    );
}
