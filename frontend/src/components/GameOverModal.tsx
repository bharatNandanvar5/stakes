import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, LogOut } from 'lucide-react';
import { useGameStore, GameStatus } from '../store/useGameStore';
import { useSocket } from '../context/SocketContext';

const GameOverModal: React.FC = () => {
  const { status, winnerId, players, playerId } = useGameStore();
  const { restartGame, leaveRoom } = useSocket();

  if (status !== GameStatus.FINISHED) return null;

  const winner = players.find((p) => p.id === winnerId);
  const isWinner = winnerId === playerId;

  return (
    <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-dark-card border-2 border-primary/20 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center"
      >
        <Trophy className={`w-16 h-16 mx-auto mb-4 ${isWinner ? 'text-primary' : 'text-gray-400'}`} />
        <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">
          {isWinner ? 'Victory!' : 'Defeat!'}
        </h2>
        <p className="text-gray-400 mb-8">
          {isWinner ? "You've successfully evaded the bombs and dominated the board." : `${winner?.name} has won this round.`}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={restartGame}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-dark font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            PLAY AGAIN
          </button>
          <button
            onClick={leaveRoom}
            className="flex items-center justify-center gap-2 bg-dark-lighter hover:bg-dark-card text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            LOBBY
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameOverModal;
