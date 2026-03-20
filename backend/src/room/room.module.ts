import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { GameModule } from '../game/game.module';
import { RoomGateway } from './room.gateway';
@Module({
  imports: [GameModule],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomModule { }
