import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useGameStore, GameType } from "../store/useGameStore";
import { useAuthStore } from "../store/useAuthStore";

interface SocketContextType {
  socket: Socket | null;
  createRoom: (
    playerName: string,
    settings?: { maxPlayers?: number; bombCount?: number; gameType?: GameType; eliminationMode?: boolean },
  ) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  makeMove: (index: number) => void;
  restartGame: () => void;
  leaveRoom: () => void;
  invitePlayer: (
    toUserId: string,
    settings: { maxPlayers: number; bombCount: number; gameType: GameType; eliminationMode: boolean },
  ) => void;
  acceptInvite: (
    fromSocketId: string,
    settings: { maxPlayers: number; bombCount: number; gameType: GameType; eliminationMode: boolean },
  ) => void;
  rejectInvite: (fromSocketId: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const { setGameState, setOnlineUsers, setIncomingInvite } = useGameStore();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_BACKEND_WS_URL || "http://localhost:3001",
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Connected to server");
      if (user) {
        socket.emit("authenticate", { userId: user.id });
      }
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("game_invite", (invite) => {
      setIncomingInvite(invite);
    });

    socket.on("invite_rejected", ({ fromUser }) => {
      alert(`${fromUser.username} rejected your invite.`);
    });

    socket.on("room_created", ({ roomId, gameState, playerId }) => {
      setGameState({ roomId, ...gameState, playerId });
    });

    socket.on("room_joined", ({ roomId, gameState, playerId }) => {
      setGameState({ roomId, ...gameState, playerId });
    });

    socket.on("player_joined", ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on("game_started", ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on("game_update", ({ gameState }) => {
      setGameState(gameState);
    });

    socket.on("game_over", ({ winnerId, gameState }) => {
      setGameState({ ...gameState, winnerId });
    });

    socket.on("error", ({ message }) => {
      alert(message);
    });

    socket.on("room_state", (gameState) => {
      setGameState(gameState);
    });

    return () => {
      socket.disconnect();
    };
  }, [setGameState, setOnlineUsers, setIncomingInvite, user]);

  const createRoom = (
    playerName: string,
    settings?: { maxPlayers?: number; bombCount?: number; gameType?: GameType; eliminationMode?: boolean },
  ) => {
    socketRef.current?.emit("create_room", { playerName, settings });
    setGameState({ playerName });
  };

  const joinRoom = (roomId: string, playerName: string) => {
    socketRef.current?.emit("join_room", { roomId, playerName });
    setGameState({ playerName });
  };

  const makeMove = (index: number) => {
    const { gameType } = useGameStore.getState();
    if (gameType === GameType.TIC_TAC_TOE) {
      socketRef.current?.emit("make_move", { index });
    } else {
      socketRef.current?.emit("make_move", { tileIndex: index });
    }
  };

  const restartGame = () => {
    socketRef.current?.emit("restart_game");
  };

  const leaveRoom = () => {
    socketRef.current?.emit("leave_room");
    useGameStore.getState().resetGame();
  };

  const invitePlayer = (
    toUserId: string,
    settings: { maxPlayers: number; bombCount: number; gameType: GameType; eliminationMode: boolean },
  ) => {
    socketRef.current?.emit("invite_player", { toUserId, settings });
  };

  const acceptInvite = (
    fromSocketId: string,
    settings: { maxPlayers: number; bombCount: number; gameType: GameType; eliminationMode: boolean },
  ) => {
    socketRef.current?.emit("accept_invite", { fromSocketId, settings });
    setIncomingInvite(null);
  };

  const rejectInvite = (fromSocketId: string) => {
    socketRef.current?.emit("reject_invite", { fromSocketId });
    setIncomingInvite(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        createRoom,
        joinRoom,
        makeMove,
        restartGame,
        leaveRoom,
        invitePlayer,
        acceptInvite,
        rejectInvite,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
