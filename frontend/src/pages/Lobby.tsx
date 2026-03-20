import React, { useState } from "react";
import { useSocket } from "../context/SocketContext";
import { motion } from "framer-motion";
import { Play, LogIn, Swords, Bomb, Users } from "lucide-react";

const Lobby: React.FC = () => {
  const [name, setName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const { createRoom, joinRoom } = useSocket();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) createRoom(name.trim());
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) joinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-bomb/5 rounded-full blur-[120px]" />

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
          <p className="text-gray-500 font-bold tracking-[0.3em] text-xs mt-2 uppercase">
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
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>

            <div className="grid gap-4">
              <button
                onClick={handleCreate}
                disabled={!name.trim()}
                className="w-full group relative overflow-hidden bg-primary hover:bg-primary-hover disabled:bg-gray-800 disabled:opacity-50 text-dark font-black py-5 px-8 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
              >
                <Play className="w-6 h-6 fill-dark" />
                <span className="text-xl">CREATE BATTLE</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
              </button>

              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  OR JOIN CHALLENGE
                </span>
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

        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Swords className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              BATTLES
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/5" />
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl glass flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              REALTIME
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Lobby;
