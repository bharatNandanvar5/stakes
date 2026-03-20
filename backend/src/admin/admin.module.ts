import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { HistoryModule } from '../history/history.module';
import { UsersModule } from '../users/users.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [HistoryModule, UsersModule, RoomModule],
  controllers: [AdminController],
})
export class AdminModule {}
