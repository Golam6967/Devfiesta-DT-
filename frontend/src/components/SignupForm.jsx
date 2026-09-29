import axios from "axios";
import React, { useState } from "react";
import { userContext } from "../hooks/AutoAuth";
import { FaArrowRightLong, FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../utils/api";

const validateDate = (date) => {
  const todayStr = new Date().toISOString().split("T")[0];
  if (date >= todayStr) return "Date of birth must be in the past.";
  return true;
};

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_HINT = "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

const validatePasswordStrength = (password) => {
  if (!PASSWORD_RULE.test(password)) {
    return `Password doesn't meet the requirements. ${PASSWORD_HINT}`;
  }
  return true;
};

const validatepassword = (password, confirmPassword) => {
  if (password === confirmPassword) return true;
  return "Passwords do not match.";
};

const EyeIcon = ({ visible, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 hover:text-white"
  >
    {visible ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
  </button>
);

const SignupForm = () => {
  const { setUser } = userContext();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [secondarypass, setsecondarypass] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigateto = useNavigate();
  const [formData, setformData] = useState({
    username: "",
    email: "",
    full_name: "",
    date_of_birth: "",
    password: "",
  });

  const handlechange = (e) => {
    const { name, value } = e.target;
    setformData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const dateCheck = validateDate(formData.date_of_birth);
    const strengthCheck = validatePasswordStrength(formData.password);
    const matchCheck = validatepassword(formData.password, secondarypass);

    if (dateCheck !== true) return setError(dateCheck);
    if (strengthCheck !== true) return setError(strengthCheck);
    if (matchCheck !== true) return setError(matchCheck);

    setSubmitting(true);
    try {
      console.log(formData);
      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        formData,
        { withCredentials: true },
      );

      if (response.data?.data?.user != null) {
        const user = response.data.data.user;
        const token = response.data.data.token;
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);
        navigateto("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
            Create your account
          </h2>
          <p className="mt-2 text-gray-400">
            It's fast and free to get started.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="df-card p-8 shadow-2xl shadow-black/40 flex flex-col gap-4"
        >
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <input
            required
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handlechange}
            className="df-input"
            placeholder="Full name"
          />
          <input
            required
            type="email"
            name="email"
            value={formData.email}
            onChange={handlechange}
            className="df-input"
            placeholder="Email address"
          />
          <input
            required
            type="text"
            name="username"
            value={formData.username}
            onChange={handlechange}
            className="df-input"
            placeholder="Username"
          />
          <input
            required
            type="date"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handlechange}
            className="df-input [color-scheme:dark]"
          />

          <div>
            <div className="relative">
              <input
                required
                type={passwordVisible ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handlechange}
                className={`df-input pr-11 ${formData.password && !PASSWORD_RULE.test(formData.password) ? "!border-red-500" : ""}`}
                placeholder="Password"
              />
              <EyeIcon
                visible={passwordVisible}
                onClick={() => setPasswordVisible((v) => !v)}
              />
            </div>
            <p
              className={`text-xs mt-1.5 ${
                formData.password && !PASSWORD_RULE.test(formData.password)
                  ? "text-red-400"
                  : "text-gray-500"
              }`}
            >
              {PASSWORD_HINT}
            </p>
          </div>
          <div>
            <div className="relative">
              <input
                required
                type={confirmPasswordVisible ? "text" : "password"}
                value={secondarypass}
                onChange={(e) => setsecondarypass(e.target.value)}
                name="confirmPassword"
                className={`df-input pr-11 ${secondarypass && secondarypass !== formData.password ? "!border-red-500" : ""}`}
                placeholder="Confirm password"
              />
              <EyeIcon
                visible={confirmPasswordVisible}
                onClick={() => setConfirmPasswordVisible((v) => !v)}
              />
            </div>
            {secondarypass && secondarypass !== formData.password && (
              <p className="text-xs mt-1.5 text-red-400">Passwords do not match.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="df-btn-primary w-full mt-2"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign Up</span>
                <FaArrowRightLong size={16} />
              </>
            )}
          </button>

          <p className="text-sm text-center text-gray-400">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigateto("/login")}
              className="font-semibold df-text-gradient hover:opacity-80"
            >
              Log in
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
