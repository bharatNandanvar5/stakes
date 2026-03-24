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

export enum GameType {
  MINES = 'mines',
  TIC_TAC_TOE = 'tictactoe',
}

export interface GameState {
  roomId: string | null;
  players: Player[];
  turnPlayerId: string | null;
  grid: (number | null)[];
  board: (string | null)[];
  revealed: boolean[];
  status: GameStatus;
  gameType: GameType;
  bombCount: number;
  winnerIds: string[];
  playerId?: string;
  playerName?: string;
  onlineUsers: { userId: string; username: string; socketId: string }[];
  incomingInvite: { fromUser: any; settings: any } | null;
}

const initialState: GameState = {
  roomId: null,
  players: [],
  turnPlayerId: null,
  grid: new Array(25).fill(null),
  board: new Array(9).fill(null),
  revealed: new Array(25).fill(false),
  status: GameStatus.WAITING,
  gameType: GameType.MINES,
  bombCount: 0,
  winnerIds: [],
  playerId: undefined,
  playerName: undefined,
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
    return { ...prev, ...state };
  }),
  setOnlineUsers: (onlineUsers) => set({ onlineUsers }),
  setIncomingInvite: (incomingInvite) => set({ incomingInvite }),
  resetGame: () => set(initialState),
}));
