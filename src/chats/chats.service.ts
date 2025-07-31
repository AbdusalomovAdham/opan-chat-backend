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

    async getAllMessages(authHeader: any, otherUserUid: string) {
        try {
            console.log('token', authHeader)
            const verifToken = await this.jwtTokenService.verifyToken(authHeader)
            const { sub } = verifToken
            const messageList = await this.chatsRespository.getAllMessages(sub, otherUserUid)
            return messageList
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}   
