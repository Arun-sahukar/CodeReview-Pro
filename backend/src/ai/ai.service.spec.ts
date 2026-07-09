import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { Review } from '../reviews/review.schema';

describe('AiService', () => {
  let service: AiService;
  let mockReviewModel: any;

  beforeEach(async () => {
    mockReviewModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: getModelToken(Review.name),
          useValue: mockReviewModel,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('analyzeCode', () => {
    it('should detect hardcoded passwords', async () => {
      const code = `const password = "secret123";`;
      const feedback = await service.analyzeCode(code, 'typescript');

      expect(feedback.some(f => f.category === 'security')).toBe(true);
      expect(feedback.some(f => f.message.toLowerCase().includes('password'))).toBe(true);
    });

    it('should detect eval usage', async () => {
      const code = `const result = eval(userInput);`;
      const feedback = await service.analyzeCode(code, 'javascript');

      expect(feedback.some(f => f.category === 'security')).toBe(true);
      expect(feedback.some(f => f.message.toLowerCase().includes('eval'))).toBe(true);
    });

    it('should detect loose equality', async () => {
      const code = `if (a == b) { }`;
      const feedback = await service.analyzeCode(code, 'typescript');

      expect(feedback.some(f => f.category === 'bug_risk')).toBe(true);
      expect(feedback.some(f => f.message.toLowerCase().includes('equality'))).toBe(true);
    });

    it('should detect console.log', async () => {
      const code = `console.log("debug");`;
      const feedback = await service.analyzeCode(code, 'typescript');

      expect(feedback.some(f => f.category === 'best_practice')).toBe(true);
    });

    it('should detect long lines', async () => {
      const code = 'const x = ' + 'a'.repeat(150) + ';';
      const feedback = await service.analyzeCode(code, 'typescript');

      expect(feedback.some(f => f.category === 'style')).toBe(true);
      expect(feedback.some(f => f.message.toLowerCase().includes('120'))).toBe(true);
    });

    it('should detect await inside forEach', async () => {
      const code = `items.forEach(async item => { await process(item); });`;
      const feedback = await service.analyzeCode(code, 'typescript');

      expect(feedback.some(f => f.category === 'performance')).toBe(true);
    });

    it('should return positive feedback for clean code', async () => {
      const code = `function add(a: number, b: number): number { return a + b; }`;
      const feedback = await service.analyzeCode(code, 'typescript');

      expect(feedback.length).toBeGreaterThan(0);
      expect(feedback.some(f => f.severity === 'info')).toBe(true);
    });
  });

  describe('analyzeReview', () => {
    it('should analyze review and update database', async () => {
      const mockReview = {
        _id: 'review-123',
        code: `const x = eval("test");`,
        language: 'typescript',
      };

      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReview),
      });

      mockReviewModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockReview),
      });

      const feedback = await service.analyzeReview('review-123');

      expect(feedback.length).toBeGreaterThan(0);
      expect(mockReviewModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'review-123',
        expect.objectContaining({ aiFeedback: expect.any(Array) }),
      );
    });

    it('should throw error for non-existent review', async () => {
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.analyzeReview('invalid-id'))
        .rejects.toThrow('Review not found');
    });
  });
});
