import { Controller, Post, Body, Param } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('analyze')
  async analyzeCode(@Body() body: { code: string; language: string }) {
    return this.aiService.analyzeCode(body.code, body.language);
  }

  @Post('analyze/:reviewId')
  async analyzeReview(@Param('reviewId') reviewId: string) {
    return this.aiService.analyzeReview(reviewId);
  }
}
