import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userContext } from "../../hooks/AutoAuth";
import { API_BASE_URL } from "../../utils/api";

export default function HostPBL() {
    const navigate = useNavigate();
    const { User } = userContext();
    const [formData, setFormData] = useState({
        pbl_name: "",
        pbl_rule_book: "",
        proposal_Date: "",
        progress_date: "",
        final_presentation: "",
        student_pass: "",
        judge_pass: "",
        supervisor_pass: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!User) {
            setError("You need to be logged in to host an academic hackathon.");
            return;
        }

        const token = localStorage.getItem("token");
        setSubmitting(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/pbl/host`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSuccess(res.data?.data?.pbl_id);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to host the academic hackathon.");
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
                <div className="df-card p-10 max-w-md text-center">
                    <h2 className="font-display font-bold text-2xl text-white mb-2">Academic hackathon created!</h2>
                    <p className="text-gray-400 mb-6">Share the passcodes below with your students, judges, and supervisors so they can join.</p>
                    <div className="text-left bg-white/5 rounded-lg p-4 space-y-2 text-sm mb-6">
                        <div className="flex justify-between"><span className="text-gray-400">Student passcode</span><span className="text-white font-mono">{formData.student_pass}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Judge passcode</span><span className="text-white font-mono">{formData.judge_pass}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Supervisor passcode</span><span className="text-white font-mono">{formData.supervisor_pass}</span></div>
                    </div>
                    <button onClick={() => navigate("/pbl/login")} className="df-btn-primary w-full">Go to PBL Login</button>
                </div>
            </div>
        );
    }

    return (
        <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <h2 className="font-display font-bold text-3xl text-white">Host an Academic Hackathon</h2>
                    <p className="text-gray-400 mt-2">Run a Project-Based Learning (PBL) module with students, supervisors, and judges.</p>
                </div>

                <form onSubmit={handleSubmit} className="df-card p-8 flex flex-col gap-4">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
                            {error}
                        </div>
                    )}

                    <input required name="pbl_name" value={formData.pbl_name} onChange={handleChange} placeholder="Module name (e.g. SPL-2 Fall 2026)" className="df-input" />
                    <input name="pbl_rule_book" type="url" value={formData.pbl_rule_book} onChange={handleChange} placeholder="Rule book URL (optional)" className="df-input" />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Proposal date</label>
                            <input required name="proposal_Date" type="date" value={formData.proposal_Date} onChange={handleChange} className="df-input [color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Progress date</label>
                            <input required name="progress_date" type="date" value={formData.progress_date} onChange={handleChange} className="df-input [color-scheme:dark]" />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Final presentation</label>
                            <input required name="final_presentation" type="date" value={formData.final_presentation} onChange={handleChange} className="df-input [color-scheme:dark]" />
                        </div>
                    </div>

                    <p className="text-sm text-gray-400 mt-2">Set a passcode for each role — students, judges, and supervisors will use these to join.</p>
                    <input required name="student_pass" value={formData.student_pass} onChange={handleChange} placeholder="Student passcode" className="df-input" />
                    <input required name="judge_pass" value={formData.judge_pass} onChange={handleChange} placeholder="Judge passcode" className="df-input" />
                    <input required name="supervisor_pass" value={formData.supervisor_pass} onChange={handleChange} placeholder="Supervisor passcode" className="df-input" />

                    <button type="submit" disabled={submitting} className="df-btn-primary w-full mt-2">
                        {submitting ? "Creating..." : "Create Academic Hackathon"}
                    </button>
                </form>
            </div>
        </div>
    );
}
