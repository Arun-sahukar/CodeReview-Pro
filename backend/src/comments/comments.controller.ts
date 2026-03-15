import { Controller, Get, Post, Put, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(':reviewId')
  getByReviewId(@Param('reviewId') reviewId: string) {
    return this.commentsService.getByReviewId(reviewId);
  }

  @Post()
  addComment(@Body() body: { reviewId: string; authorId: string; line: number; content: string; parentId?: string }) {
    return this.commentsService.addComment(body);
  }

  @Put(':id/resolve')
  resolveComment(@Param('id') id: string) {
    return this.commentsService.resolveComment(id);
  }
}
