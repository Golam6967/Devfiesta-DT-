import React, { useState } from "react";
import DevFiestaLogo from "../components/DevFiestaLogo";
import ProjectCard from "../components/ProjectCard";

export default function StudentPersonal() {
    const [projects] = useState([
        { id: 1, name: "DevFiesta", category: "SPL 2", github: "https://github.com/devfiesta/devfiesta" },
        { id: 2, name: "Turing Machine", category: "SPL 1", github: "https://github.com/devfiesta/turing-machine" },
        { id: 3, name: "Jonobarta", category: "PBL", github: "https://github.com/devfiesta/jonobarta" },
    ]);

    return (
        <div className="df-page df-glow-bg">
            <header className="max-w-5xl mx-auto px-4 pt-16 pb-10 text-center">
                <div className="flex justify-center mb-4">
                    <DevFiestaLogo />
                </div>
                <h2 className="font-display font-bold text-3xl text-white">Personal Dashboard</h2>
                <p className="text-gray-400 mt-2">Student ID: PBL-2026-014</p>
            </header>

            <main className="max-w-5xl mx-auto px-4 pb-16">
                <h3 className="font-display font-bold text-xl text-white mb-6">Your Projects</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.length === 0 ? (
                        <p className="text-gray-500 col-span-full text-center py-10">No projects found.</p>
                    ) : (
                        projects.map(project => (
                            <ProjectCard key={project.id} name={project.name} category={project.category} github={project.github} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
