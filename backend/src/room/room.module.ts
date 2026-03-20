import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { GameModule } from '../game/game.module';
import { RoomGateway } from './room.gateway';
import { HistoryModule } from '../history/history.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [GameModule, HistoryModule, UsersModule],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomModule { }
