import { Controller, Get, UseGuards } from '@nestjs/common';
import { HistoryService } from '../history/history.service';
import { UsersService } from '../users/users.service';
import { RoomService } from '../room/room.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private historyService: HistoryService,
    private usersService: UsersService,
    private roomService: RoomService,
  ) {}

  @Get('stats')
  async getStats() {
    const userCount = await this.usersService.count();
    const history = await this.historyService.findAll();
    return {
      totalUsers: userCount,
      totalMatches: history.length,
    };
  }

  @Get('users')
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get('history')
  async getHistory() {
    return this.historyService.findAll();
  }

  @Get('live-games')
  async getLiveGames() {
    return this.roomService.getAllRooms();
  }
}
