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
import { GameService, GameState } from '../game/game.service';
import { HistoryService } from '../history/history.service';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

export class RoomGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;


  constructor(
    private readonly roomService: RoomService,
    private readonly gameService: GameService,
    private readonly historyService: HistoryService,
    private readonly usersService: UsersService,
  ) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomId = this.roomService.removePlayer(client.id);
    if (roomId) {
      const room = this.roomService.getRoomBySocketId(roomId);
      if (room) {
        this.server.to(roomId).emit('room_state', this.gameService.getClientState(room, ''));
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    // In a real app, we would verify the JWT here. 
    // For now, we'll trust the userId from the client to link the session.
    (client as any).userId = data.userId;
    console.log(`Socket ${client.id} authenticated as user ${data.userId}`);
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @MessageBody() data: { playerName: string, settings?: { maxPlayers?: number, bombCount?: number } },
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
        gameState: this.gameService.getClientState(room, client.id),
        playerId: player?.id
      };
      console.log('Emitting room_created:', response);
      client.emit('room_created', response);
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      console.log('handleJoinRoom:', data);
      const roomId = data.roomId.toUpperCase();
      const gameState: any = this.roomService.joinRoom(roomId, data.playerName, client.id);
      client.join(roomId);

      const player = gameState.players.find(p => p.socketId === client.id);
      if ((client as any).userId) player.userId = (client as any).userId;
      
      const response = { 
        roomId, 
        gameState: this.gameService.getClientState(gameState, ''),
        playerId: player?.id 
      };
      console.log('Emitting room_joined:', response);
      client.emit('room_joined', response);

      // Broadcast room update to all players
      this.server.to(roomId).emit('player_joined', { roomId, gameState: this.gameService.getClientState(gameState, '') });

      if (gameState.status === GameState.PLAYING) {
        this.server.to(roomId).emit('game_started', { gameState: this.gameService.getClientState(gameState, '') });
      }
    } catch (error) {
      console.error('Join room error:', error.message);
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('make_move')
  async handleMakeMove(
    @MessageBody() { tileIndex }: { tileIndex: number },
    @ConnectedSocket() client: Socket,
  ) {
    const room: any = this.roomService.getRoomBySocketId(client.id);
    if (!room) return;

    const currentPlayer = room.players.find(p => p.socketId === client.id);
    if (!currentPlayer) return;

    try {
      const { isBomb, state } = this.gameService.makeMove(room, currentPlayer.id, tileIndex);
      const gameState = this.gameService.getClientState(state, '');

      // Unified event for state changes
      this.server.to(room.roomId).emit('game_update', {
        tileIndex,
        isBomb,
        gameState,
        event: state.status === GameState.FINISHED ? 'game_over' : 'tile_revealed'
      });

      if (state.status === GameState.FINISHED) {
        await this.saveGameHistory(state);
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  private async saveGameHistory(state: any) {
    const playersWithUserId = state.players.filter(p => p.userId);
    if (playersWithUserId.length === 0) return;

    const historyData = {
      roomId: state.roomId,
      players: playersWithUserId.map(p => p.userId),
      winnerId: state.players.find(p => p.id === state.winnerId)?.userId,
      settings: state.settings,
      results: state.players.map(p => ({
        userId: p.userId,
        score: p.score,
        isWinner: p.id === state.winnerId
      }))
    };

    await this.historyService.create(historyData);
    
    // Update user stats
    for (const player of state.players) {
      if (player.userId) {
        await this.usersService.updateStats(
          player.userId, 
          player.id === state.winnerId, 
          player.score
        );
      }
    }
  }

  @SubscribeMessage('restart_game')
  handleRestartGame(@ConnectedSocket() client: Socket) {
    const room: any = this.roomService.getRoomBySocketId(client.id);
    if (!room) return;

    try {
      const gameState = this.roomService.restartGame(room.roomId);
      this.server.to(room.roomId).emit('game_started', {
        gameState: this.gameService.getClientState(gameState, ''),
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
      const room = this.roomService.getRoomBySocketId(roomId);
      if (room) {
        this.server.to(roomId).emit('room_state', this.gameService.getClientState(room, ''));
      }
    }
  }
}
