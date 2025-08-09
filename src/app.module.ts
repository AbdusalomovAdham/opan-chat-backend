import { Module } from '@nestjs/common';
import { AuthModule } from '@/auth/auth.module';
import { UsersModule } from '@/users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UsersSchema } from '@/users/schema/users.schema';
import { RedisModule } from '@/redis/redis.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ChatsModule } from './chats/chats.module';
import { ContactsModule } from './contacts/contacts.module';
import { ChatModule } from './chat/chat.module';
import { CallGateway } from './call/call.gateway';
import { CallService } from './call/call.service';
import { CallModule } from './call/call.module';
import { UploadModule } from './upload/upload.module';


@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UsersSchema }
    ]),
    AuthModule,
    UsersModule,
    RedisModule,
    ChatsModule,
    ContactsModule,
    ChatModule,
    CallModule,
    UploadModule
  ],
  providers: [CallGateway, CallService],
})
export class AppModule { }
