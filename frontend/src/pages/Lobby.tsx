import React, { useState, useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuthStore } from "../store/useAuthStore";
import { useGameStore } from "../store/useGameStore";
import { motion, AnimatePresence } from "framer-motion";
import { Play, LogIn, Bomb, Users, LogOut, Settings, LayoutDashboard, UserPlus, X, Check, Grid3X3, Palette, Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { GameType } from "../store/useGameStore";

const InviteNotification: React.FC = () => {
  const { incomingInvite } = useGameStore();
  const { acceptInvite, rejectInvite } = useSocket();

  if (!incomingInvite) return null;

  const isMines = incomingInvite.settings.gameType === GameType.MINES;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-10 right-10 z-[100] glass p-6 rounded-[2rem] border-primary/30 shadow-2xl max-w-xs w-full"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
          {isMines ? <Bomb className="w-6 h-6 text-primary" /> : incomingInvite.settings.gameType === GameType.SCRIBBLE ? <Palette className="w-6 h-6 text-primary" /> : <Grid3X3 className="w-6 h-6 text-primary" />}
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-primary">NEW CHALLENGE!</h4>
          <p className="text-xs font-bold text-gray-400">{incomingInvite.fromUser.username} invited you</p>
        </div>
      </div>
      <div className="bg-dark-lighter/50 p-3 rounded-xl mb-4 text-[10px] font-black uppercase tracking-widest text-gray-500 flex justify-between">
        <span>{isMines ? "MINES" : incomingInvite.settings.gameType === GameType.SCRIBBLE ? "SCRIBBLE" : "TIC-TAC-TOE"}</span>
        <span>{isMines ? `${incomingInvite.settings.bombCount} BOMBS` : incomingInvite.settings.gameType === GameType.SCRIBBLE ? `${incomingInvite.settings.maxPlayers}P` : "STRICT 2P"}</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => acceptInvite(incomingInvite.fromUser.socketId, incomingInvite.settings)}
          className="flex-1 bg-primary hover:bg-primary-hover text-dark font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4" /> ACCEPT
        </button>
        <button
          onClick={() => rejectInvite(incomingInvite.fromUser.socketId)}
          className="bg-accent-bomb/10 hover:bg-accent-bomb/20 text-accent-bomb px-4 rounded-xl transition-all border border-accent-bomb/20 flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

const Lobby: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { onlineUsers, roomList } = useGameStore();
  const [name, setName] = useState(user?.username || "");
  const [roomCode, setRoomCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [bombCount, setBombCount] = useState(5);
  const [gameType, setGameType] = useState<GameType>(GameType.MINES);
  const [eliminationMode, setEliminationMode] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  const [cycles, setCycles] = useState(1);

  const { createRoom, joinRoom, invitePlayer } = useSocket();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createRoom(name.trim(), { maxPlayers, bombCount, gameType, eliminationMode, isPublic, cycles });
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && roomCode.trim()) joinRoom(roomCode.trim(), name.trim());
  };

  return (
    <div className="min-h-screen bg-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <InviteNotification />
      {/* Animated background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent-bomb/5 rounded-full blur-[120px]" />

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

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-10 items-center relative z-10">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-4 animate-float">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              <div className="relative glass p-5 rounded-3xl border-primary/20">
              {gameType === GameType.MINES ? (
                <Bomb className="w-16 h-16 text-primary gem-glow" />
              ) : gameType === GameType.SCRIBBLE ? (
                <Pencil className="w-16 h-16 text-primary gem-glow" />
              ) : (
                <Grid3X3 className="w-16 h-16 text-primary gem-glow" />
              )}
            </div>
          </div>
          <h1 className="text-7xl font-black italic tracking-tighter uppercase text-white">
            STAKE<span className="text-primary italic">{gameType === GameType.MINES ? "MINES" : gameType === GameType.SCRIBBLE ? "SCRIBBLE" : "TITATO"}</span>
          </h1>
          <p className="text-gray-500 font-bold tracking-[0.3em] text-[10px] mt-2 uppercase">
            {gameType === GameType.SCRIBBLE ? "Multiplayer Drawing Arena" : "Provably Fair Multiplayer Arena"}
          </p>
          </div>

          <div className="max-w-md mx-auto glass p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="w-full glass py-3 px-6 rounded-2xl flex items-center justify-between text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className={`w-4 h-4 ${showSettings ? 'animate-spin' : ''}`} />
                      ARENA SETTINGS
                    </div>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded">
                      {gameType === GameType.MINES ? 'MINES' : gameType === GameType.SCRIBBLE ? 'SCRIBBLE' : 'TIC-TAC-TOE'} | {gameType === GameType.TIC_TAC_TOE ? '2P' : `${maxPlayers}P`}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 glass p-4 rounded-2xl border-white/5 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">SELECT GAME</div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => setGameType(GameType.MINES)}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gameType === GameType.MINES ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-gray-500 hover:border-white/10'}`}
                            >
                              <Bomb className="w-5 h-5" />
                              <span className="text-[10px] font-black">MINES</span>
                            </button>
                            <button
                              onClick={() => { setGameType(GameType.SCRIBBLE); setMaxPlayers(5); }}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gameType === GameType.SCRIBBLE ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-gray-500 hover:border-white/10'}`}
                            >
                              <Palette className="w-5 h-5" />
                              <span className="text-[10px] font-black">SCRIBBLE</span>
                            </button>
                            <button
                              onClick={() => { setGameType(GameType.TIC_TAC_TOE); setMaxPlayers(2); }}
                              className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${gameType === GameType.TIC_TAC_TOE ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 text-gray-500 hover:border-white/10'}`}
                            >
                              <Grid3X3 className="w-5 h-5" />
                              <span className="text-[10px] font-black text-center leading-none">TIC TAC TOE</span>
                            </button>
                          </div>
                        </div>

                        {gameType !== GameType.TIC_TAC_TOE && (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                <span>MAX PLAYERS</span>
                                <span className="text-primary">{maxPlayers}</span>
                              </div>
                              <input
                                type="range" min={gameType === GameType.SCRIBBLE ? "3" : "2"} max={gameType === GameType.SCRIBBLE ? "10" : "5"} value={maxPlayers}
                                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                                className="w-full accent-primary bg-dark-lighter rounded-lg h-2"
                              />
                            </div>
                            {gameType === GameType.SCRIBBLE && (
                              <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
                                  <span>GAME CYCLES</span>
                                  <span className="text-primary">{cycles}</span>
                                </div>
                                <input
                                  type="range" min="1" max="5" value={cycles}
                                  onChange={(e) => setCycles(parseInt(e.target.value))}
                                  className="w-full accent-primary bg-dark-lighter rounded-lg h-2"
                                />
                                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Each cycle means everyone draws once</div>
                              </div>
                            )}
                            {gameType === GameType.MINES && (
                              <>
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

                                <div className="flex items-center justify-between p-3 glass rounded-xl border-white/5 mt-2 group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setEliminationMode(!eliminationMode)}>
                                  <div className="flex flex-col gap-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">ELIMINATION MODE</span>
                                    <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Defeated players become spectators</span>
                                  </div>
                                  <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${eliminationMode ? 'bg-primary' : 'bg-dark-lighter'}`}>
                                    <motion.div
                                      animate={{ x: eliminationMode ? 16 : 0 }}
                                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </>
                        )}
                        <div className="flex items-center justify-between p-3 glass rounded-xl border-white/5 mt-2 group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setIsPublic(!isPublic)}>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">ROOM VISIBILITY</span>
                            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                              {isPublic ? "Public room" : "Invite only"}
                            </span>
                          </div>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${isPublic ? 'bg-primary' : 'bg-dark-lighter'}`}>
                            <motion.div
                              animate={{ x: isPublic ? 16 : 0 }}
                              className="w-4 h-4 bg-white rounded-full shadow-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleCreate}
                  className="w-full group relative overflow-hidden bg-primary hover:bg-primary-hover text-dark font-black py-5 px-8 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-lg shadow-primary/10"
                >
                  <Play className="w-6 h-6 fill-dark" />
                  <span className="text-xl">HOST BATTLE</span>
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">OR JOIN PRIVATE</span>
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
                    disabled={!roomCode.trim()}
                    className="bg-white/5 hover:bg-white/10 disabled:opacity-20 px-6 rounded-2xl transition-all border border-white/5 flex items-center justify-center group"
                  >
                    <LogIn className="w-6 h-6 group-hover:text-primary transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.aside
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="h-[600px] flex flex-col gap-6"
        >
          <div className="glass rounded-[2.5rem] flex-1 flex flex-col overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">ONLINE PLAYERS</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Challenge them now</p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary">{onlineUsers.length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {onlineUsers.filter(u => u.userId !== user?.id).map((onlineUser) => (
                <div key={onlineUser.userId} className="bg-white/5 border border-white/5 p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-dark-card flex items-center justify-center font-black text-primary border border-white/5 shadow-lg group-hover:shadow-primary/20 transition-all">
                      {onlineUser.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase tracking-wider text-white">{onlineUser.username}</div>
                      <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> READY
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => invitePlayer(onlineUser.userId, { maxPlayers, bombCount, gameType, eliminationMode })}
                    className="p-3.5 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-dark transition-all active:scale-95 group/btn shadow-lg hover:shadow-primary/20"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {onlineUsers.length <= 1 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                  <Users className="w-12 h-12 mb-4" />
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">WAITING FOR OTHERS TO CONNECT</div>
                </div>
              )}
            </div>
          </div>
          <div className="glass rounded-[2.5rem] flex-1 flex flex-col overflow-hidden border-white/5">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white">PUBLIC ROOMS</h3>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Join open battles</p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary">{roomList.length}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {roomList.map((room) => {
                const isFull = room.playersCount >= room.maxPlayers;
                return (
                  <div key={room.roomId} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-dark-card flex items-center justify-center font-black text-primary border border-white/5 shadow-lg group-hover:shadow-primary/20 transition-all">
                        {room.gameType === GameType.MINES ? "M" : room.gameType === GameType.SCRIBBLE ? "S" : "T"}
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase tracking-wider text-white">{room.roomId}</div>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {room.playersCount}/{room.maxPlayers}</span>
                          <span className="opacity-20">•</span>
                          <span className="text-primary">{room.gameType.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => joinRoom(room.roomId, name.trim())}
                      disabled={isFull || !name.trim()}
                      className="p-3.5 rounded-2xl bg-primary/10 hover:bg-primary text-primary hover:text-dark transition-all active:scale-95 disabled:opacity-20 shadow-lg hover:shadow-primary/20"
                    >
                      <LogIn className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
              {roomList.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-30">
                  <Grid3X3 className="w-12 h-12 mb-4" />
                  <div className="text-[10px] font-black uppercase tracking-[0.2em]">NO PUBLIC ROOMS YET</div>
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default Lobby;
