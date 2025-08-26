import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import { ChatService } from '@/chat/chat.service';

@Injectable()
export class FileUploadService {
    constructor(private readonly chatService: ChatService) { }
    async saveFile(file: Express.Multer.File, authorization: string, message_type: string, user_uid: string, file_name: string) {
        const fileUrl = `/uploads/${file.filename}`
        console.log('file', file)
        await this.chatService.saveFile(file_name, file.mimetype, file.size.toString(), message_type, user_uid, authorization, fileUrl)
        return {
            message: 'File yuklandi',
            fileUrl: `/uploads/${file.filename}`,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
        };
    }

    static storage = diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    });
}
