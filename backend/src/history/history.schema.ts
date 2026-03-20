import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class GameHistory extends Document {
  @Prop({ required: true })
  roomId: string;

  @Prop([{ type: MongooseSchema.Types.ObjectId, ref: 'User' }])
  players: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  winnerId: string;

  @Prop({ type: Object })
  settings: {
    maxPlayers: number;
    bombCount: number;
  };

  @Prop([{
    userId: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
    score: Number,
    isWinner: Boolean
  }])
  results: Array<{
    userId: string;
    score: number;
    isWinner: boolean;
  }>;
}

export const GameHistorySchema = SchemaFactory.createForClass(GameHistory);
