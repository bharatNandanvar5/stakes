import { create } from 'zustand';

export enum GameStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export interface Player {
  id: string;
  name: string;
  socketId: string;
  score: number;
}

export interface GameState {
  roomId: string | null;
  players: Player[];
  turnPlayerId: string | null;
  grid: (number | null)[];
  revealed: boolean[];
  status: GameStatus;
  winnerId?: string;
  bombCount: number;
  playerName: string;
  playerId: string | null;
}

interface GameStore extends GameState {
  setGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  roomId: null,
  players: [],
  turnPlayerId: null,
  grid: new Array(25).fill(null),
  revealed: new Array(25).fill(false),
  status: GameStatus.WAITING,
  bombCount: 0,
  playerName: '',
  playerId: null,

  setGameState: (state) => set((prev) => {
    console.log('Zustand setting state:', state);
    return { ...prev, ...state };
  }),
  resetGame: () => set({
    grid: new Array(25).fill(null),
    revealed: new Array(25).fill(false),
    status: GameStatus.WAITING,
    winnerId: undefined,
  }),
}));


// SERF1E