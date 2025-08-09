import { UsersModule } from '@/users/users.module';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { User, UsersDocument } from '@/users/schema/users.schema';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Call, CallsDocument } from '../schema/call.schema';
import { CallModule } from '../call.module';

@Injectable()
export class CallRepository {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UsersDocument>,
        @InjectModel(Call.name) private readonly callModel: Model<CallsDocument>,
    ) { }

    async missedCall(callType: string, callerUid: string, reciverUid: string): Promise<{ message: string }> {
        try {
            const uid = uuidv4()
            const missedCall = new this.callModel({
                uid,
                caller_uid: callerUid,
                reciver_uid: reciverUid,
                type: callType,
                status: 'missed',
                created_at: new Date(),
            })

            await missedCall.save()
            return { message: 'Save missed call' }
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async answeredCall(callType: string, callerUid: string, reciverUid: string): Promise<{ message: string }> {
        try {
            const uid = uuidv4()
            const answeredCall = new this.callModel({
                uid,
                caller_uid: callerUid,
                reciver_uid: reciverUid,
                type: callType,
                status: 'answered',
                created_at: new Date()
            })

            await answeredCall.save()

            return { message: 'Create answered call' }
        } catch (error) {
            throw new InternalServerErrorException(error.messasge)
        }
    }

    async declinedCall(callType: string, callerUid: string, reciverUid: string): Promise<{ message: string }> {
        try {
            const uid = uuidv4()
            const declinedCall = new this.callModel({
                uid,
                caller_uid: callerUid,
                reciver_uid: reciverUid,
                type: callType,
                status: 'declined',
                created_at: new Date()
            })

            await declinedCall.save()

            return { message: 'Create declined call' }
        } catch (error) {
            throw new InternalServerErrorException(error.messasge)
        }
    }

    async getCalls(userUid: string): Promise<any[]> {
        try {
            const calls = await this.callModel.find({
                $or: [
                    { caller_uid: userUid },
                    { reciver_uid: userUid }
                ]
            });

            const userUids = new Set<string>();
            calls.forEach(call => {
                const otherUid = call.caller_uid === userUid ? call.reciver_uid : call.caller_uid;
                userUids.add(otherUid);
            });

            const users = await this.userModel.find(
                { uid: { $in: Array.from(userUids) } },
                { uid: 1, username: 1, avatar: 1, _id: 0 }
            );

            const userMap = new Map(users.map(user => [user.uid, user]));

            const callsWithUsers = calls.map(call => {
                const otherUid = call.caller_uid === userUid ? call.reciver_uid : call.caller_uid;
                const user = userMap.get(otherUid);
                return {
                    ...call.toObject(),
                    user: user || null
                };
            });

            return callsWithUsers;

        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

} 
