import { MongooseModule } from '@nestjs/mongoose';
import { Module } from "@nestjs/common";
import { ChatGateway } from "@/chat/chat.gateway"
import { ChatService } from "@/chat/chat.service";
import { Message, MessagesSchema } from "@/chat/schema/message.schema"
import { AuthModule } from '@/auth/auth.module';
import { Chat, ChatSchema } from './schema/chat.schema';
import { ChatParticipant, ChatParticipantSchema } from './schema/participant.schema';
import { FileUploadService } from '@/upload/upload.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessagesSchema },
            { name: Chat.name, schema: ChatSchema },
            { name: ChatParticipant.name, schema: ChatParticipantSchema }
        ]),
        AuthModule
    ],
    providers: [ChatGateway, ChatService, FileUploadService],
    exports: [ChatService]
})

export class ChatModule { }