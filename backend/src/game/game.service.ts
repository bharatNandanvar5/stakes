import { Injectable } from '@nestjs/common';


export enum GameState {
  FINISHED = 'finished',
  PLAYING = 'playing',
  ENDED = 'ended',
  WAITING = 'waiting',
}
@Injectable()
export class GameService {
  private readonly GRID_SIZE = 25; // 5x5

  initializeGame(roomId: string, players: any[]): any {
    const bombCount = 1 //Math.floor(Math.random() * 10) + 1; // 1 to 10 bombs
    const grid = new Array(this.GRID_SIZE).fill(0);
    const bombIndices = new Set<number>();

    while (bombIndices.size < bombCount) {
      const randomIndex = Math.floor(Math.random() * this.GRID_SIZE);
      bombIndices.add(randomIndex);
    }

    bombIndices.forEach((index) => {
      grid[index] = 1; // 1 represents a bomb
    });

    return {
      roomId,
      players: players.map((p) => ({ ...p, score: 0 })),
      turnPlayerId: players[0].id,
      grid, // Full grid with bombs (server-side only)
      revealed: new Array(this.GRID_SIZE).fill(false),
      status: GameState.PLAYING,
      bombCount,
    };
  }

  makeMove(state: any, playerId: string, tileIndex: number) {
    if (state.status !== GameState.PLAYING || state.turnPlayerId !== playerId) {
      throw new Error('Invalid move: not your turn or game not playing');
    }

    if (state.revealed[tileIndex]) {
      throw new Error('Tile already revealed');
    }

    state.revealed[tileIndex] = true;
    const isBomb = state.grid[tileIndex] === 1;

    if (isBomb) {
      state.status = GameState.FINISHED;
      state.winnerId = state.players.find((p) => p.id !== playerId)?.id;
      return { isBomb: true, state };
    }

    // Gem found
    const currentPlayer = state.players.find((p) => p.id === playerId);
    currentPlayer.score += 100;

    // Switch turn
    const nextPlayer = state.players.find((p) => p.id !== playerId);
    state.turnPlayerId = nextPlayer.id;

    // Check if all gems are revealed
    const totalGems = this.GRID_SIZE - state.bombCount;
    const revealedGems = state.revealed.filter((r, i) => r && state.grid[i] === 0).length;

    if (revealedGems === totalGems) {
      state.status = GameState.FINISHED;
      // Winner is the one with more points (or the one who finished if tied)
      state.winnerId = state.players.sort((a, b) => b.score - a.score)[0].id;
    }

    return { isBomb: false, state };
  }

  getClientState(state: any, playerId: string) {
    // Only return revealed tiles' contents
    const publicGrid = state.grid.map((val, idx) => {
      if (state.revealed[idx] || state.status === GameState.FINISHED) {
        return val;
      }
      return null; // Hidden
    });

    return {
      roomId: state.roomId,
      players: state.players,
      turnPlayerId: state.turnPlayerId,
      grid: publicGrid,
      revealed: state.revealed,
      status: state.status,
      winnerId: state.winnerId,
      bombCount: state.bombCount,
    };
  }
}
