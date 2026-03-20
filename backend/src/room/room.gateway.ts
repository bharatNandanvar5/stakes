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
  ) { }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const roomId = this.roomService.removePlayer(client.id);
    if (roomId) {
      const room = this.roomService.getRoom(roomId);
      if (room) {
        this.server.to(roomId).emit('room_state', this.gameService.getClientState(room, ''));
      }
    }
  }

  @SubscribeMessage('create_room')
  handleCreateRoom(
    @MessageBody() data: { playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    const roomId = this.roomService.createRoom(data.playerName, client.id);
    client.join(roomId);
    const room: any = this.roomService.getRoom(roomId);
    if (room) {
      const player = room.players.find(p => p.socketId === client.id);
      client.emit('room_created', {
        roomId,
        gameState: this.gameService.getClientState(room, client.id),
        playerId: player?.id
      });
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string; playerName: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const roomId = data.roomId.toUpperCase();
      const gameState: any = this.roomService.joinRoom(roomId, data.playerName, client.id);
      client.join(roomId);

      const player = gameState.players.find(p => p.socketId === client.id);
      client.emit('room_joined', {
        roomId,
        gameState: this.gameService.getClientState(gameState, ''),
        playerId: player?.id
      });

      // Broadcast room update to all players
      this.server.to(roomId).emit('player_joined', { roomId, gameState: this.gameService.getClientState(gameState, '') });

      if (gameState.status === GameState.PLAYING) {
        this.server.to(roomId).emit('game_started', { gameState: this.gameService.getClientState(gameState, '') });
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('make_move')
  handleMakeMove(
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
    } catch (error) {
      client.emit('error', { message: error.message });
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
      const room = this.roomService.getRoom(roomId);
      if (room) {
        this.server.to(roomId).emit('room_state', this.gameService.getClientState(room, ''));
      }
    }
  }
}
