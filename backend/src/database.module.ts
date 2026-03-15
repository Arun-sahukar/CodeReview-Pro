import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async () => {
        let uri = process.env.MONGODB_URI;
        if (!uri) {
          console.log('🍃 MONGODB_URI not found. Starting MongoMemoryServer...');
          const mongod = await MongoMemoryServer.create();
          uri = mongod.getUri();
          console.log(`🍃 In-memory MongoDB started at: ${uri}`);
        }
        return { uri };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
