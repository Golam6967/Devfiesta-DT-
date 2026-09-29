import React, { useState } from "react";

export default function WeeklyMarkingForm({ teams, onSave }) {
    const [marks, setMarks] = useState({});

    const handleInputChange = (teamId, memberName, field, value) => {
        setMarks((prev) => ({
            ...prev,
            [`${teamId}-${memberName}`]: {
                ...prev[`${teamId}-${memberName}`],
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(marks);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {teams.map((team) => (
                <div key={team.id} className="df-card p-6">
                    <div className="font-bold text-white text-lg mb-4">{team.name}</div>
                    <div className="space-y-4">
                        {team.members.map((member, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-4">
                                <div className="font-semibold text-white text-sm mb-3">{member.name}</div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                    <label className="text-xs text-gray-400">
                                        Attendance mark (0-10)
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={marks[`${team.id}-${member.name}`]?.attendance || ""}
                                            onChange={(e) => handleInputChange(team.id, member.name, "attendance", e.target.value)}
                                            required
                                            className="df-input mt-1 !py-2"
                                        />
                                    </label>
                                    <label className="text-xs text-gray-400">
                                        Contribution mark (0-10)
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={marks[`${team.id}-${member.name}`]?.contribution || ""}
                                            onChange={(e) => handleInputChange(team.id, member.name, "contribution", e.target.value)}
                                            required
                                            className="df-input mt-1 !py-2"
                                        />
                                    </label>
                                </div>
                                <label className="text-xs text-gray-400 block">
                                    Comments
                                    <textarea
                                        rows={2}
                                        value={marks[`${team.id}-${member.name}`]?.comments || ""}
                                        onChange={(e) => handleInputChange(team.id, member.name, "comments", e.target.value)}
                                        placeholder="Any comments..."
                                        className="df-input mt-1"
                                    />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex justify-end">
                <button type="submit" className="df-btn-primary">Submit All Marks</button>
            </div>
        </form>
    );
}
