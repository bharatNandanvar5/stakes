import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'user' })
  role: 'user' | 'admin';

  @Prop({ default: 0 })
  totalWins: number;

  @Prop({ default: 0 })
  totalMatches: number;

  @Prop({ default: 0 })
  maxScore: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
