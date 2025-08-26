import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { GroupRepository } from './repositories/groups.respository';
import { AuthModule } from '@/auth/auth.module';
import { Group, GroupSchema } from './schema/group.schema';
import { Message, MessagesSchema } from '@/chat/schema/message.schema';
import { Chat, ChatSchema } from '@/chat/schema/chat.schema';
import { ChatParticipant, ChatParticipantSchema } from '@/chat/schema/participant.schema';

@Module({
    imports: [AuthModule,
        MongooseModule.forFeature([
            { name: Group.name, schema: GroupSchema },
            { name: Message.name, schema: MessagesSchema },
            { name: Chat.name, schema: ChatSchema },
            { name: ChatParticipant.name, schema: ChatParticipantSchema }
        ])
    ],
    controllers: [GroupController],
    providers: [GroupService, GroupRepository],
    exports: [GroupRepository]
})
export class GroupModule { }
