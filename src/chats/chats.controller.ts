import { Body, Controller, Get, Logger, Headers, InternalServerErrorException } from '@nestjs/common';
import { ChatsService } from './chats.service';

@Controller('chats')
export class ChatsController {
    private logger = new Logger(ChatsController.name)
    constructor(private readonly chatsService: ChatsService) { }

    @Get()
    async getChats(@Headers() headers: any): Promise<any> {
        try {
            this.logger.log(`Start get chats list`)
            const { authHeader } = headers
            const chatsList = await this.chatsService.getChats(authHeader)
            this.logger.debug(`Complate get chats`)
            return chatsList
        } catch (error) {
            this.logger.error('Failed get all chats', error.stack)
            throw new InternalServerErrorException(error.message)

        }
    }
}
