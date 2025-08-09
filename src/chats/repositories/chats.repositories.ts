import { ChatParticipant, ChatParticipantDocument } from '@/chat/schema/participant.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { User, UsersDocument } from '@/users/schema/users.schema';
import { Chat, ChatDocument } from '@/chat/schema/chat.schema';
import { Model } from 'mongoose';
import { Message, MessagesDocument } from '@/chat/schema/message.schema';

@Injectable()
export class ChatsRepository {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(Message.name) private readonly messageModel: Model<MessagesDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UsersDocument>,
        @InjectModel(ChatParticipant.name) private readonly participantModel: Model<ChatParticipantDocument>,
    ) { }

    async getChats({ uid }: { uid: string }): Promise<User[]> {
        try {
            const userChats = await this.participantModel.find({ user_uid: uid });
            if (!userChats.length) return [];
            const chatUids = userChats.map(chat => chat.chat_uid);
            const allParticipants = await this.participantModel.find({
                chat_uid: { $in: chatUids },
            });
            const otherUserUids = [
                ...new Set(
                    allParticipants
                        .filter(p => p.user_uid !== uid)
                        .map(p => p.user_uid)
                ),
            ];
            const users = await this.userModel.find({
                uid: { $in: otherUserUids },
            });
            return users;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

    async getAllMessages(user_uid: string, otherUserUid: string) {
        try {
            const chat_uid = await this.participantModel.aggregate([
                {
                    $match: { user_uid: { $in: [user_uid, otherUserUid] }, },
                },
                {
                    $group: {
                        _id: '$chat_uid', users: { $addToSet: '$user_uid' },
                    },
                },
                {
                    $match: {
                        users: { $all: [user_uid, otherUserUid] }, $expr: { $eq: [{ $size: '$users' }, 2] },
                    },
                },
                {
                    $project: {
                        _id: 0, chat_uid: '$_id',
                    },
                },
            ]);

            if (chat_uid.length === 0) {
                throw new NotFoundException('Messages no yet')
            }
            const messages = await this.messageModel.find({
                chat_uid: chat_uid[0]?.chat_uid
            }).sort({ created_at: 1 });
            const otherUser = await this.userModel.findOne({ uid: otherUserUid }).select('username avatar');
            const messagesWithFlag = messages.map((msg) => {
                const plain = msg.toObject();
                return {
                    ...plain,
                    username: otherUser?.username,
                    avatar: otherUser?.avatar,
                    my_message: plain.created_by === user_uid,
                };
            });


            return messagesWithFlag;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }

}
