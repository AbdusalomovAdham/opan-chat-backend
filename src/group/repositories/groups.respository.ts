import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";
import { CreateGroupDto } from "../dto/create-group.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Chat, ChatDocument } from "@/chat/schema/chat.schema";
import { Message, MessagesDocument } from "@/chat/schema/message.schema";
import { ChatParticipant, ChatParticipantDocument } from "@/chat/schema/participant.schema";
import { v4 as uuidv4 } from 'uuid';
import { JwtTokenService } from "@/auth/jwt/token.service";

@Injectable()
export class GroupRepository {
    private logger = new Logger(GroupRepository.name)
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<MessagesDocument>,
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(ChatParticipant.name) private readonly participantModel: Model<ChatParticipantDocument>,
    ) { }

    async getGroupsList(userUid: string) {
        const groupList = await this.participantModel.aggregate([
            { $match: { user_uid: userUid } },
            {
                $lookup: {
                    from: 'chats', localField: 'chat_uid', foreignField: 'uid', as: 'chat',
                },
            },
            { $unwind: '$chat' },
            { $match: { 'chat.type': 'GROUP' } },
            {
                $lookup: {
                    from: 'chat_participants', localField: 'chat_uid', foreignField: 'chat_uid', as: 'participants',
                },
            },
            {
                $addFields: {
                    membersCount: { $size: '$participants' },
                },
            },

            {
                $project: {
                    _id: 0, chat_uid: 1, membersCount: 1, 'chat.uid': 1, 'chat.avatar': 1, 'chat.created_at': 1, 'chat.created_by': 1, 'chat.group_name': 1, 'chat.type': 1,
                },
            },
        ])
        return groupList
    }



    async createGroup({ creatorUid, groupName, participantUids, avatarUrl }: { creatorUid: string, groupName: string, participantUids: string[], avatarUrl?: string | null }): Promise<{ message: string }> {
        try {
            this.logger.log(`Start create group, group-name: ${groupName}`)
            const chatUid = uuidv4()
            const chat = await this.chatModel.create({
                uid: chatUid,
                type: 'GROUP',
                created_by: creatorUid,
                created_at: new Date(),
                avatar: avatarUrl || null,
                group_name: groupName
            })

            await chat.save()
            this.logger.debug(`Group saved to chats:  ${groupName}`)
            const allParticipants = Array.from(new Set([creatorUid, ...participantUids]))
            await this.participantModel.insertMany(
                allParticipants.map(userUid => ({
                    uid: uuidv4(),
                    user_uid: userUid,
                    chat_uid: chatUid
                }))
            )
            this.logger.debug(`Participants save:  ${groupName}`)
            this.logger.debug(`Start create group, group-name: ${groupName}`)
            return { message: 'Create new group' }
        } catch (error) {
            this.logger.error(`Error create group: ${groupName}`)
            throw new InternalServerErrorException(`Error create group`)
        }
    }

    async getGroupMessage({ userUid, groupUid }: { userUid: string, groupUid: string }) {
        try {
            const groupMessages = await this.participantModel.aggregate([
                {
                    $match: {
                        chat_uid: groupUid
                    }
                },
                {
                    $group: {
                        _id: null,
                        user_uids: { $addToSet: "$user_uid" }
                    }
                },
                {
                    $lookup: {
                        from: "messages",
                        let: { group_uid: groupUid, members: "$user_uids" },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ["$chat_uid", "$$group_uid"] },
                                            { $in: ["$created_by", "$$members"] }
                                        ]
                                    }
                                }
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    localField: "created_by",
                                    foreignField: "uid",
                                    as: "user"
                                }
                            },
                            { $unwind: "$user" },
                            {
                                $project: {
                                    _id: 0,
                                    uid: 1,
                                    text: 1,
                                    created_at: 1,
                                    "user.username": 1,
                                    "user.avatar": 1
                                }
                            },
                            { $sort: { created_at: 1 } }
                        ],
                        as: "messages"
                    }
                },
                {
                    $project: {
                        _id: 0,
                        messages: 1
                    }
                }
            ])

            return groupMessages
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }

    async getGroupUsers({ userUid, groupUid }: { userUid: string, groupUid: string }) {
        try {
            const participants = await this.participantModel.aggregate([
                { $match: { chat_uid: groupUid } },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_uid',
                        foreignField: 'uid',
                        as: 'userInfo'
                    }
                },
                { $unwind: '$userInfo' },
                {
                    $project: {
                        _id: 0,
                        'userInfo.uid': 1,
                        'userInfo.username': 1,
                        'userInfo.email': 1,
                        'userInfo.avatar': 1
                    }
                }
            ])

            return participants.map(p => p.userInfo)


        } catch (error) {
            throw new InternalServerErrorException('Error get group users')
        }
    }
}