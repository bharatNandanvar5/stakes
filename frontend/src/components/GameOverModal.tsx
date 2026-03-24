import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, LogOut, Gem, Bomb, Star, Skull, User, Swords, Minus } from 'lucide-react';
import { useGameStore, GameStatus, GameType } from '../store/useGameStore';
import { useSocket } from '../context/SocketContext';

const Particle: React.FC<{ type: 'win' | 'loss' | 'draw'; delay: number }> = ({ type, delay }) => {
  const Icon = type === 'win' ? Star : type === 'loss' ? Skull : Minus;
  return (
    <motion.div
      initial={{ y: -20, opacity: 0, scale: 0 }}
      animate={{ 
        y: [0, -100, -200], 
        x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1, 0.5],
        rotate: [0, 180, 360]
      }}
      transition={{ 
        duration: 3 + Math.random() * 2, 
        delay, 
        repeat: Infinity,
        ease: "easeOut"
      }}
      className={`absolute pointer-events-none ${
        type === 'win' ? 'text-primary/40' : 
        type === 'loss' ? 'text-accent-bomb/40' : 
        'text-gray-500/40'
      }`}
    >
      <Icon className="w-4 h-4" />
    </motion.div>
  );
};

const GameOverModal: React.FC = () => {
  const { status, winnerIds, players, playerId, gameType } = useGameStore();
  const { restartGame, leaveRoom } = useSocket();

  if (status !== GameStatus.FINISHED) return null;

  const isDraw = gameType === GameType.TIC_TAC_TOE && winnerIds.length === 0;
  const isWinner = winnerIds.includes(playerId || '');
  const isLoss = !isWinner && !isDraw;
  const isMines = gameType === GameType.MINES;

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-dark/95 backdrop-blur-xl z-[100] flex items-center justify-center p-6">
        {/* Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} type={isWinner ? 'win' : isDraw ? 'draw' : 'loss'} delay={i * 0.2} />
          ))}
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className={`relative max-w-lg w-full glass rounded-[3rem] p-10 border-2 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] ${
            isWinner ? 'border-primary/30 shadow-primary/10' : 
            isDraw ? 'border-gray-500/30 shadow-gray-500/10' :
            'border-accent-bomb/30 shadow-accent-bomb/10'
          }`}
        >
          {/* Decorative Background Elements */}
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${
            isWinner ? 'from-transparent via-primary to-transparent' : 
            isDraw ? 'from-transparent via-gray-500 to-transparent' :
            'from-transparent via-accent-bomb to-transparent'
          }`} />
          <div className={`absolute -top-24 -right-24 w-64 h-64 blur-[100px] rounded-full ${
            isWinner ? 'bg-primary/10' : 
            isDraw ? 'bg-gray-500/10' :
            'bg-accent-bomb/10'
          }`} />

          <div className="relative z-10 text-center">
            {/* Main Icon with Animation */}
            <motion.div 
              initial={{ rotate: -10, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`w-32 h-32 mx-auto mb-8 rounded-[2.5rem] flex items-center justify-center glass ${
                isWinner ? 'border-primary/20 bg-primary/5 shadow-gem' : 
                isDraw ? 'border-gray-500/20 bg-gray-500/5' :
                'border-accent-bomb/20 bg-accent-bomb/5 shadow-bomb'
              }`}
            >
              {isWinner ? (
                <Trophy className="w-16 h-16 text-primary gem-glow" />
              ) : isDraw ? (
                <Swords className="w-16 h-16 text-gray-500" />
              ) : (
                <Skull className="w-16 h-16 text-accent-bomb bomb-explosion" />
              )}
            </motion.div>

            {/* Victory/Defeat/Draw Text */}
            <h2 className={`text-6xl font-black italic tracking-tighter uppercase mb-2 ${
              isWinner ? 'text-primary' : isDraw ? 'text-gray-400' : 'text-accent-bomb'
            }`}>
              {isWinner ? 'VICTORY' : isDraw ? 'DRAW' : 'DEFEAT'}
            </h2>
            <p className="text-gray-500 font-bold tracking-[0.3em] text-[10px] uppercase mb-10">
              {isWinner ? "Arena Dominance Achieved" : isDraw ? "No winner this time" : "Eliminated in the Arena"}
            </p>

            {/* Scoreboard Summary */}
            <div className="space-y-3 mb-12">
              <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest px-4">
                <span>{isMines ? 'FINAL RANKING' : 'PLAYER STATS'}</span>
                <span>{isMines ? 'SCORE' : 'SETS'}</span>
              </div>
              {sortedPlayers.map((p, idx) => (
                <div 
                  key={p.id}
                  className={`flex items-center justify-between p-4 rounded-2xl glass border-white/5 ${
                    p.id === playerId ? 'bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {isMines && (
                      <span className={`w-6 text-center font-black italic text-lg ${
                        idx === 0 ? 'text-primary' : 'text-gray-500'
                      }`}>#{idx + 1}</span>
                    )}
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        winnerIds.includes(p.id) ? 'bg-primary/20 text-primary' : 'bg-dark-lighter text-gray-500'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-black uppercase tracking-wider">{p.name}</div>
                        <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          {isMines ? 'WINS IN THIS RUN:' : 'CURRENT SETS:'} <span className="text-primary">{p.matchWins}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="text-xl font-black font-mono leading-none flex items-center gap-1.5">
                      {isMines ? (
                        <>
                          {winnerIds.includes(p.id) ? <Gem className="w-4 h-4 text-primary" /> : <Bomb className="w-4 h-4 text-accent-bomb" />}
                          {p.score.toLocaleString()}
                        </>
                      ) : (
                        <>
                          <Trophy className={`w-4 h-4 ${winnerIds.includes(p.id) ? 'text-primary' : 'text-gray-600'}`} />
                          {p.matchWins}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={restartGame}
                className={`group relative overflow-hidden py-5 px-8 rounded-2xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 font-black text-lg ${
                  isWinner ? 'bg-primary text-dark hover:bg-primary-hover shadow-lg shadow-primary/20' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <RotateCcw className="w-6 h-6" />
                <span>BATTLE AGAIN</span>
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white/20 opacity-40 group-hover:animate-shine" />
              </button>
              <button
                onClick={leaveRoom}
                className="bg-dark-lighter/50 hover:bg-dark-lighter text-gray-400 hover:text-white border border-white/5 py-5 px-8 rounded-2xl transition-all font-black text-lg flex items-center justify-center gap-3"
              >
                <LogOut className="w-6 h-6" />
                <span>LOBBY</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GameOverModal;
