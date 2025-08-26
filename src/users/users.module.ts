import { Module, forwardRef } from "@nestjs/common";
import { UserService } from '@/users/users.service'
import { UserController } from '@/users/users.controller'
import { User, UsersSchema } from '@/users/schema/users.schema'
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from "@/auth/auth.module";
import { RedisModule } from "@/redis/redis.module";
import { UserRepsitory } from "@/users/respositories/users.repository";
import { ChatParticipant, ChatParticipantSchema } from "@/chat/schema/participant.schema";
import { Chat, ChatSchema } from "@/chat/schema/chat.schema";

@Module({
    imports: [
        forwardRef(() => AuthModule),
        MongooseModule.forFeature([
            { name: User.name, schema: UsersSchema },
            { name: ChatParticipant.name, schema: ChatParticipantSchema },
            { name: Chat.name, schema: ChatSchema }
        ]),

        RedisModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserRepsitory],
    exports: [UserService, UserRepsitory,]
})

export class UsersModule { }