import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore, GameStatus } from '../store/useGameStore';
import { useSocket } from '../context/SocketContext';
import { X, Circle } from 'lucide-react';

const TicTacToeGrid: React.FC = () => {
  const { board, status, turnPlayerId, playerId, players } = useGameStore();
  const { makeMove } = useSocket();

  const isMyTurn = turnPlayerId === playerId;
  const isPlaying = status === GameStatus.PLAYING;

  const handleCellClick = (index: number) => {
    if (isMyTurn && isPlaying && board[index] === null) {
      makeMove(index);
    }
  };

  const getPlayerSymbol = (pid: string) => {
    return players.find(p => p.id === pid)?.symbol;
  };

  return (
    <div className="relative group max-w-md mx-auto aspect-square">
      {/* Decorative corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
      
      <div className="grid grid-cols-3 gap-4 h-full">
        {board.map((symbol, index) => (
          <motion.button
            key={index}
            whileHover={isPlaying && isMyTurn && !symbol ? { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {}}
            whileTap={isPlaying && isMyTurn && !symbol ? { scale: 0.95 } : {}}
            onClick={() => handleCellClick(index)}
            disabled={!isMyTurn || !isPlaying || symbol !== null}
            className={`
              relative flex items-center justify-center rounded-2xl border-2 transition-all duration-300 aspect-square
              ${symbol 
                ? 'bg-dark-lighter/50 border-white/10 cursor-default shadow-inner' 
                : isMyTurn && isPlaying 
                  ? 'bg-dark-lighter/20 border-white/5 hover:border-primary/30 cursor-pointer' 
                  : 'bg-dark-lighter/10 border-white/5 cursor-not-allowed'}
            `}
          >
            {symbol === 'X' && (
              <motion.div
                initial={{ scale: 0, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                className="text-primary"
              >
                <X size={48} strokeWidth={3} />
              </motion.div>
            )}
            {symbol === 'O' && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-accent-gem"
              >
                <Circle size={40} strokeWidth={3} />
              </motion.div>
            )}
            
            {/* Hover indicator for my turn */}
            {!symbol && isMyTurn && isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
                {getPlayerSymbol(playerId!) === 'X' ? <X size={40} /> : <Circle size={32} />}
              </div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Turn Indicator Overlay for non-turn players */}
      {!isMyTurn && isPlaying && (
        <div className="absolute -bottom-12 left-0 right-0 text-center animate-pulse">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">
            Opponent is thinking...
          </span>
        </div>
      )}
    </div>
  );
};

export default TicTacToeGrid;
