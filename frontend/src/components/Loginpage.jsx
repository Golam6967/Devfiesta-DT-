import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaArrowRightLong } from "react-icons/fa6";
import { userContext } from "../hooks/AutoAuth";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

const Loginpage = () => {
  const navigateTo = useNavigate();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setUser, loading } = userContext();
  const [formData, setformData] = useState({
    email: "",
    password: "",
  });

  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible);

  const handlechange = (e) => {
    const { name, value } = e.target;
    setformData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        formData,
        { withCredentials: true },
      );

      const user = response.data.data.user;
      const token = response.data.data.token;
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      window.location.href = "/";
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
      setSubmitting(false);
    }
  };

  return (
    <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Welcome back</h2>
          <p className="mt-2 text-gray-400">Log in to keep building and competing.</p>
        </div>

        <form onSubmit={handleSubmit} className="df-card p-8 shadow-2xl shadow-black/40">
          {error && (
            <div className="mb-5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handlechange}
              required
              className="df-input"
              placeholder="Email address"
            />
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handlechange}
                required
                className="df-input pr-11"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {passwordVisible ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || submitting}
            className="df-btn-primary w-full mt-6"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Log In</span>
                <FaArrowRightLong size={16} />
              </>
            )}
          </button>

          <p className="mt-6 text-sm text-center text-gray-400">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => navigateTo("/signup")}
              className="font-semibold df-text-gradient hover:opacity-80"
            >
              Sign up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Loginpage;
