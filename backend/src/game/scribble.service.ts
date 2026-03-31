import { Injectable } from '@nestjs/common';
import { GameState } from './game.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WordDocument, Word } from '../admin/word.schema';

@Injectable()
export class ScribbleService {
  constructor(
    @InjectModel(Word.name) private wordModel: Model<WordDocument>
  ) { }

  async initializeGame(roomId: string, players: any[], settings: any): Promise<any> {
    const defaultWords = ['APPLE', 'TRAIN', 'DOG', 'CAR', 'HOUSE', 'BEACH', 'CAT', 'TREE', 'SUN', 'PHONE', 'COMPUTER', 'GUITAR'];
    let words = defaultWords;

    try {
      const dbWords = await this.wordModel.find().exec();
      if (dbWords.length >= 5) {
        words = dbWords.map(w => w.word);
      }
    } catch (e) {
      console.log('Error fetching words', e);
    }

    const queue = [...players].map(p => p.id).sort(() => Math.random() - 0.5);
    const drawerId = queue.shift();
    const word = words[Math.floor(Math.random() * words.length)];
    const drawer = players.find(p => p.id === drawerId);

    return {
      roomId,
      players: players.map((p) => ({ ...p, score: 0, hasGuessed: false })),
      turnPlayerId: drawerId,
      status: GameState.PLAYING,
      secretWord: word,
      wordHint: word.replace(/[A-Z]/ig, '_ '),
      currentCycle: 1,
      maxCycles: settings?.cycles || 1,
      roundEndTime: Date.now() + 80000, // 80 seconds
      drawHistory: [],
      winnerIds: [],
      drawerQueue: queue,
      guessOrder: [],
      allWords: words,
      chatHistory: [{ sender: 'System', text: `${drawer?.name} is drawing!`, isSystem: true }],
    };
  }

  makeMove(state: any, playerId: string, action: any) {
    if (state.status !== GameState.PLAYING && action.type !== 'next_round') {
      throw new Error('Game is not playing');
    }

    if (action.type === 'guess') {
      const isDrawer = playerId === state.turnPlayerId;
      if (isDrawer) throw new Error('Drawer cannot guess');

      const player = state.players.find(p => p.id === playerId);
      if (player.hasGuessed) throw new Error('Already guessed correctly');

      const isCorrect = action.guess.trim().toUpperCase() === state.secretWord.toUpperCase();

      if (isCorrect) {
        player.hasGuessed = true;
        state.guessOrder.push(playerId);

        state.chatHistory.push({ sender: player.name, text: 'guessed the word', isSystem: true, correct: true });

        const guessers = state.players.filter(p => p.id !== state.turnPlayerId);
        const allGuessed = guessers.every(p => p.hasGuessed);

        if (allGuessed) {
          this.endRound(state);
        }
      } else {
        state.chatHistory.push({ sender: player.name, text: action.guess, isSystem: false });
      }
      return state;
    }

    if (action.type === 'time_up') {
      this.endRound(state);
      return state;
    }

    if (action.type === 'next_round') {
      if (state.status === "round_ended") {
        this.startNextRound(state);
      }
      return state;
    }

    if (action.type === 'clear_canvas') {
      const isDrawer = playerId === state.turnPlayerId;
      if (isDrawer) state.drawHistory = [];
      return state;
    }
  }

  private endRound(state: any) {
    const pointsConfig = [100, 80, 60, 40];
    const drawer = state.players.find(p => p.id === state.turnPlayerId);

    if (state.guessOrder.length === 0) {
      drawer.score += 20;
    } else {
      let drawerPoints = 0;
      state.guessOrder.forEach((pId, idx) => {
        const guesser = state.players.find(p => p.id === pId);
        const pts = pointsConfig[idx] || 40;
        if (guesser) guesser.score += pts;
        drawerPoints += 50;
      });
      if (drawer) drawer.score += drawerPoints;
    }

    state.status = "round_ended";
  }

  private startNextRound(state: any) {
    if (state.drawerQueue.length === 0) {
      if (state.currentCycle >= state.maxCycles) {
        state.status = GameState.FINISHED;
        const maxScore = Math.max(...state.players.map(p => p.score));
        state.winnerIds = state.players.filter(p => p.score === maxScore).map(p => p.id);
        return;
      } else {
        state.currentCycle++;
        state.drawerQueue = state.players.map(p => p.id).sort(() => Math.random() - 0.5);
      }
    }

    const nextDrawerId = state.drawerQueue.shift();
    const word = state.allWords[Math.floor(Math.random() * state.allWords.length)];

    state.turnPlayerId = nextDrawerId;
    state.secretWord = word;
    state.wordHint = word.replace(/[A-Z]/ig, '_ ');
    state.roundEndTime = Date.now() + 80000;
    state.drawHistory = [];
    state.guessOrder = [];
    state.players.forEach(p => p.hasGuessed = false);
    state.status = GameState.PLAYING;

    const drawer = state.players.find(p => p.id === nextDrawerId);
    state.chatHistory.push({ sender: 'System', text: `${drawer?.name} is drawing!`, isSystem: true });
  }

  getClientState(state: any, socketId: string) {
    const player = state.players.find(p => p.socketId === socketId);
    const playerId = player ? player.id : null;
    const isDrawer = playerId === state.turnPlayerId;
    const isRoundEnded = state.status === "round_ended" || state.status === GameState.FINISHED;

    return {
      roomId: state.roomId,
      players: state.players,
      turnPlayerId: state.turnPlayerId,
      status: state.status,
      wordHint: state.wordHint,
      secretWord: (isDrawer || isRoundEnded) ? state.secretWord : null,
      currentCycle: state.currentCycle,
      maxCycles: state.maxCycles,
      roundEndTime: state.roundEndTime,
      chatHistory: state.chatHistory,
      winnerIds: state.winnerIds || [],
    };
  }
}
