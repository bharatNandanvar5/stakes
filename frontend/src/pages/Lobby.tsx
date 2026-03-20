import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuthStore } from "../store/useAuthStore";
import { motion } from "framer-motion";
import { Play, LogIn, Swords, Bomb, Users, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const Lobby: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [name, setName] = useState(user?.username || "");
  const [roomCode, setRoomCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [bombCount, setBombCount] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  
  const { createRoom, joinRoom } = useSocket();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createRoom(name.trim(), { maxPlayers, bombCount });
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) joinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Navbar-like top bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">{user?.username}</span>
          </div>
          {user?.role === 'admin' && (
            <Link to="/admin" className="glass px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors">
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span className="font-black text-sm uppercase tracking-widest text-primary">ADMIN</span>
            </Link>
          )}
        </div>
        <button onClick={logout} className="glass px-4 py-2 rounded-xl flex items-center gap-3 hover:bg-accent-bomb/10 transition-colors group">
          <LogOut className="w-4 h-4 text-gray-500 group-hover:text-accent-bomb transition-colors" />
          <span className="font-black text-sm uppercase tracking-widest text-gray-500 group-hover:text-accent-bomb">LOGOUT</span>
        </button>
      </div>

      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md text-center relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <div className="relative mb-4 animate-float">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
            <div className="relative glass p-5 rounded-3xl border-primary/20">
              <Bomb className="w-16 h-16 text-primary gem-glow" />
            </div>
          </div>
          <h1 className="text-6xl font-black italic tracking-tighter uppercase text-white">
            STAKE<span className="text-primary italic">MINES</span>
          </h1>
          <p className="text-gray-500 font-bold tracking-[0.3em] text-[10px] mt-2 uppercase">
            Provably Fair Multiplayer
          </p>
        </div>

        <div className="glass p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="space-y-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="YOUR NICKNAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-lighter/50 border-2 border-white/5 focus:border-primary/50 p-5 rounded-2xl transition-all text-xl font-bold placeholder:text-gray-600 outline-none"
              />
            </div>

            <div className="grid gap-4">
              <div className="space-y-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full glass py-3 px-6 rounded-2xl flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className={`w-4 h-4 ${showSettings ? 'animate-spin' : ''}`} />
                    GAME SETTINGS
                  </div>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded">
                    {maxPlayers}P | {bombCount} BOMBS
                  </span>
                </button>

                {showSettings && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-4 glass p-4 rounded-2xl border-white/5 overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>MAX PLAYERS</span>
                        <span className="text-primary">{maxPlayers}</span>
                      </div>
                      <input 
                        type="range" min="2" max="5" value={maxPlayers} 
                        onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                        className="w-full accent-primary bg-dark-lighter rounded-lg h-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                        <span>BOMB COUNT</span>
                        <span className="text-accent-bomb">{bombCount}</span>
                      </div>
                      <input 
                        type="range" min="1" max="20" value={bombCount} 
                        onChange={(e) => setBombCount(parseInt(e.target.value))}
                        className="w-full accent-accent-bomb bg-dark-lighter rounded-lg h-2"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full group relative overflow-hidden bg-primary hover:bg-primary-hover disabled:bg-gray-800 disabled:opacity-50 text-dark font-black py-5 px-8 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6 fill-dark" />
                <span className="text-xl">CREATE BATTLE</span>
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">OR JOIN CHALLENGE</span>
                <div className="h-[1px] flex-1 bg-white/5" />
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="CODE"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="flex-1 bg-dark-lighter/50 border-2 border-white/5 focus:border-primary/50 p-4 rounded-2xl transition-all font-mono font-bold placeholder:text-gray-600 outline-none"
                />
                <button
                  onClick={handleJoin}
                  disabled={!name.trim() || !roomCode.trim()}
                  className="bg-white/5 hover:bg-white/10 disabled:bg-transparent disabled:opacity-20 px-6 rounded-2xl transition-all border border-white/5 flex items-center justify-center group"
                >
                  <LogIn className="w-6 h-6 group-hover:text-primary transition-colors" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
