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
  matchWins: number;
}

export interface GameState {
  roomId: string | null;
  players: Player[];
  turnPlayerId: string | null;
  grid: (number | null)[];
  revealed: boolean[];
  status: GameStatus;
  bombCount: number;
  winnerId?: string;
  playerId?: string | null;
  playerName?: string;
  onlineUsers: { userId: string; username: string; socketId: string }[];
  incomingInvite: { fromUser: any; settings: any } | null;
}

const initialState: GameState = {
  roomId: null,
  players: [],
  turnPlayerId: null,
  grid: new Array(25).fill(null),
  revealed: new Array(25).fill(false),
  status: GameStatus.WAITING,
  bombCount: 0,
  winnerId: undefined,
  playerId: null,
  playerName: '',
  onlineUsers: [],
  incomingInvite: null,
};

export const useGameStore = create<GameState & {
  setGameState: (state: Partial<GameState>) => void;
  resetGame: () => void;
  setOnlineUsers: (users: any[]) => void;
  setIncomingInvite: (invite: any) => void;
}>((set) => ({
  ...initialState,
  setGameState: (state) => set((prev) => {
    console.log('Zustand setting state:', state);
    return { ...prev, ...state };
  }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setIncomingInvite: (incomingInvite) => set({ incomingInvite }),
  resetGame: () => set(initialState),
}));
