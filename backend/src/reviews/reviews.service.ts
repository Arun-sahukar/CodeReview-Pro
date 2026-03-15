import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { Review, AiFeedbackItem } from './review.schema';
import { User } from '../auth/user.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getAll(status?: string) {
    const query = status ? { status } : {};
    return this.reviewModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async getById(id: string): Promise<Review | null> {
    if (!Types.ObjectId.isValid(id) && id !== 'demo') {
       return null;
    }
    const query = id === 'demo' ? { _id: id } : { _id: id }; // Handle demo alias if needed, but we renamed r1 to demo in seed
    // Actually, if we use MongoDB, 'demo' needs to be a valid ObjectId or we stringify it.
    // In our seed we'll use a valid ObjectId string for 'demo'.
    return this.reviewModel.findById(id).exec();
  }

  async create(data: { title: string; description: string; authorId: string; fileName: string; code: string; language: string }) {
    const author = await this.userModel.findById(data.authorId).exec();
    const assignees = await this.smartAssign(data.language, data.authorId);
    
    const newReview = new this.reviewModel({
      title: data.title,
      description: data.description,
      authorId: new Types.ObjectId(data.authorId),
      authorName: author?.name || 'Unknown',
      assignees: assignees.map(id => new Types.ObjectId(id)),
      status: 'pending',
      language: data.language,
      fileName: data.fileName,
      code: data.code,
      aiFeedback: null,
    });

    const review = await newReview.save();

    // Simulate AI analysis after creation
    setTimeout(() => {
      this.generateMockAiFeedback(review._id.toString());
    }, 2000);

    return review;
  }

  async updateStatus(id: string, status: string) {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date().toISOString() },
      { new: true }
    ).exec();
    if (!review) throw new Error('Review not found');
    return review;
  }

  async getStats() {
    const total = await this.reviewModel.countDocuments();
    const pending = await this.reviewModel.countDocuments({ status: 'pending' });
    const in_review = await this.reviewModel.countDocuments({ status: 'in_review' });
    const approved = await this.reviewModel.countDocuments({ status: 'approved' });
    
    const users = await this.userModel.find({ role: { $ne: 'admin' } }).exec();
    const reviewerWorkload = users.map(u => ({
      name: u.name,
      activeReviews: u.activeReviewCount,
      avatarColor: u.avatarColor,
    }));

    return {
      total,
      byStatus: {
        pending,
        in_review,
        approved,
        merged: 0,
        changes_requested: 0,
      },
      avgTimeToReview: 4.2,
      aiIssuesFound: 12, // Mock or aggregate from reviews
      weeklyActivity: [
        { day: 'Mon', reviews: 12, comments: 34, approvals: 8 },
        { day: 'Tue', reviews: 18, comments: 45, approvals: 12 },
        { day: 'Wed', reviews: 15, comments: 52, approvals: 14 },
      ],
      reviewerWorkload,
      aiCategories: { style: 1, security: 3, performance: 2, bug_risk: 2, best_practice: 1 },
      bottlenecks: [
        { reviewer: 'Mike Johnson', pendingReviews: 4, avgResponseTime: '6.5h' },
      ],
    };
  }

  private async smartAssign(language: string, authorId: string): Promise<string[]> {
    const skillMap: Record<string, string[]> = {
      typescript: ['typescript', 'javascript'],
      javascript: ['javascript', 'typescript'],
      python: ['python'],
    };
    const requiredSkills = skillMap[language] || [];
    
    const candidates = await this.userModel.find({
      _id: { $ne: new Types.ObjectId(authorId) },
      role: { $ne: 'admin' },
      skills: { $in: requiredSkills }
    })
    .sort({ activeReviewCount: 1 })
    .limit(2)
    .exec();

    if (candidates.length === 0) {
      const fallback = await this.userModel.find({
        _id: { $ne: new Types.ObjectId(authorId) },
        role: { $ne: 'admin' }
      })
      .limit(2)
      .exec();
      return fallback.map(u => (u._id as any).toString());
    }
    return candidates.map(u => (u._id as any).toString());
  }

  private async generateMockAiFeedback(reviewId: string) {
    const review = await this.reviewModel.findById(reviewId).exec();
    if (!review) return;

    const lines = review.code.split('\n');
    const feedback: any[] = [];
    const categories: any[] = ['style', 'security', 'performance', 'bug_risk', 'best_practice'];
    const severities: any[] = ['info', 'warning', 'error'];

    const count = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < count; i++) {
      feedback.push({
        id: uuid(),
        line: Math.floor(Math.random() * lines.length) + 1,
        category: categories[Math.floor(Math.random() * categories.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: 'AI-detected issue in this section of code',
        suggestion: 'Consider refactoring this section for better maintainability',
      });
    }
    
    await this.reviewModel.findByIdAndUpdate(reviewId, { aiFeedback: feedback }).exec();
  }
}
