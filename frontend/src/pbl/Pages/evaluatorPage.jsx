import React, { useMemo, useState } from "react";

export default function EvaluatorPage() {
    const teams = [
        { id: 1, name: "Team Alpha", members: ["John Doe", "Jane Smith", "Bob Johnson"], supervisor: "Dr. Wilson", project: "E-commerce Platform" },
        { id: 2, name: "Team Beta", members: ["Alice Cooper", "Mike Ross", "Sarah Connor"], supervisor: "Dr. Anderson", project: "Learning Management System" },
    ];

    const rubric = [
        { key: "tech", label: "Technical Implementation", weight: 40, hint: "Correctness, architecture, testing" },
        { key: "innovation", label: "Innovation & Creativity", weight: 25, hint: "Originality, problem framing" },
        { key: "presentation", label: "Presentation Quality", weight: 20, hint: "Clarity, structure, visuals, demo" },
        { key: "docs", label: "Documentation", weight: 15, hint: "Readme, setup, code comments" },
    ];

    const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id ?? null);
    const [selectedMember, setSelectedMember] = useState(teams[0]?.members[0] ?? "");
    const [scores, setScores] = useState(() => rubric.reduce((acc, r) => ({ ...acc, [r.key]: 0 }), {}));
    const [comments, setComments] = useState("");
    const [evaluations, setEvaluations] = useState([]);
    const [notice, setNotice] = useState('');

    const selectedTeam = useMemo(() => teams.find((t) => t.id === selectedTeamId) ?? null, [selectedTeamId]);

    const totalScore = useMemo(() => {
        const maxPer = 10;
        let sum = 0;
        rubric.forEach((r) => {
            const s = Number(scores[r.key] || 0);
            sum += (Math.max(0, Math.min(maxPer, s)) / maxPer) * r.weight;
        });
        return Math.round(sum * 10) / 10;
    }, [scores]);

    const handleScoreChange = (key, value) => setScores((prev) => ({ ...prev, [key]: value }));

    const resetForm = () => {
        setScores(rubric.reduce((acc, r) => ({ ...acc, [r.key]: 0 }), {}));
        setComments("");
    };

    const showNotice = (msg) => { setNotice(msg); setTimeout(() => setNotice(''), 2500); };

    const baseRecord = () => ({
        timestamp: new Date().toISOString(),
        teamId: selectedTeam.id,
        teamName: selectedTeam.name,
        member: selectedMember,
        supervisor: selectedTeam.supervisor,
        project: selectedTeam.project,
        rubric: rubric.map((r) => ({ key: r.key, label: r.label, weight: r.weight, score10: Number(scores[r.key] || 0) })),
        total: totalScore,
        comments,
    });

    const saveDraft = () => {
        if (!selectedTeam || !selectedMember) return showNotice('Select a team and member first.');
        setEvaluations((prev) => [...prev, { ...baseRecord(), status: "draft" }]);
        showNotice('Draft saved.');
    };

    const submitEvaluation = () => {
        if (!selectedTeam || !selectedMember) return showNotice('Select a team and member first.');
        setEvaluations((prev) => [...prev, { ...baseRecord(), status: "submitted" }]);
        showNotice('Evaluation submitted.');
    };

    const download = (url, filename) => {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportJSON = () => {
        if (!evaluations.length) return showNotice('No evaluations to export.');
        const blob = new Blob([JSON.stringify(evaluations, null, 2)], { type: "application/json" });
        download(URL.createObjectURL(blob), "evaluations.json");
    };

    const csvEscape = (v) => {
        const s = String(v ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const exportCSV = () => {
        if (!evaluations.length) return showNotice('No evaluations to export.');
        const headers = ["timestamp", "status", "teamId", "teamName", "member", "supervisor", "project", ...rubric.map((r) => `${r.key}_score10`), "total", "comments"];
        const rows = evaluations.map((e) => {
            const per = Object.fromEntries(e.rubric.map((r) => [r.key, r.score10]));
            return [e.timestamp, e.status, e.teamId, e.teamName, e.member, e.supervisor, e.project, ...rubric.map((r) => per[r.key] ?? ""), e.total, e.comments.replace(/\n/g, " ")];
        });
        const csv = headers.join(",") + "\n" + rows.map((r) => r.map(csvEscape).join(",")).join("\n");
        download(URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), "evaluations.csv");
    };

    return (
        <div className="df-page df-glow-bg">
            <header className="max-w-6xl mx-auto px-4 pt-16 pb-8">
                <h1 className="font-display font-bold text-3xl text-white">Evaluator</h1>
            </header>

            <main className="max-w-6xl mx-auto px-4 pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="df-card p-6 h-fit">
                    <h2 className="font-bold text-white text-lg mb-5">Select Team & Member</h2>
                    <label className="text-xs text-gray-400 uppercase tracking-wide">Team</label>
                    <select
                        className="df-input mt-1 mb-4"
                        value={selectedTeamId ?? ""}
                        onChange={(e) => {
                            const id = Number(e.target.value);
                            setSelectedTeamId(id);
                            setSelectedMember(teams.find((t) => t.id === id)?.members[0] ?? "");
                        }}
                    >
                        {teams.map((t) => <option className="bg-[#0d0d1a]" key={t.id} value={t.id}>{t.name} — {t.project}</option>)}
                    </select>

                    <label className="text-xs text-gray-400 uppercase tracking-wide">Member</label>
                    <select className="df-input mt-1" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
                        {selectedTeam?.members.map((m, i) => <option className="bg-[#0d0d1a]" key={i} value={m}>{m}</option>)}
                    </select>

                    {selectedTeam && (
                        <div className="mt-5 bg-white/5 rounded-lg p-4 text-sm space-y-2">
                            <div className="flex justify-between"><span className="text-gray-400">Supervisor</span><span className="text-white font-medium">{selectedTeam.supervisor}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400">Project</span><span className="text-white font-medium">{selectedTeam.project}</span></div>
                        </div>
                    )}
                </section>

                <section className="lg:col-span-2 df-card p-6">
                    <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                        <div>
                            <h2 className="font-bold text-white text-lg">Evaluation Rubric</h2>
                            <p className="text-sm text-gray-400">Score each criterion (0–10). Weights apply automatically.</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={saveDraft} className="df-btn-secondary !py-2 !px-4 text-sm">Save Draft</button>
                            <button onClick={submitEvaluation} className="df-btn-primary !py-2 !px-4 text-sm">Submit</button>
                        </div>
                    </div>

                    {notice && <div className="mb-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2">{notice}</div>}

                    <div className="space-y-5">
                        {rubric.map((r) => (
                            <div key={r.key} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/5 rounded-lg p-4">
                                <div className="flex-1">
                                    <div className="font-semibold text-white">{r.label}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">Weight: {r.weight}% — {r.hint}</div>
                                </div>
                                <div className="flex items-center gap-3 sm:min-w-[220px]">
                                    <input type="range" min="0" max="10" step="1" value={scores[r.key]} onChange={(e) => handleScoreChange(r.key, Number(e.target.value))} className="flex-1 accent-indigo-500" />
                                    <input
                                        type="number" min="0" max="10"
                                        value={scores[r.key]}
                                        onChange={(e) => { const v = Number(e.target.value); handleScoreChange(r.key, isNaN(v) ? 0 : Math.max(0, Math.min(10, v))); }}
                                        className="df-input !w-16 !py-1.5 text-center"
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center bg-white/5 rounded-lg p-4">
                            <span className="font-bold text-white">Total (weighted)</span>
                            <span className="font-bold df-text-gradient text-lg">{totalScore} / 100</span>
                        </div>

                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wide">Comments (optional)</label>
                            <textarea rows="3" placeholder="Write constructive feedback…" value={comments} onChange={(e) => setComments(e.target.value)} className="df-input mt-1" />
                        </div>

                        <div className="flex flex-wrap justify-between gap-3">
                            <button onClick={resetForm} className="df-btn-secondary !py-2 !px-4 text-sm">Reset</button>
                            <div className="flex gap-2">
                                <button onClick={exportCSV} className="df-btn-secondary !py-2 !px-4 text-sm">Export CSV</button>
                                <button onClick={exportJSON} className="df-btn-secondary !py-2 !px-4 text-sm">Export JSON</button>
                            </div>
                        </div>

                        <details className="bg-white/5 rounded-lg p-4">
                            <summary className="font-semibold text-white cursor-pointer">Saved Evaluations ({evaluations.length})</summary>
                            <div className="mt-3 space-y-2">
                                {evaluations.length === 0 && <span className="text-sm text-gray-500">No records yet.</span>}
                                {evaluations.map((e, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <div>
                                            <div className="font-semibold text-white">{e.teamName} — {e.member}</div>
                                            <div className="text-gray-500 text-xs">{e.status} • {new Date(e.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div className="font-bold text-white">{e.total}/100</div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    </div>
                </section>
            </main>
        </div>
    );
}
