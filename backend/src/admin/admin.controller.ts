import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { HistoryService } from '../history/history.service';
import { UsersService } from '../users/users.service';
import { RoomService } from '../room/room.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word, WordDocument } from './word.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private historyService: HistoryService,
    private usersService: UsersService,
    private roomService: RoomService,
    @InjectModel(Word.name) private wordModel: Model<WordDocument>,
  ) { }

  @Get('health')
  getHealth() {
    return { status: 'OK' };
  }

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

  @Post('words/bulk')
  async bulkInsertWords(@Body() data: { words: string[] }) {
    if (!data || !Array.isArray(data.words)) {
      return { success: false, message: 'Invalid format. Provide { words: string[] }' };
    }
    const operations = data.words.map(w => ({
      updateOne: {
        filter: { word: w.toUpperCase() },
        update: { $set: { word: w.toUpperCase() } },
        upsert: true
      }
    }));
    if (operations.length === 0) return { success: true, count: 0 };
    const result = await this.wordModel.bulkWrite(operations);
    return { success: true, count: result.upsertedCount + result.modifiedCount };
  }
}
