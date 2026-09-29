import React from "react";
import { useNavigate } from "react-router-dom";
import { Github } from "lucide-react";

export default function ProjectCard({ name, category, github }) {
    const navigate = useNavigate();

    return (
        <div className="df-card p-6 flex flex-col justify-between hover:border-white/20 transition-colors">
            <div className="flex justify-between items-start gap-3 mb-4">
                <h3 className="text-lg font-bold text-white">{name}</h3>
                <span className="bg-indigo-500/15 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">{category}</span>
            </div>
            <div className="flex items-center justify-between">
                <a
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Github size={14} /> View on GitHub
                </a>
                <button onClick={() => navigate("/pbl/project-dashboard")} className="df-btn-secondary !py-1.5 !px-4 text-sm">
                    Details
                </button>
            </div>
        </div>
    );
}
