import { Injectable } from '@nestjs/common';
import { GameState } from './game.types';

@Injectable()
export class GameService {
  private readonly GRID_SIZE = 25; // 5x5

  initializeGame(roomId: string, players: any[], bombCount: number): any {
    const finalBombCount = Math.min(Math.max(bombCount || 1, 1), 20); // 1 to 20 bombs
    const grid = new Array(this.GRID_SIZE).fill(0);
    const bombIndices = new Set<number>();

    while (bombIndices.size < finalBombCount) {
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
      bombCount: finalBombCount,
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
      // Winner is everyone else? Or the last person standing? 
      // In this version, if you hit a bomb, you lose, and others share the victory or the highest score wins.
      // Let's say: hitting a bomb makes you lose, and we find the winner among other players.
      state.winnerId = state.players
        .filter(p => p.id !== playerId)
        .sort((a, b) => b.score - a.score)[0]?.id || playerId; // Fallback to current if no one else
      return state;
    }

    // Gem found
    const currentPlayer = state.players.find((p) => p.id === playerId);
    currentPlayer.score += 100;

    // Switch turn to NEXT player in circle
    const currentIndex = state.players.findIndex(p => p.id === playerId);
    const nextIndex = (currentIndex + 1) % state.players.length;
    state.turnPlayerId = state.players[nextIndex].id;

    // Check if all gems are revealed
    const totalGems = this.GRID_SIZE - state.bombCount;
    const revealedGems = state.revealed.filter((r, i) => r && state.grid[i] === 0).length;

    if (revealedGems === totalGems) {
      state.status = GameState.FINISHED;
      state.winnerId = state.players.sort((a, b) => b.score - a.score)[0].id;
    }

    return state;
  }

  getClientState(state: any, playerId: string) {
    // Only return revealed tiles' contents
    const publicGrid = state.grid ? state.grid.map((val, idx) => {
      if (state.revealed[idx] || state.status === GameState.FINISHED) {
        return val;
      }
      return null; // Hidden
    }) : new Array(this.GRID_SIZE).fill(null);

    return {
      roomId: state.roomId,
      players: state.players,
      turnPlayerId: state.turnPlayerId,
      grid: publicGrid,
      revealed: state.revealed || new Array(this.GRID_SIZE).fill(false),
      status: state.status,
      winnerId: state.winnerId,
      bombCount: state.bombCount,
    };
  }
}
