import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GroupRepository } from './repositories/groups.respository';
import { CreateGroupDto } from './dto/create-group.dto';
import { JwtTokenService } from '@/auth/jwt/token.service';


@Injectable()
export class GroupService {
    private logger = new Logger(GroupService.name)

    constructor(
        private readonly groupRepository: GroupRepository,
        private readonly jwtTokenService: JwtTokenService
    ) { }

    async userUid(token: string) {
        try {
            const verifyToken = await this.jwtTokenService.verifyToken(token)
            return verifyToken.sub
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }


    }
    async getGroupsList(token: string) {
        const userUid = await this.userUid(token)
        return this.groupRepository.getGroupsList(userUid)
    }

    async createGroup({ groupName, participantUids, avatarUrl, token }: { groupName: string, participantUids: string[], avatarUrl?: string | null, token: string }) {
        try {
            const creatorUid = await this.userUid(token)
            return this.groupRepository.createGroup({ creatorUid, groupName, participantUids, avatarUrl })
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async getGroupMessageParams({ groupUid, token }: { groupUid: string, token: string }) {
        try {
            const userUid = await this.userUid(token)
            const messageList = await this.groupRepository.getGroupMessage({ groupUid, userUid })
            return messageList
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
    async getGroupUsers({ groupUid, token }: { groupUid: string, token: string }) {
        try {
            const userUid = await this.userUid(token)
            const userList = await this.groupRepository.getGroupUsers({ userUid, groupUid })
            return userList
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}
