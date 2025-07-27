import { Module, forwardRef } from "@nestjs/common";
import { UserService } from '@/users/users.service'
import { UserController } from '@/users/users.controller'
import { User, UsersSchema } from '@/users/schema/users.schema'
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from "@/auth/auth.module";
import { RedisModule } from "@/redis/redis.module";
import { UserRepsitory } from "@/users/respositories/users.repository";

@Module({
    imports: [
        forwardRef(() => AuthModule),
        MongooseModule.forFeature([{
            name: User.name,
            schema: UsersSchema
        }]),

        RedisModule,
    ],
    controllers: [UserController],
    providers: [UserService, UserRepsitory],
    exports: [UserService, UserRepsitory,]
})

export class UsersModule { }