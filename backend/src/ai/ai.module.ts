import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { Review, ReviewSchema } from '../reviews/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
