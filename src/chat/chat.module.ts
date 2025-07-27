import { MongooseModule } from '@nestjs/mongoose';
import { Module } from "@nestjs/common";
import { ChatGateway } from "@/chat/chat.gateway"
import { ChatService } from "@/chat/chat.service";
import { Message, MessagesSchema } from "@/chat/schema/message.schema"

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessagesSchema }
        ])
    ],
    providers: [ChatGateway, ChatService]

})

export class ChatModule { }