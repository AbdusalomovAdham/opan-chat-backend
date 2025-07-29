import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from '@/chat/schema/chat.schema';
import { ChatsRepository } from './repositories/chats.repositories';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { User, UsersSchema } from '@/users/schema/users.schema';
import { ChatParticipant, ChatParticipantSchema } from '@/chat/schema/participant.schema';
import { Message, MessagesSchema } from '@/chat/schema/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: User.name, schema: UsersSchema },
      { name: ChatParticipant.name, schema: ChatParticipantSchema },
      { name: Message.name, schema: MessagesSchema },
    ]),
    AuthModule,
    UsersModule
  ],
  providers: [ChatsService, ChatsRepository],
  controllers: [ChatsController]
})
export class ChatsModule { }
