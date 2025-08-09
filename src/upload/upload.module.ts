import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { FileUploadService } from './upload.service';
import { ChatModule } from '@/chat/chat.module';

@Module({
    imports: [UsersModule, AuthModule, ChatModule],
    controllers: [UploadController],
    providers: [FileUploadService]
})
export class UploadModule { }
