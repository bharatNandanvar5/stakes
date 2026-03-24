import { Injectable } from '@nestjs/common';
import { GameState } from './game.types';

@Injectable()
export class TicTacToeService {
  private readonly BOARD_SIZE = 9;

  initializeGame(roomId: string, players: any[]): any {
    return {
      roomId,
      players: players.map((p, index) => ({
        ...p,
        symbol: index === 0 ? 'X' : 'O',
        score: 0
      })),
      turnPlayerId: players[0].id,
      board: new Array(this.BOARD_SIZE).fill(null),
      status: GameState.PLAYING,
      winnerId: null,
    };
  }

  makeMove(state: any, playerId: string, index: number) {
    if (state.status !== GameState.PLAYING || state.turnPlayerId !== playerId) {
      throw new Error('Invalid move: not your turn or game not playing');
    }

    if (index < 0 || index >= this.BOARD_SIZE || state.board[index] !== null) {
      throw new Error('Invalid move: position already taken or out of bounds');
    }

    const currentPlayer = state.players.find(p => p.id === playerId);
    state.board[index] = currentPlayer.symbol;

    const winnerSymbol = this.checkWinner(state.board);
    if (winnerSymbol) {
      state.status = GameState.FINISHED;
      state.winnerId = state.players.find(p => p.symbol === winnerSymbol).id;
      const winner = state.players.find(p => p.id === state.winnerId);
      winner.score += 1;
    } else if (state.board.every(cell => cell !== null)) {
      state.status = GameState.FINISHED;
      state.winnerId = 'draw';
    } else {
      // Switch turns
      const currentIndex = state.players.findIndex(p => p.id === playerId);
      const nextIndex = (currentIndex + 1) % state.players.length;
      state.turnPlayerId = state.players[nextIndex].id;
    }

    return state;
  }

  private checkWinner(board: any[]): string | null {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  getClientState(state: any) {
    return {
      roomId: state.roomId,
      players: state.players,
      turnPlayerId: state.turnPlayerId,
      board: state.board || new Array(this.BOARD_SIZE).fill(null),
      status: state.status,
      winnerId: state.winnerId,
    };
  }
}
