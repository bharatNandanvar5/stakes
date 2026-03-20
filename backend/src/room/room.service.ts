import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GameService, GameState } from '../game/game.service';


@Injectable()
export class RoomService {
  private rooms: Map<string, GameState> = new Map();
  private playerToRoom: Map<string, string> = new Map(); // socketId -> roomId

  constructor(private readonly gameService: GameService) { }

  createRoom(playerName: string, socketId: string, settings: { maxPlayers?: number; bombCount?: number } = {}): string {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player: any = {
      id: uuidv4(),
      name: playerName,
      socketId,
      score: 0,
      matchWins: 0, // Wins in this specific room run
    };

    const gameState: any = {
      roomId,
      players: [player],
      turnPlayerId: null,
      grid: [],
      revealed: [],
      status: GameState.WAITING,
      settings: {
        maxPlayers: Math.min(Math.max(settings.maxPlayers || 2, 2), 5),
        bombCount: Math.min(Math.max(settings.bombCount || 5, 1), 20),
      },
    };

    this.rooms.set(roomId, gameState);
    this.playerToRoom.set(socketId, roomId);
    return roomId;
  }

  joinRoom(roomId: string, playerName: string, socketId: string): GameState {
    const room: any = this.rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (room.players.length >= room.settings.maxPlayers) {
      throw new Error('Room is full');
    }

    const player: any = {
      id: uuidv4(),
      name: playerName,
      socketId,
      score: 0,
      matchWins: 0,
    };

    room.players.push(player);
    this.playerToRoom.set(socketId, roomId);

    // Auto-start if all players are present
    if (room.players.length === room.settings.maxPlayers) {
      const initializedGame = this.gameService.initializeGame(roomId, room.players, room.settings.bombCount);
      initializedGame.settings = room.settings; // Keep settings
      this.rooms.set(roomId, initializedGame);
      return initializedGame;
    }

    return room;
  }

  restartGame(roomId: string): GameState {
    const room: any = this.rooms.get(roomId);
    if (!room || room.status !== GameState.FINISHED) {
      throw new Error('Cannot restart: room not found or game not finished');
    }

    // Maintain matchWins!
    const winners = room.players.filter(p => p.id === room.winnerId);
    room.players.forEach(p => {
      if (p.id === room.winnerId) p.matchWins++;
    });

    const initializedGame = this.gameService.initializeGame(roomId, room.players, room.settings.bombCount);
    initializedGame.settings = room.settings;
    this.rooms.set(roomId, initializedGame);
    return initializedGame;
  }

  getRoomBySocketId(socketId: string): GameState | undefined {
    const roomId = this.playerToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getAllRooms(): GameState[] {
    return Array.from(this.rooms.values());
  }

  removePlayer(socketId: string) {
    const roomId = this.playerToRoom.get(socketId);
    if (roomId) {
      const room: any = this.rooms.get(roomId);
      if (room) {
        room.players = room.players.filter((p) => p.socketId !== socketId);
        if (room.players.length === 0) {
          this.rooms.delete(roomId);
        } else {
          room.status = GameState.FINISHED;
          room.winnerId = room.players[0].id; // The remaining player wins
        }
      }
      this.playerToRoom.delete(socketId);
      return roomId;
    }
    return null;
  }

  // restartGame(roomId: string): GameState {
  //   const room: any = this.rooms.get(roomId);
  //   if (!room || room.status !== GameState.FINISHED) {
  //     throw new Error('Cannot restart: room not found or game not finished');
  //   }

  //   const initializedGame = this.gameService.initializeGame(roomId, room.players);
  //   this.rooms.set(roomId, initializedGame);
  //   return initializedGame;
  // }
}
