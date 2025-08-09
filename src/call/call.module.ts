import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { CallService } from './call.service';
import { AuthModule } from '@/auth/auth.module';
import { Call, CallsSchema } from './schema/call.schema';
import { CallRepository } from '@/call/repositories/call.repository';
import { CallController } from './call.controller';
import { User, UsersSchema } from '@/users/schema/users.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Call.name, schema: CallsSchema },
            { name: User.name, schema: UsersSchema }
        ]),
        AuthModule
    ],
    providers: [CallService, CallRepository],
    exports: [CallRepository],
    controllers: [CallController]
})
export class CallModule { }
