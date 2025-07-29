import { Body, Controller, Get, Logger, Headers, InternalServerErrorException, Param } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
    private logger = new Logger(ChatsController.name)
    constructor(private readonly chatsService: ChatsService) { }

    @Get()
    async getChats(@Headers() headers: any): Promise<any> {
        try {
            this.logger.log(`Start get chats list`)
            const { authorization } = headers
            // console.log('auth header', headers)
            const chatsList = await this.chatsService.getChats(authorization)
            this.logger.debug(`Complate get chats`)
            return chatsList
        } catch (error) {
            this.logger.error('Failed get all chats', error.stack)
            throw new InternalServerErrorException(error.message)

        }
    }

    @Get('/messages/:uid')
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
