import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import { GameService } from '../game/game.service';
import { TicTacToeService } from '../game/tictactoe.service';
import { ScribbleService } from '../game/scribble.service';
import { HistoryService } from '../history/history.service';
import { UsersService } from '../users/users.service';
import { GameType, GameState } from '../game/game.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;


  private scribbleTimers: Map<string, NodeJS.Timeout> = new Map();

  // private startScribbleTimer(roomId: string, durationMs: number) {
  //   if (this.scribbleTimers.has(roomId)) {
  //     clearTimeout(this.scribbleTimers.get(roomId));
  //   }

  //   const timer = setTimeout(async () => {
  //     const room: any = this.roomService.getRoom(roomId);
  //     if (room && room.gameType === GameType.SCRIBBLE && room.status === GameState.PLAYING) {
  //       this.scribbleService.makeMove(room.gameData, '', { type: 'time_up' });
  //       room.status = room.gameData.status;

  //       const sockets = await this.server.in(roomId).fetchSockets();
  //       for (const s of sockets) {
  //         this.server.to(s.id).emit('game_update', {
  //           action: { type: 'time_up' },
  //           gameState: this.getClientState(room, s.id),
  //           event: 'move_made'
  //         });
  //       }
  //       this.scribbleTimers.delete(roomId);
  //     }
  //   }, durationMs);

  //   this.scribbleTimers.set(roomId, timer);
  // }

  private startScribbleTimer(roomId: string, durationMs: number) {
    if (this.scribbleTimers.has(roomId)) {
      clearTimeout(this.scribbleTimers.get(roomId));
    }

    const timer = setTimeout(async () => {
      try {
        const room: any = this.roomService.getRoom(roomId);

        if (
          !room ||
          room.gameType !== GameType.SCRIBBLE ||
          room.status !== GameState.PLAYING
        ) {
          return;
        }

        this.scribbleService.makeMove(room.gameData, '', { type: 'time_up' });
        room.status = room.gameData.status;

        const sockets = await this.server.in(roomId).fetchSockets();

        for (const s of sockets) {
          this.server.to(s.id).emit('game_update', {
            action: { type: 'time_up' },
            gameState: this.getClientState(room, s.id),
            event: 'move_made',
          });
        }
      } catch (err) {
        // optional: log for observability
        console.error(`Scribble timer failed for room ${roomId}`, err);
      } finally {
        // ✅ guaranteed cleanup
        this.scribbleTimers.delete(roomId);
      }
    }, durationMs);

    this.scribbleTimers.set(roomId, timer);
  }

  private clearScribbleTimer(roomId: string) {
    if (this.scribbleTimers.has(roomId)) {
      clearTimeout(this.scribbleTimers.get(roomId));
      this.scribbleTimers.delete(roomId);
    }
  }

  constructor(
    private readonly roomService: RoomService,
    private readonly gameService: GameService,
    private readonly tttService: TicTacToeService,
    private readonly scribbleService: ScribbleService,
    private readonly historyService: HistoryService,
    private readonly usersService: UsersService,
  ) { }

  private getClientState(room: any, socketId: string = '') {
    let gameState: any;
    const gameData = room.gameData || room;

    if (room.gameType === GameType.TIC_TAC_TOE) {
      gameState = this.tttService.getClientState(gameData);
    } else if (room.gameType === GameType.SCRIBBLE) {
      gameState = this.scribbleService.getClientState(gameData, socketId);
    } else {
      gameState = this.gameService.getClientState(gameData, socketId);
    }

    return {
      ...gameState,
      roomId: room.roomId,
      players: room.players,
      status: room.status, // wait, room.status vs room.gameData.status... let GameState override
      gameType: room.gameType,
      settings: room.settings,
    };
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    client.emit('room_list', this.roomService.getPublicRooms());
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.roomService.removeOnlineUser(client.id);
    this.server.emit('online_users', this.roomService.getOnlineUsers());

    const roomId = this.roomService.removePlayer(client.id);
    if (roomId) {
      const room = this.roomService.getRoom(roomId);
      if (room) {
        this.server.to(roomId).emit('room_state', this.getClientState(room));
      }
    }
    this.server.emit('room_list', this.roomService.getPublicRooms());
  }

  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    (client as any).userId = data.userId;
    const user: any = await this.usersService.findById(data.userId);
    if (user) {
      this.roomService.addOnlineUser(client.id, user.id, user.username);
      this.server.emit('online_users', this.roomService.getOnlineUsers());
    }
    console.log(`Socket ${client.id} authenticated as user ${data.userId}`);
  }

  @SubscribeMessage('invite_player')
  handleInvitePlayer(
    @MessageBody() data: { toUserId: string; settings: { maxPlayers: number; bombCount: number; gameType: GameType; eliminationMode: boolean; cycles?: number } },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUser = this.roomService.getOnlineUsers().find(u => u.socketId === client.id);
    const targetUser = this.roomService.getOnlineUserByUserId(data.toUserId);

    if (fromUser && targetUser) {
      this.server.to(targetUser.socketId).emit('game_invite', {
        fromUser,
        settings: data.settings
      });
    }
  }

  @SubscribeMessage('accept_invite')
  handleAcceptInvite(
    @MessageBody() data: { fromSocketId: string; settings: { maxPlayers: number; bombCount: number; gameType: GameType; eliminationMode: boolean; cycles?: number } },
    @ConnectedSocket() client: Socket,
  ) {
    const fromUser = this.roomService.getOnlineUsers().find(u => u.socketId === data.fromSocketId);
    const toUser = this.roomService.getOnlineUsers().find(u => u.socketId === client.id);

    if (fromUser && toUser) {
      const roomId = this.roomService.createRoom(fromUser.username, fromUser.socketId, { ...data.settings, isPublic: false });
      this.roomService.joinRoom(roomId, toUser.username, toUser.socketId);

      const room: any = this.roomService.getRoom(roomId);

      const p1 = room.players.find(p => p.socketId === fromUser.socketId);
      const p2 = room.players.find(p => p.socketId === toUser.socketId);
      if (p1) p1.userId = fromUser.userId;
      if (p2) p2.userId = toUser.userId;

      const fromSocket = this.server.sockets.sockets.get(fromUser.socketId);
      const toSocket = this.server.sockets.sockets.get(toUser.socketId);

      fromSocket?.join(roomId);
      toSocket?.join(roomId);

      this.server.to(fromUser.socketId).emit('room_created', {
        roomId,
        gameState: this.getClientState(room, fromUser.socketId),
        playerId: p1?.id
      });

      this.server.to(toUser.socketId).emit('room_joined', {
        roomId,
        gameState: this.getClientState(room, toUser.socketId),
        playerId: p2?.id
      });

      this.server.to(roomId).emit('game_started', { gameState: this.getClientState(room) });
      if (room.gameType === GameType.SCRIBBLE) {
        this.startScribbleTimer(roomId, 80000);
      }
    }
  }

  @SubscribeMessage('reject_invite')
  handleRejectInvite(
    @MessageBody() data: { fromSocketId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const toUser = this.roomService.getOnlineUsers().find(u => u.socketId === client.id);
    if (toUser) {
      this.server.to(data.fromSocketId).emit('invite_rejected', {
        fromUser: toUser
      });
    }
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @MessageBody() data: { playerName: string, settings?: { maxPlayers?: number, bombCount?: number, gameType?: GameType, eliminationMode?: boolean, isPublic?: boolean, cycles?: number } },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('handleCreateRoom:', data);
    const roomId = this.roomService.createRoom(data.playerName, client.id, data.settings);
    client.join(roomId);
    const room: any = this.roomService.getRoomBySocketId(client.id);
    console.log('Room found for creator:', room?.roomId);
    if (room) {
      const player = room.players.find(p => p.socketId === client.id);
      if ((client as any).userId) player.userId = (client as any).userId;

      const response = {
        roomId,
        gameState: this.getClientState(room, client.id),
        playerId: player?.id
      };
      client.emit('room_created', response);
    }
    this.server.emit('room_list', this.roomService.getPublicRooms());
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @MessageBody() data: { roomId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('handleJoinRoom:', data);
      const roomId = data.roomId.toUpperCase();
      const gameState: any = await this.roomService.joinRoom(roomId, data.playerName, client.id);
      client.join(roomId);

      const player = gameState.players.find(p => p.socketId === client.id);
      if ((client as any).userId) player.userId = (client as any).userId;

      const response = {
        roomId,
        gameState: this.getClientState(gameState, client.id),
        playerId: player?.id
      };
      client.emit('room_joined', response);

      // Broadcast room update to all players
      this.server.to(roomId).emit('player_joined', { roomId, gameState: this.getClientState(gameState) });

      if (gameState.status === GameState.PLAYING) {
        this.server.to(roomId).emit('game_started', { gameState: this.getClientState(gameState) });
        if (gameState.gameType === GameType.SCRIBBLE) {
          this.startScribbleTimer(roomId, 80000);
        }
      }
      this.server.emit('room_list', this.roomService.getPublicRooms());
    } catch (error) {
      console.error('Join room error:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('make_move')
  async handleMakeMove(
    @MessageBody() { tileIndex, index, action }: { tileIndex?: number, index?: number, action?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const room: any = this.roomService.getRoomBySocketId(client.id);
    if (!room || !room.gameData) return;

    const currentPlayer = room.players.find(p => p.socketId === client.id);
    if (!currentPlayer) return;

    try {
      if (room.gameType === GameType.TIC_TAC_TOE) {
        this.tttService.makeMove(room.gameData, currentPlayer.id, index);
      } else if (room.gameType === GameType.SCRIBBLE) {
        this.scribbleService.makeMove(room.gameData, currentPlayer.id, action);
      } else {
        this.gameService.makeMove(room.gameData, currentPlayer.id, tileIndex);
      }

      // Sync room status with game status
      room.status = room.gameData.status;

      // Sync player scores from gameData back to room.players
      if (room.gameData.players) {
        room.gameData.players.forEach((p: any) => {
          const roomPlayer = room.players.find((rp: any) => rp.id === p.id);
          if (roomPlayer) roomPlayer.score = p.score;
        });
      }

      // If round ended, clear timer
      if (room.gameType === GameType.SCRIBBLE && room.status === "round_ended") {
        this.clearScribbleTimer(room.roomId);
      }

      // If starting next round, start new timer
      if (room.gameType === GameType.SCRIBBLE && action?.type === 'next_round' && room.status === GameState.PLAYING) {
        this.startScribbleTimer(room.roomId, 80000);
      }

      // Notice for scribble, state changes based on who is viewing it
      if (room.gameType === GameType.SCRIBBLE) {
        // for scribble emit specifically to each one so secret word is hidden
        const sockets = await this.server.in(room.roomId).fetchSockets();
        for (const s of sockets) {
          this.server.to(s.id).emit('game_update', {
            action,
            gameState: this.getClientState(room, s.id),
            event: room.status === GameState.FINISHED ? 'game_over' : 'move_made'
          });
        }
      } else {
        const gameState = this.getClientState(room, '');
        // Unified event for state changes
        this.server.to(room.roomId).emit('game_update', {
          tileIndex,
          index,
          gameState,
          event: room.status === GameState.FINISHED ? 'game_over' : 'move_made'
        });
      }

      if (room.status === GameState.FINISHED) {
        await this.saveGameHistory(room);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('scribble_draw')
  handleScribbleDraw(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    const room: any = this.roomService.getRoomBySocketId(client.id);
    if (!room || room.gameType !== GameType.SCRIBBLE || room.status !== GameState.PLAYING) return;

    // Validate drawer
    const currentPlayer = room.players.find(p => p.socketId === client.id);
    if (!currentPlayer || currentPlayer.id !== room.gameData.turnPlayerId) return;

    // Optional: store history for newly joined players
    // room.gameData.drawHistory.push(data);

    // Broadcast to others
    client.to(room.roomId).emit('scribble_draw', data);
  }

  private async saveGameHistory(room: any) {
    const playersWithUserId = room.players.filter(p => p.userId);
    if (playersWithUserId.length === 0) return;

    const winnerIds = room.gameData?.winnerIds || [];
    const winnerUserIds = room.players
      .filter(p => winnerIds.includes(p.id) && p.userId)
      .map(p => p.userId);

    const historyData = {
      roomId: room.roomId,
      players: playersWithUserId.map(p => p.userId),
      winnerIds: winnerUserIds,
      settings: room.settings,
      results: room.players.map(p => ({
        userId: p.userId,
        score: p.score,
        isWinner: winnerIds.includes(p.id)
      }))
    };

    await this.historyService.create(historyData);

    // Update user stats
    for (const player of room?.gameData?.players) {
      if (player.userId) {
        await this.usersService.updateStats(
          player.userId,
          winnerIds.includes(player.id),
          player.score
        );
      }
    }
  }

  @SubscribeMessage('restart_game')
  async handleRestartGame(@ConnectedSocket() client: Socket) {
    const room: any = this.roomService.getRoomBySocketId(client.id);
    if (!room) return;

    try {
      const newGameState = await this.roomService.restartGame(room.roomId);
      if (newGameState.gameType === GameType.SCRIBBLE) {
        this.startScribbleTimer(room.roomId, 80000);
      }
      this.server.to(room.roomId).emit('game_started', {
        gameState: this.getClientState(newGameState)
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket) {
    const roomId = this.roomService.removePlayer(client.id);
    if (roomId) {
      client.leave(roomId);
      const room = this.roomService.getRoom(roomId);
      if (room) {
        this.server.to(roomId).emit('room_state', this.getClientState(room));
      }
    }
    this.server.emit('room_list', this.roomService.getPublicRooms());
  }
}
