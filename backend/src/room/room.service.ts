import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GameService } from '../game/game.service';
import { TicTacToeService } from '../game/tictactoe.service';
import { GameType, GameState } from '../game/game.types';


@Injectable()
export class RoomService {
  private rooms: Map<string, any> = new Map();
  private playerToRoom: Map<string, string> = new Map();

  constructor(
    private readonly gameService: GameService,
    private readonly tttService: TicTacToeService,
  ) { }

  createRoom(playerName: string, socketId: string, settings: { maxPlayers?: number; bombCount?: number; gameType?: GameType } = {}): string {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const gameType = settings.gameType || GameType.MINES;
    
    const player: any = {
      id: uuidv4(),
      name: playerName,
      socketId,
      score: 0,
      matchWins: 0,
    };

    const room: any = {
      roomId,
      players: [player],
      turnPlayerId: null,
      status: GameState.WAITING,
      gameType,
      settings: {
        maxPlayers: gameType === GameType.TIC_TAC_TOE ? 2 : Math.min(Math.max(settings.maxPlayers || 2, 2), 5),
        bombCount: Math.min(Math.max(settings.bombCount || 5, 1), 20),
      },
      gameData: null, // Isolated game data
    };

    this.rooms.set(roomId, room);
    this.playerToRoom.set(socketId, roomId);
    return roomId;
  }

  joinRoom(roomId: string, playerName: string, socketId: string): any {
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
      if (room.gameType === GameType.TIC_TAC_TOE) {
        room.gameData = this.tttService.initializeGame(roomId, room.players);
      } else {
        room.gameData = this.gameService.initializeGame(roomId, room.players, room.settings.bombCount);
      }
      room.status = GameState.PLAYING;
    }

    return room;
  }

  restartGame(roomId: string): any {
    const room: any = this.rooms.get(roomId);
    if (!room || room.status !== GameState.FINISHED) {
      throw new Error('Cannot restart: room not found or game not finished');
    }

    // Move scores to matchWins if they won
    room.players.forEach(p => {
      if (p.id === room.gameData?.winnerId) p.matchWins++;
      p.score = 0;
    });

    if (room.gameType === GameType.TIC_TAC_TOE) {
      room.gameData = this.tttService.initializeGame(roomId, room.players);
    } else {
      room.gameData = this.gameService.initializeGame(roomId, room.players, room.settings.bombCount);
    }

    room.status = GameState.PLAYING;
    return room;
  }

  private onlineUsers = new Map<string, { userId: string; username: string; socketId: string }>();

  addOnlineUser(socketId: string, userId: string, username: string) {
    this.onlineUsers.set(socketId, { userId, username, socketId });
  }

  removeOnlineUser(socketId: string) {
    this.onlineUsers.delete(socketId);
  }

  getOnlineUsers() {
    return Array.from(this.onlineUsers.values());
  }

  getOnlineUserByUserId(userId: string) {
    return Array.from(this.onlineUsers.values()).find(u => u.userId === userId);
  }

  getRoom(roomId: string): GameState | undefined {
    return this.rooms.get(roomId);
  }

  getRoomBySocketId(socketId: string): GameState | undefined {
    const roomId = this.playerToRoom.get(socketId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  getAllRooms(): any[] {
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
          room.winnerId = room.players[0].id;
        }
      }
      this.playerToRoom.delete(socketId);
      return roomId;
    }
    return null;
  }
}
