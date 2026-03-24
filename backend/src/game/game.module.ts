import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TicTacToeService } from './tictactoe.service';

@Module({
  providers: [GameService, TicTacToeService],
  exports: [GameService, TicTacToeService],
})
export class GameModule { }
