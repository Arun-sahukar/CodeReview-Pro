import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DatabaseModule } from './database.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CommentsModule } from './comments/comments.module';
import { AiModule } from './ai/ai.module';
import { GatewayModule } from './gateway/gateway.module';
import { SeedService } from './common/seed.service';
import { User, UserSchema } from './auth/user.schema';
import { Review, ReviewSchema } from './reviews/review.schema';
import { Comment, CommentSchema } from './comments/comment.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Review.name, schema: ReviewSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
    AuthModule,
    ReviewsModule,
    CommentsModule,
    AiModule,
    GatewayModule,
  ],
  providers: [SeedService],
})
export class AppModule {}
