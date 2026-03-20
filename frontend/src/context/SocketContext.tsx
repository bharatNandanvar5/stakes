import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../store/useGameStore';

interface SocketContextType {
  socket: Socket | null;
  createRoom: (playerName: string) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  makeMove: (tileIndex: number) => void;
  restartGame: () => void;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const { setGameState } = useGameStore();

  useEffect(() => {
    const socket = io('http://192.168.4.9:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('room_created', ({ roomId, gameState, playerId }) => {
      setGameState({ roomId, ...gameState, playerId });
    });

    socket.on('room_joined', ({ roomId, gameState, playerId }) => {
      setGameState({ roomId, ...gameState, playerId });
    });

    socket.on('player_joined', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('game_started', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('tile_revealed', ({ tileIndex, isBomb, gameState }) => {
      setGameState(gameState);
    });

    socket.on('game_update', ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on('game_over', ({ winnerId, gameState }) => {
      setGameState({ ...gameState, winnerId });
    });

    socket.on('error', ({ message }) => {
      alert(message);
    });

    socket.on('room_state', (gameState) => {
      setGameState(gameState);
    });

    return () => {
      socket.disconnect();
    };
  }, [setGameState]);

  const createRoom = (playerName: string) => {
    socketRef.current?.emit('create_room', { playerName });
    setGameState({ playerName });
  };

  const joinRoom = (roomId: string, playerName: string) => {
    socketRef.current?.emit('join_room', { roomId, playerName });
    setGameState({ playerName });
  };

  const makeMove = (tileIndex: number) => {
    socketRef.current?.emit('make_move', { tileIndex });
  };

  const restartGame = () => {
    socketRef.current?.emit('restart_game');
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave_room');
    useGameStore.getState().resetGame();
  };

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, createRoom, joinRoom, makeMove, restartGame, leaveRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
