import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { AiFeedbackItem, reviews } from '../common/data-store';

@Injectable()
export class AiService {
  /**
   * Analyzes code and returns AI feedback.
   * In production, this would call OpenAI GPT-4o via BullMQ queue.
   * For demo, returns instant mock analysis.
   */
  async analyzeCode(code: string, language: string): Promise<AiFeedbackItem[]> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lines = code.split('\n');
    const feedback: AiFeedbackItem[] = [];

    // Pattern-based mock analysis
    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // Security checks
      if (line.includes('password') && line.includes('=') && !line.includes('hash') && !line.includes('Hash')) {
        feedback.push({
          id: uuid(),
          line: lineNum,
          category: 'security',
          severity: 'error',
          message: 'Potential hardcoded password detected',
          suggestion: 'Use environment variables or a secrets manager for credentials',
        });
      }

      if (line.includes('eval(') || line.includes('Function(')) {
        feedback.push({
          id: uuid(),
          line: lineNum,
          category: 'security',
          severity: 'error',
          message: 'Dynamic code execution detected (eval/Function)',
          suggestion: 'Avoid eval() — use safer alternatives like JSON.parse() or a proper parser',
        });
      }

      // Performance checks
      if (line.includes('.forEach') && line.includes('await')) {
        feedback.push({
          id: uuid(),
          line: lineNum,
          category: 'performance',
          severity: 'warning',
          message: 'Await inside forEach does not parallelize',
          suggestion: 'Use Promise.all() with .map() for parallel async operations',
        });
      }

      // Style checks
      if (line.length > 120) {
        feedback.push({
          id: uuid(),
          line: lineNum,
          category: 'style',
          severity: 'info',
          message: 'Line exceeds 120 characters',
          suggestion: 'Break this line into multiple lines for better readability',
        });
      }

      // Bug risk
      if (line.includes('== ') && !line.includes('===')) {
        feedback.push({
          id: uuid(),
          line: lineNum,
          category: 'bug_risk',
          severity: 'warning',
          message: 'Loose equality check detected',
          suggestion: 'Use strict equality (===) to avoid type coercion bugs',
        });
      }

      // console.log detection
      if (line.includes('console.log')) {
        feedback.push({
          id: uuid(),
          line: lineNum,
          category: 'best_practice',
          severity: 'info',
          message: 'console.log statement found',
          suggestion: 'Replace with a proper logger (e.g., winston, pino) for production code',
        });
      }
    });

    // Always return at least one feedback item
    if (feedback.length === 0) {
      feedback.push({
        id: uuid(),
        line: 1,
        category: 'best_practice',
        severity: 'info',
        message: 'Code looks good! Consider adding JSDoc comments for public functions',
        suggestion: 'Add documentation comments to improve code maintainability',
      });
    }

    return feedback;
  }

  async analyzeReview(reviewId: string): Promise<AiFeedbackItem[]> {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) throw new Error('Review not found');

    const feedback = await this.analyzeCode(review.code, review.language);
    review.aiFeedback = feedback;
    review.updatedAt = new Date().toISOString();
    return feedback;
  }
}
