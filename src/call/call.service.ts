import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Model } from 'mongoose';
import { CallsDocument } from './schema/call.schema';
import { CallRepository } from '@/call/repositories/call.repository';
import { JwtTokenService } from '@/auth/jwt/token.service';
import { CallModule } from './call.module';

@Injectable()
export class CallService {
    constructor(
        private readonly callRepository: CallRepository,
        private readonly jwtTokenService: JwtTokenService
    ) { }

    async missedCall(callType: string, callerUid: string, reciverUid: string): Promise<{ message: string }> {
        try {
            const createCall = await this.callRepository.missedCall(callType, callerUid, reciverUid)
            return createCall
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async answeredCall(callType: string, callerUid: string, reciverUid: string): Promise<{ message: string }> {
        try {
            const createCall = await this.callRepository.answeredCall(callType, callerUid, reciverUid)
            return createCall
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async declinedCall(callType: string, callerUid: string, reciverUid: string): Promise<{ message: string }> {
        try {
            const createCall = await this.callRepository.declinedCall(callType, callerUid, reciverUid)
            return createCall
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async getCalls(authorization: string): Promise<CallModule[]> {
        try {
            const verifyToken = await this.jwtTokenService.verifyToken(authorization)
            const callList = await this.callRepository.getCalls(verifyToken.sub)
            return callList
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}
