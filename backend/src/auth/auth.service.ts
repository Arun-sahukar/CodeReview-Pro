import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User } from './user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, name: string, password: string, role: string = 'developer') {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) {
      throw new Error('User already exists');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const COLORS = ['#8B5CF6', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#EC4899'];
    
    const newUser = new this.userModel({
      email,
      name,
      passwordHash,
      role,
      skills: [],
      activeReviewCount: 0,
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    const user = await newUser.save();
    return this.buildUserResponse(user);
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
       throw new Error('Invalid credentials');
    }
    
    return this.buildUserResponse(user);
  }

  async validateUser(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async getAllUsers() {
    const users = await this.userModel.find().exec();
    return users.map(u => ({
      id: u._id,
      email: u.email,
      name: u.name,
      role: u.role,
      skills: u.skills,
      activeReviewCount: u.activeReviewCount,
      avatarColor: u.avatarColor,
      createdAt: (u as any).createdAt,
    }));
  }

  async updateUserRole(userId: string, role: string) {
    const user = await this.userModel.findByIdAndUpdate(userId, { role }, { new: true }).exec();
    if (!user) throw new Error('User not found');
    return { success: true };
  }

  private buildUserResponse(user: User) {
    const payload = { sub: user._id, email: user.email, role: user.role };
    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        skills: user.skills,
        avatarColor: user.avatarColor,
      },
      token: this.jwtService.sign(payload),
    };
  }
}
