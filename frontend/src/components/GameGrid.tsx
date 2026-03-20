import React from 'react';
import Tile from './Tile';
import { useGameStore, GameStatus } from '../store/useGameStore';
import { useSocket } from '../context/SocketContext';

const GameGrid: React.FC = () => {
  const { grid, revealed, status, turnPlayerId, playerId } = useGameStore();
  const { makeMove } = useSocket();

  const isMyTurn = turnPlayerId === playerId;
  const isPlaying = status === GameStatus.PLAYING;

  const handleTileClick = (index: number) => {
    if (isMyTurn && isPlaying && !revealed[index]) {
      makeMove(index);
    }
  };

  return (
    <div className="relative group">
      {/* Decorative corners */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary/30 rounded-br-lg" />
      
      <div className="grid grid-cols-5 gap-3 w-full max-w-md mx-auto aspect-square">
        {grid.map((value, index) => (
          <Tile
            key={index}
            index={index}
            value={value}
            revealed={revealed[index]}
            disabled={!isMyTurn || !isPlaying}
            onClick={() => handleTileClick(index)}
          />
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

export default GameGrid;
