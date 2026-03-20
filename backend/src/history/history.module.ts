import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoryService } from './history.service';
import { GameHistory, GameHistorySchema } from './history.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GameHistory.name, schema: GameHistorySchema }]),
  ],
  providers: [HistoryService],
  exports: [HistoryService],
})
export class HistoryModule {}
