import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { TicTacToeService } from './tictactoe.service';
import { ScribbleService } from './scribble.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from '../admin/word.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }])],
  providers: [GameService, TicTacToeService, ScribbleService],
  exports: [GameService, TicTacToeService, ScribbleService],
})
export class GameModule { }
