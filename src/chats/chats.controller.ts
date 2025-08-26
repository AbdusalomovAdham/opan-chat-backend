import { Body, Controller, Get, Logger, Headers, InternalServerErrorException, Param, UseGuards } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('chats')
export class ChatsController {
    private logger = new Logger(ChatsController.name)
    constructor(private readonly chatsService: ChatsService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    async getChats(@Headers() headers: any): Promise<any> {
        try {
            this.logger.log(`Start get chats list`)
            const { authorization } = headers
            const chatsList = await this.chatsService.getChats(authorization)
            this.logger.debug(`Complate get chats`)
            return chatsList
        } catch (error) {
            this.logger.error('Failed get all chats', error.stack)
            throw new InternalServerErrorException(error.message)

        }
    }

    @Get('/messages/:uid')
    @UseGuards(JwtAuthGuard)
    async getAllMessages(@Headers() headers: any, @Param('uid') uid: string) {
        try {
            const { authorization } = headers
            const messagesList = await this.chatsService.getAllMessages(authorization, uid)
            return messagesList
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}
