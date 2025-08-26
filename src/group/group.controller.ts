import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Body, Controller, Delete, Get, InternalServerErrorException, Logger, Post, UploadedFile, UseGuards, UseInterceptors, Headers, Param } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { GroupService } from './group.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '@/config/multer.config';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('group')
export class GroupController {
    private logger = new Logger(GroupController.name)
    constructor(private readonly groupService: GroupService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getGroups(
        @Headers() authHeader: any
    ) {
        const token = authHeader?.authorization
        const groupList = await this.groupService.getGroupsList(token)
        return groupList
    }

    @Get('/message/:uid')
    @UseGuards(JwtAuthGuard)
    async getGroupMessageParams(
        @Param('uid') uid: string,
        @Headers() authHeader: any
    ) {
        const groupUid = uid
        const token = authHeader.authorization
        const groupList = await this.groupService.getGroupMessageParams({ groupUid, token })
        return groupList
    }

    @Get('/users/:uid')
    @UseGuards(JwtAuthGuard)
    async getGroupUsers(
        @Param('uid') uid: string,
        @Headers() authHeader: any
    ) {
        try {
            const groupUid = uid
            const token = authHeader.authorization
            const groupUsers = await this.groupService.getGroupUsers({ groupUid, token })
            return groupUsers
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }


    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: './uploads/groups',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    async createGroup(
        @Body() body: { participantUids: string; groupName: string },
        @UploadedFile() file: Express.Multer.File,
        @Headers() authHeader: any,
    ) {
        try {
            const { groupName } = body;
            const participantUids: string[] = JSON.parse(body.participantUids);
            const token = authHeader?.authorization;

            const avatarUrl = file ? `/uploads/groups/${file.filename}` : null;

            console.log("avatarUrl", avatarUrl, token)
            return this.groupService.createGroup({ token, participantUids, groupName, avatarUrl });
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }


}   
