import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GameService, GameState } from '../game/game.service';


@Injectable()
export class RoomService {
  private rooms: Map<string, GameState> = new Map();
  private playerToRoom: Map<string, string> = new Map(); // socketId -> roomId

  constructor(private readonly gameService: GameService) { }

  createRoom(playerName: string, socketId: string): string {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const player: any = {
      id: uuidv4(),
      name: playerName,
      socketId,
      score: 0,
    };

    const gameState: any = {
      roomId,
      players: [player],
      turnPlayerId: null,
      grid: [],
      revealed: [],
      status: GameState.WAITING,
      bombCount: 0,
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

    if (room.players.length >= 2) {
      throw new Error('Room is full');
    }

    const player: any = {
      id: uuidv4(),
      name: playerName,
      socketId,
      score: 0,
    };

    room.players.push(player);
    this.playerToRoom.set(socketId, roomId);

    // Auto-start if 2 players are present
    if (room.players.length === 2) {
      const initializedGame = this.gameService.initializeGame(roomId, room.players);
      this.rooms.set(roomId, initializedGame);
      return initializedGame;
    }

    return room;
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): GameState | undefined {
    const roomId = this.playerToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
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

  restartGame(roomId: string): GameState {
    const room: any = this.rooms.get(roomId);
    if (!room || room.status !== GameState.FINISHED) {
      throw new Error('Cannot restart: room not found or game not finished');
    }

    const initializedGame = this.gameService.initializeGame(roomId, room.players);
    this.rooms.set(roomId, initializedGame);
    return initializedGame;
  }
}
