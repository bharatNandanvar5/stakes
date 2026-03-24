import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import {
  Users,
  History as HistoryIcon,
  Activity,
  Shield,
  ArrowLeft,
  Trophy,
  Bomb,
  Gem,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [liveGames, setLiveGames] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<
    "stats" | "users" | "history" | "live"
  >("stats");
  const [loading, setLoading] = useState(true);

  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_BACKEND_URL;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [statsRes, usersRes, historyRes, liveRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`, config),
        axios.get(`${API_URL}/admin/users`, config),
        axios.get(`${API_URL}/admin/history`, config),
        axios.get(`${API_URL}/admin/live-games`, config),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setHistory(historyRes.data);
      setLiveGames(liveRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center font-black uppercase tracking-widest text-primary animate-pulse">
        Loading Arena Intelligence...
      </div>
    );

  return (
    <div className="min-h-screen bg-dark text-white p-6 md:p-10">
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="glass p-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                ADMIN CONTROL
              </h1>
            </div>
            <p className="text-gray-500 font-bold tracking-widest text-xs uppercase mt-1">
              Global Arena Monitoring & Management
            </p>
          </div>
        </div>

        <div className="flex glass p-1 rounded-2xl">
          {[
            { id: "stats", icon: Activity, label: "Overview" },
            { id: "users", icon: Users, label: "Players" },
            { id: "history", icon: HistoryIcon, label: "History" },
            { id: "live", icon: Trophy, label: "Live" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === tab.id
                  ? "bg-primary text-dark shadow-lg shadow-primary/20"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "stats" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <Users className="w-12 h-12 text-primary mb-6" />
                <div className="text-5xl font-black italic tracking-tighter mb-2">
                  {stats?.totalUsers || 0}
                </div>
                <div className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">
                  REGISTERED PLAYERS
                </div>
              </div>
              <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-bomb/5 rounded-full blur-3xl group-hover:bg-accent-bomb/10 transition-colors" />
                <HistoryIcon className="w-12 h-12 text-accent-bomb mb-6" />
                <div className="text-5xl font-black italic tracking-tighter mb-2">
                  {stats?.totalMatches || 0}
                </div>
                <div className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">
                  TOTAL BATTLES
                </div>
              </div>
              <div className="glass p-10 rounded-[2.5rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                <Trophy className="w-12 h-12 text-primary mb-6" />
                <div className="text-5xl font-black italic tracking-tighter mb-2">
                  {liveGames.length}
                </div>
                <div className="text-gray-500 font-black text-xs uppercase tracking-[0.2em]">
                  LIVE ARENAS
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="glass rounded-[2rem] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-6 font-black text-xs uppercase tracking-widest text-gray-500">
                      USERNAME
                    </th>
                    <th className="p-6 font-black text-xs uppercase tracking-widest text-gray-500">
                      ROLE
                    </th>
                    <th className="p-6 font-black text-xs uppercase tracking-widest text-gray-500 text-center">
                      WINS
                    </th>
                    <th className="p-6 font-black text-xs uppercase tracking-widest text-gray-500 text-center">
                      TOTAL
                    </th>
                    <th className="p-6 font-black text-xs uppercase tracking-widest text-gray-500 text-right">
                      MAX SCORE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-dark-lighter flex items-center justify-center font-black text-primary">
                            {u.username[0].toUpperCase()}
                          </div>
                          <span className="font-bold">{u.username}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span
                          className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
                            u.role === "admin"
                              ? "bg-primary/10 text-primary border-primary/20"
                              : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6 text-center font-mono font-bold text-primary">
                        {u.totalWins}
                      </td>
                      <td className="p-6 text-center font-mono font-bold text-gray-400">
                        {u.totalMatches}
                      </td>
                      <td className="p-6 text-right font-mono font-black text-primary">
                        {u.maxScore.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {history.map((h) => (
                <div
                  key={h._id}
                  className="glass p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/5 hover:border-primary/20 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-dark-lighter flex items-center justify-center">
                      <HistoryIcon className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">
                        ARENA: {h.roomId}
                      </div>
                      <div className="flex items-center gap-2">
                        {h.players.map((p: any, i: number) => (
                          <React.Fragment key={p._id}>
                            <span
                              className={`font-bold ${h.winnerId === p._id ? "text-primary" : "text-white"}`}
                            >
                              {p.username}
                            </span>
                            {i < h.players.length - 1 && (
                              <span className="text-gray-700">VS</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                        SETTINGS
                      </div>
                      <div className="text-xs font-bold">
                        {h.settings.maxPlayers}P | {h.settings.bombCount} BOMBS
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">
                        DATE
                      </div>
                      <div className="text-xs font-bold text-gray-400">
                        {new Date(h.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "live" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {liveGames.map((g) => (
                <div
                  key={g.roomId}
                  className="glass p-8 rounded-[2rem] border-primary/20 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  <div className="flex items-center justify-between mb-6">
                    <div className="px-3 py-1 rounded bg-primary/10 text-primary text-[10px] font-black uppercase border border-primary/20 animate-pulse">
                      LIVE ARENA
                    </div>
                    <div className="text-xs font-mono font-black text-gray-500">
                      {g.roomId}
                    </div>
                  </div>

                  {/* Game Grid Visualization */}
                  <div className="mb-8 p-4 bg-dark-lighter/50 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-5 gap-1.5 aspect-square">
                      {g.revealed.map((isRevealed: boolean, i: number) => (
                        <div
                          key={i}
                          className={`aspect-square rounded-sm border ${
                            isRevealed
                              ? g.grid[i] === 1
                                ? "bg-accent-bomb/40 border-accent-bomb/50"
                                : "bg-primary/40 border-primary/50"
                              : "bg-dark-card border-white/5"
                          }`}
                        >
                          {isRevealed && (
                            <div className="w-full h-full flex items-center justify-center">
                              {g.grid[i] === 1 ? (
                                <Bomb className="w-2 h-2 text-white" />
                              ) : (
                                <Gem className="w-2 h-2 text-white" />
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {g.players.map((p: any) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-2 h-2 rounded-full ${g.turnPlayerId === p.id ? "bg-primary animate-ping" : "bg-gray-700"}`}
                          />
                          <span className="font-bold text-sm">{p.name}</span>
                        </div>
                        <span className="font-mono text-xs font-black text-primary">
                          {p.score}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>{g.settings.bombCount} BOMBS</span>
                    <span>
                      {g.players.length} / {g.settings.maxPlayers} PLAYERS
                    </span>
                  </div>
                </div>
              ))}
              {liveGames.length === 0 && (
                <div className="col-span-full py-20 text-center glass rounded-[2.5rem] border-dashed border-white/10 opacity-50">
                  <Activity className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <div className="font-black uppercase tracking-widest text-gray-700">
                    NO ACTIVE ARENAS FOUND
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
