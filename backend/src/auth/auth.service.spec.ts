import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User } from './user.schema';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserModel: any;
  let mockJwtService: any;

  const mockUser = {
    _id: 'user-id-123',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2a$10$hashedpassword',
    role: 'developer',
    skills: ['typescript'],
    activeReviewCount: 0,
    avatarColor: '#8B5CF6',
  };

  beforeEach(async () => {
    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw error for non-existent user', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.login('fake@email.com', 'password'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await expect(service.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should return user and token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      const userWithValidHash = { ...mockUser, passwordHash: hashedPassword };

      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithValidHash),
      });

      const result = await service.login('test@example.com', 'correctpassword');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user.email).toBe('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.validateUser('user-id-123');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.validateUser('invalid-id');
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users without password hash', async () => {
      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await service.getAllUsers();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).not.toHaveProperty('passwordHash');
    });
  });
});
