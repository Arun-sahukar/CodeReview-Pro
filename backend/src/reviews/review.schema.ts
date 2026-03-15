import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class AiFeedbackItem {
  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  line: number;

  @Prop({ required: true, enum: ['style', 'security', 'performance', 'bug_risk', 'best_practice'] })
  category: string;

  @Prop({ required: true, enum: ['info', 'warning', 'error'] })
  severity: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  suggestion: string;
}

const AiFeedbackSchema = SchemaFactory.createForClass(AiFeedbackItem);

@Schema({ timestamps: true })
export class Review extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  authorId: Types.ObjectId;

  @Prop({ required: true })
  authorName: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  assignees: Types.ObjectId[];

  @Prop({ required: true, enum: ['pending', 'in_review', 'changes_requested', 'approved', 'merged'], default: 'pending' })
  status: string;

  @Prop({ required: true })
  language: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  code: string;

  @Prop({ type: [AiFeedbackSchema], default: null })
  aiFeedback: AiFeedbackItem[] | null;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
