import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { HistoryModule } from '../history/history.module';
import { UsersModule } from '../users/users.module';
import { RoomModule } from '../room/room.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Word, WordSchema } from './word.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Word.name, schema: WordSchema }]),
    HistoryModule,
    UsersModule,
    RoomModule
  ],
  controllers: [AdminController],
  exports: [MongooseModule], // Export so GameService can use WordModel
})
export class AdminModule { }
