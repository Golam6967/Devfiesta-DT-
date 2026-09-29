import { FaArrowRightLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

const SignupOps = () => {
    const navigateto = useNavigate();

    return (
        <div className="df-page df-glow-bg flex items-center justify-center px-4 py-16">
            <div className="w-full max-w-md text-center">
                <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">Join DevFiesta</h2>
                <p className="mt-3 text-gray-400">
                    Create an account to host hackathons, join teams, and showcase your projects.
                </p>

                <div className="df-card mt-8 p-8 shadow-2xl shadow-black/40">
                    <button
                        onClick={() => navigateto('/signupform')}
                        className="df-btn-primary w-full"
                    >
                        <span>Create your account</span>
                        <FaArrowRightLong size={16} />
                    </button>

                    <p className="mt-6 text-sm text-gray-400">
                        Already have an account?{" "}
                        <button
                            onClick={() => navigateto('/login')}
                            className="font-semibold df-text-gradient hover:opacity-80"
                        >
                            Log in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupOps;
