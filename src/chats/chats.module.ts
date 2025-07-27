import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatsSchema } from './schema/chats.schema';
import { ChatsRepository } from './repositories/chats.repositories';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { User, UsersSchema } from '@/users/schema/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatsSchema },
      { name: User.name, schema: UsersSchema }
    ]),
    AuthModule,
    UsersModule
  ],
  providers: [ChatsService, ChatsRepository],
  controllers: [ChatsController]
})
export class ChatsModule { }
