import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useGameStore } from "./store/useGameStore";
import { useAuthStore } from "./store/useAuthStore";
import Lobby from "./pages/Lobby";
import GameRoom from "./pages/GameRoom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import { SocketProvider } from "./context/SocketContext";

// const PrivateRoute: React.FC<{ children: React.ReactNode, adminOnly?: boolean }> = ({ children, adminOnly }) => {
//   const { user, isAuthenticated } = useAuthStore((state) => ({
//     user: state.user,
//     isAuthenticated: state.isAuthenticated()
//   }));

//   if (!isAuthenticated) return <Navigate to="/login" />;
//   if (adminOnly && user?.role !== 'admin') return <Navigate to="/" />;

//   return <>{children}</>;
// };
const PrivateRoute: React.FC<{
  children: React.ReactNode;
  adminOnly?: boolean;
}> = ({ children, adminOnly }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && user?.role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
};

function App() {
  const roomId = useGameStore((state) => state.roomId);
  console.log('App render, roomId:', roomId);

  return (
    <Router>
      <SocketProvider>
        <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary/30">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/admin"
              element={
                <PrivateRoute adminOnly>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  {!roomId ? <Lobby /> : <GameRoom />}
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </SocketProvider>
    </Router>
  );
}

export default App;
