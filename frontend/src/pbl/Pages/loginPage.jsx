import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [role, setRole] = useState("admin");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role === "student") navigate("/pbl/student-personal");
        else if (role === "supervisor") navigate("/pbl/supervisor-dashboard");
        else if (role === "admin") navigate("/pbl/SPLadmin");
        else if (role === "evaluator") navigate("/pbl/Eval");
    };

    return (
        <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl df-btn-primary !p-0 mb-4">
                        <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                            <path d="M24 14L40 22L24 30L8 22L24 14Z" fill="white" />
                            <path d="M24 30V36" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <path d="M16 26V32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                            <path d="M32 26V32" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                    <h2 className="font-display font-bold text-3xl text-white">SPL Automation System</h2>
                    <p className="text-gray-400 mt-1">Software Project Lab Management</p>
                </div>

                <form onSubmit={handleSubmit} className="df-card p-8 shadow-2xl shadow-black/40">
                    <h3 className="text-xl font-bold text-white mb-1">Continue as</h3>
                    <p className="text-sm text-gray-400 mb-6">Select your role to open the matching dashboard.</p>

                    <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="df-input mb-6"
                        required
                    >
                        <option className="bg-[#0d0d1a]" value="admin">Admin (SPL In-Charge)</option>
                        <option className="bg-[#0d0d1a]" value="supervisor">Supervisor</option>
                        <option className="bg-[#0d0d1a]" value="evaluator">Evaluator</option>
                        <option className="bg-[#0d0d1a]" value="student">Student</option>
                    </select>

                    <button type="submit" className="df-btn-primary w-full">
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
}
