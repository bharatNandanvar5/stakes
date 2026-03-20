import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GameHistory } from './history.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(GameHistory.name) private historyModel: Model<GameHistory>
  ) {}

  async create(gameData: any): Promise<GameHistory> {
    const history = new this.historyModel(gameData);
    return history.save();
  }

  async findByUser(userId: string): Promise<GameHistory[]> {
    return this.historyModel.find({ players: userId }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<GameHistory[]> {
    return this.historyModel.find().populate('players', 'username').sort({ createdAt: -1 }).exec();
  }
}
