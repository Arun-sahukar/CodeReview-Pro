import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../auth/user.schema';
import { Review } from '../reviews/review.schema';
import { Comment } from '../comments/comment.schema';
import { users, reviews, comments } from './data-store';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      this.logger.log('Database already seeded. Skipping.');
      return;
    }

    this.logger.log('Seeding database...');

    try {
      // 1. Seed Users
      // Need to map old IDs (u1, u2...) to Mongo ObjectIds
      const userMap: Record<string, Types.ObjectId> = {};
      
      for (const u of users) {
        const id = new Types.ObjectId();
        userMap[u.id] = id;
        await new this.userModel({
          _id: id,
          email: u.email,
          name: u.name,
          passwordHash: u.passwordHash,
          role: u.role,
          skills: u.skills,
          activeReviewCount: u.activeReviewCount,
          avatarColor: u.avatarColor,
        }).save();
      }

      // 2. Seed Reviews
      const reviewMap: Record<string, Types.ObjectId> = {};
      for (const r of reviews) {
        // Special case: preserve 'demo' id if it's the demo review
        const id = r.id === 'demo' ? new Types.ObjectId('507f191e810c19729de860ea') : new Types.ObjectId();
        reviewMap[r.id] = id;
        
        await new this.reviewModel({
          _id: id,
          title: r.title,
          description: r.description,
          authorId: userMap[r.authorId],
          authorName: r.authorName,
          assignees: r.assignees.map(aid => userMap[aid]),
          status: r.status,
          language: r.language,
          fileName: r.fileName,
          code: r.code,
          aiFeedback: r.aiFeedback,
        }).save();
      }

      // 3. Seed Comments
      for (const c of comments) {
        await new this.commentModel({
          reviewId: reviewMap[c.reviewId],
          authorId: userMap[c.authorId],
          authorName: c.authorName,
          line: c.line,
          content: c.content,
          resolved: c.resolved,
          parentId: c.parentId ? new Types.ObjectId() : null, // Simplification for seed
        }).save();
      }

      this.logger.log('Database seeding complete.');
    } catch (error) {
      this.logger.error('Error seeding database', error);
    }
  }
}
