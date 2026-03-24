import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import { LogIn, Lock, User, AlertCircle } from "lucide-react";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // const response = await axios.post(import.meta.env.BACKEND_URL + '/auth/login', { username, password });
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        { username, password },
      );
      setAuth(response.data.user, response.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-bomb/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black italic tracking-tighter uppercase mb-2">
            WELCOME BACK ':)'
          </h1>
          <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">
            Enter your credentials to enter the arena
          </p>
        </div>

        <div className="glass p-8 rounded-[2rem] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-accent-bomb/10 border border-accent-bomb/20 p-4 rounded-xl flex items-center gap-3 text-accent-bomb text-sm font-bold">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-dark-lighter/50 border-2 border-white/5 focus:border-primary/50 p-4 pl-12 rounded-2xl transition-all font-bold placeholder:text-gray-600 outline-none"
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-dark-lighter/50 border-2 border-white/5 focus:border-primary/50 p-4 pl-12 rounded-2xl transition-all font-bold placeholder:text-gray-600 outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover disabled:bg-gray-800 disabled:opacity-50 text-dark font-black py-4 px-8 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-dark/20 border-t-dark animate-spin rounded-full" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  <span className="text-lg">LOGIN</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm font-bold">
              DON'T HAVE AN ACCOUNT?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary-hover transition-colors"
              >
                CREATE ONE NOW
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
