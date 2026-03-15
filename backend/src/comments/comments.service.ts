import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Comment } from './comment.schema';
import { User } from '../auth/user.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getByReviewId(reviewId: string): Promise<Comment[]> {
    return this.commentModel.find({ reviewId: new Types.ObjectId(reviewId) }).sort({ createdAt: 1 }).exec();
  }

  async addComment(data: { reviewId: string; authorId: string; line: number; content: string; parentId?: string }) {
    const author = await this.userModel.findById(data.authorId).exec();
    const comment = new this.commentModel({
      reviewId: new Types.ObjectId(data.reviewId),
      authorId: new Types.ObjectId(data.authorId),
      authorName: author?.name || 'Unknown',
      line: data.line,
      content: data.content,
      resolved: false,
      parentId: data.parentId ? new Types.ObjectId(data.parentId) : null,
    });
    return comment.save();
  }

  async resolveComment(commentId: string) {
    const comment = await this.commentModel.findByIdAndUpdate(commentId, { resolved: true }, { new: true }).exec();
    if (!comment) throw new Error('Comment not found');
    return comment;
  }
}
