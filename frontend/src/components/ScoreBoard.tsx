import React from "react";
import { useGameStore, type Player } from "../store/useGameStore";
import { Trophy, User, ArrowRight, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PlayerCard: React.FC<{
  player: Player;
  isTurn: boolean;
  isMe: boolean;
}> = ({ player, isTurn, isMe }) => (
  <div
    className={`p-5 rounded-2xl flex items-center gap-4 transition-all duration-500 relative overflow-hidden ${
      isTurn
        ? "glass border-primary/40 shadow-gem"
        : "bg-dark-lighter/30 border border-white/5"
    }`}
  >
    {isTurn && (
      <motion.div
        layoutId="turn-indicator"
        className="absolute inset-0 bg-primary/5 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
    )}

    <div className="relative">
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          isTurn ? "bg-primary text-dark" : "bg-dark-card text-gray-500"
        }`}
      >
        <User className="w-6 h-6" />
      </div>
      {isTurn && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
        </span>
      )}
    </div>

    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-black uppercase tracking-wider text-sm ${isTurn ? 'text-white' : 'text-gray-400'}`}>
          {player.name}
        </span>
        {isMe && (
          <span className="text-[8px] font-black bg-primary/20 text-primary px-1.5 py-0.5 rounded border border-primary/20">
            YOU
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className={`flex items-center gap-1.5 font-mono font-black text-lg ${isTurn ? 'text-primary' : 'text-gray-500'}`}>
          <Trophy className="w-4 h-4" />
          {player.score.toLocaleString()}
        </div>
        <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
          <span className="text-[9px] font-black text-gray-500">WINS:</span>
          <span className="text-[10px] font-black text-primary">{(player as any).matchWins || 0}</span>
        </div>
      </div>
    </div>

    {isTurn && (
      <div className="flex flex-col items-end gap-1">
        <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em]">
          ACTING
        </span>
        <ArrowRight className="w-4 h-4 text-primary animate-bounce-x" />
      </div>
    )}
  </div>
);

const ScoreBoard: React.FC = () => {
  const { players, turnPlayerId, playerId } = useGameStore();

  return (
    <div className="flex flex-col gap-3 w-full">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isTurn={turnPlayerId === player.id}
          isMe={playerId === player.id}
        />
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
