import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.schema';
import * as bcrypt from "bcryptjs"
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminUsername = 'admin';
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD') || 'admin123';
    
    const existingAdmin = await this.userModel.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const admin = new this.userModel({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin',
      });
      await admin.save();
      console.log('Admin user seeded successfully');
    }
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  async findById(id: string): Promise<User | undefined> {
    return this.userModel.findById(id).exec();
  }

  async updateStats(userId: string, isWin: boolean, score: number) {
    const update: any = { $inc: { totalMatches: 1 } };
    if (isWin) update.$inc.totalWins = 1;
    update.$max = { maxScore: score };
    
    return this.userModel.findByIdAndUpdate(userId, update, { new: true }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find({}, '-password').exec();
  }

  async count() {
    return this.userModel.countDocuments().exec();
  }
}
