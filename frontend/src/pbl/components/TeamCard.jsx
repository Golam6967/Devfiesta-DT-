import React from "react";
import { Github, Presentation } from "lucide-react";

export default function TeamCard({ team }) {
    return (
        <div className="df-card p-6">
            <div className="flex justify-between items-start mb-5">
                <div>
                    <h3 className="text-lg font-bold text-white">{team.name}</h3>
                    <p className="text-sm text-gray-400">{team.project}</p>
                </div>
                <span className="bg-white/10 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    {team.members.length} members
                </span>
            </div>

            <div className="space-y-3 mb-5">
                {team.members.map((member, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-3">
                        <div className="text-sm font-semibold text-white">{member.name}</div>
                        <div className="flex gap-4 text-xs text-gray-400 mt-1">
                            <span>Attendance: {member.attendance}%</span>
                            <span>Contribution: {member.contribution}%</span>
                        </div>
                        {member.weeklyMark && (
                            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-300 space-y-0.5">
                                <p><b className="text-white">Attendance mark:</b> {member.weeklyMark.attendance} / 10</p>
                                <p><b className="text-white">Contribution mark:</b> {member.weeklyMark.contribution} / 10</p>
                                {member.weeklyMark.comments && <p><b className="text-white">Comments:</b> {member.weeklyMark.comments}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
                <a href={team.githubLink} target="_blank" rel="noopener noreferrer" className="df-btn-secondary !py-1.5 !px-3 text-xs">
                    <Github size={14} /> GitHub Repository
                </a>
                <a href={team.slidesLink} target="_blank" rel="noopener noreferrer" className="df-btn-secondary !py-1.5 !px-3 text-xs">
                    <Presentation size={14} /> Project Slides
                </a>
            </div>

            <p className="text-xs text-gray-500">Last updated: {team.lastUpdate}</p>
        </div>
    );
}
