import React from "react";
import { useGameStore } from "./store/useGameStore";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const { roomId } = useGameStore();

  return (
    <SocketProvider>
      <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary/30">
        {!roomId ? <Lobby /> : <GameRoom />}
      </div>
    </SocketProvider>
  );
}

export default App;
