import { Injectable } from '@nestjs/common';
import { GameState } from './game.types';

@Injectable()
export class GameService {
  private readonly GRID_SIZE = 25; // 5x5

  initializeGame(roomId: string, players: any[], bombCount: number, eliminationMode: boolean = false): any {
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
      winnerIds: [],
      eliminationMode,
    };
  }

  makeMove(state: any, playerId: string, tileIndex: number) {
    if (state.status !== GameState.PLAYING || state.turnPlayerId !== playerId) {
      throw new Error('Invalid move: not your turn or game not playing');
    }

    const currentPlayer = state.players.find((p) => p.id === playerId);
    if (currentPlayer.eliminated) {
      throw new Error('You are eliminated and cannot make moves');
    }

    if (state.revealed[tileIndex]) {
      throw new Error('Tile already revealed');
    }

    state.revealed[tileIndex] = true;
    const isBomb = state.grid[tileIndex] === 1;

    if (isBomb) {
      if (state.eliminationMode) {
        currentPlayer.eliminated = true;
        
        const activePlayers = state.players.filter(p => !p.eliminated);
        if (activePlayers.length <= 1) {
          state.status = GameState.FINISHED;
          state.winnerIds = activePlayers.map(p => p.id);
          if (state.winnerIds.length === 0) {
             // Everyone hit a bomb? Unlikely in turn based, but handle it.
             state.winnerIds = [playerId]; 
          }
        } else {
          // Game continues, switch turn to next active player
          this.switchToNextActivePlayer(state, playerId);
        }
      } else {
        state.status = GameState.FINISHED;
        // All other players are winners
        state.winnerIds = state.players
          .filter(p => p.id !== playerId)
          .map(p => p.id);

        if (state.winnerIds.length === 0) {
          state.winnerIds = [playerId];
        }
      }
      return state;
    }

    // Gem found
    currentPlayer.score += 100;

    // Switch turn to NEXT active player
    this.switchToNextActivePlayer(state, playerId);

    // Check if all gems are revealed
    const totalGems = this.GRID_SIZE - state.bombCount;
    const revealedGems = state.revealed.filter((r, i) => r && state.grid[i] === 0).length;

    if (revealedGems === totalGems) {
      state.status = GameState.FINISHED;
      state.winnerIds = state.players.filter(p => !p.eliminated).map(p => p.id);
    }

    return state;
  }

  private switchToNextActivePlayer(state: any, currentPlayerId: string) {
    const currentIndex = state.players.findIndex(p => p.id === currentPlayerId);
    let nextIndex = (currentIndex + 1) % state.players.length;
    
    // Find next player who is not eliminated
    let attempts = 0;
    while (state.players[nextIndex].eliminated && attempts < state.players.length) {
      nextIndex = (nextIndex + 1) % state.players.length;
      attempts++;
    }
    
    state.turnPlayerId = state.players[nextIndex].id;
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
      winnerIds: state.winnerIds || [],
      bombCount: state.bombCount,
    };
  }
}
