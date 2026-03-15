import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: ['developer', 'reviewer', 'tech_lead', 'admin'] })
  role: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ default: 0 })
  activeReviewCount: number;

  @Prop({ required: true })
  avatarColor: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
