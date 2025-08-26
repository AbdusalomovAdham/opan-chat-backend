import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ChatsRepository } from './repositories/chats.repositories';
import { JwtTokenService } from '@/auth/jwt/token.service';

@Injectable()
export class ChatsService {
    private logger = new Logger(ChatsService.name)
    constructor(
        private readonly chatsRespository: ChatsRepository,
        private readonly jwtTokenService: JwtTokenService
    ) { }

    async getChats(authHeader: any) {
        try {
            this.logger.log(`Start get chats`)
            const verifToken = await this.jwtTokenService.verifyToken(authHeader)
            const { sub } = verifToken
            const chatsList = await this.chatsRespository.getChats({ uid: sub })
            return chatsList
        } catch (error) {
            this.logger.error(`Faild get chats`, error.stack)
            throw new InternalServerErrorException(error.message)
        }
    }

    async getAllMessages(authHeader: any, chat_uid: string) {
        try {
            const verifToken = await this.jwtTokenService.verifyToken(authHeader)
            const myUid = verifToken.sub
            const messageList = await this.chatsRespository.getMessagesWithUser({ chat_uid, myUid })
            return messageList
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}   
