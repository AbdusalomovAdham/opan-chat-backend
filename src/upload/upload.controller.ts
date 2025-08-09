import { JwtTokenService } from '@/auth/jwt/token.service';
import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    Body,
    Headers
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UserService } from '@/users/users.service';
import { FileUploadService } from './upload.service';

@Controller('upload')
export class UploadController {
    constructor(private readonly userService: UserService,
        private readonly jwtTokenService: JwtTokenService,
        private readonly fileUploadService: FileUploadService) { }

    @Post('avatar')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async uploadAvatar(
        @UploadedFile() file: Express.Multer.File,
        @Headers() authHeader: any
    ) {
        const { authorization } = authHeader
        const verifyToken = await this.jwtTokenService.verifyToken(authorization)
        const userUid = verifyToken?.sub
        await this.userService.updateAvatar(userUid, file.filename)
        return {
            message: 'Avatar saqlandi',
            avatar: `/uploads/${file.filename}`,
        };
    }


    @Post('file')
    @UseInterceptors(FileInterceptor('file', { storage: FileUploadService.storage }))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Headers() authHeader: any,
        @Body() body: { message_type: string; user_uid: string, file_name: string }
    ) {
        const { authorization } = authHeader
        return this.fileUploadService.saveFile(file, authorization, body.message_type, body.user_uid, body.file_name)
    }

}
