import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Get()
  getAll(@Query('status') status?: string) {
    return this.reviewsService.getAll(status);
  }

  @Get('stats')
  getStats() {
    return this.reviewsService.getStats();
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    const review = this.reviewsService.getById(id);
    if (!review) return { error: 'Review not found' };
    return review;
  }

  @Post()
  create(@Body() body: { title: string; description: string; authorId: string; fileName: string; code: string; language: string }) {
    return this.reviewsService.create(body);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.reviewsService.updateStatus(id, body.status);
  }
}
