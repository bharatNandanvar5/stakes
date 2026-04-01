import React from "react";
import { useGameStore, type Player } from "../store/useGameStore";
import { Trophy, User, ArrowRight, Users, X, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const PlayerCard: React.FC<{
  player: Player & { symbol?: string };
  isTurn: boolean;
  isMe: boolean;
}> = ({ player, isTurn, isMe }) => (
  <div
    className={`p-5 rounded-3xl flex items-center gap-4 transition-all duration-500 relative overflow-hidden ${
      player.eliminated 
        ? "bg-dark-card/20 border border-accent-bomb/20 opacity-60" 
        : isTurn
          ? "bg-primary text-dark shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] scale-[1.02]"
          : "bg-white/5 border border-white/5 hover:bg-white/10"
    }`}
  >
    {isTurn && !player.eliminated && (
      <motion.div
        layoutId="turn-indicator"
        className="absolute inset-0 bg-white/10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    )}

    <div className="relative">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          player.eliminated 
            ? "bg-accent-bomb/10 text-accent-bomb border border-accent-bomb/20" 
            : isTurn ? "bg-white text-primary shadow-xl" : "bg-dark-card text-gray-500"
        }`}
      >
        {player.eliminated ? (
          <X className="w-6 h-6" />
        ) : player.symbol ? (
          <span className="text-2xl font-black">{player.symbol}</span>
        ) : (
          <User className="w-6 h-6" />
        )}
      </div>
      {isTurn && !player.eliminated && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
      )}
    </div>

    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-black uppercase tracking-wider text-sm ${
          player.eliminated ? 'text-accent-bomb line-through' : isTurn ? 'text-dark' : 'text-gray-300'
        }`}>
          {player.name}
        </span>
        {player.eliminated && (
          <span className="text-[8px] font-black bg-accent-bomb/20 text-accent-bomb px-1.5 py-0.5 rounded border border-accent-bomb/20">
            ELIMINATED
          </span>
        )}
        {isMe && (
          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
            isTurn ? 'bg-dark/20 text-dark border-dark/20' : 'bg-primary/20 text-primary border-primary/20'
          }`}>
            YOU
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${isTurn ? 'text-dark' : 'text-primary'}`}>
          <Trophy className="w-4 h-4" />
          {player.score.toLocaleString()}
        </div>
        {player.matchWins !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border ${
            isTurn ? 'bg-dark/10 border-dark/10' : 'bg-white/5 border-white/5'
          }`}>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isTurn ? 'text-dark/60' : 'text-gray-500'}`}>SETS:</span>
            <span className={`text-[10px] font-black ${isTurn ? 'text-dark' : 'text-primary'}`}>{player.matchWins}</span>
          </div>
        )}
      </div>
    </div>

    {isTurn && (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[8px] font-black text-dark uppercase tracking-[0.2em]">
          ACTING
        </span>
        <ArrowRight className="w-4 h-4 text-dark animate-bounce-x" />
      </div>
    )}
  </div>
);

const ScoreBoard: React.FC = () => {
  const { players, turnPlayerId, playerId, gameType } = useGameStore();
  const isScribble = gameType === 'SCRIBBLE';

  return (
    <div className="flex flex-col gap-3 w-full">
      {players.map((player) => (
        <div key={player.id} className="relative group">
          <PlayerCard
            player={player}
            isTurn={turnPlayerId === player.id}
            isMe={playerId === player.id}
          />
          {isScribble && player.hasGuessed && player.id !== turnPlayerId && (
            <div className="absolute top-2 right-2 bg-primary/20 text-primary p-1.5 rounded-lg border border-primary/20 backdrop-blur-sm shadow-lg animate-in fade-in zoom-in duration-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      ))}
      {players.length < 2 && (
        <div className="p-5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 opacity-50">
          <Users className="w-5 h-5 text-gray-500" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            Waiting for opponent
          </span>
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
