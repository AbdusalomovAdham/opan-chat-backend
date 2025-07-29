import { ChatParticipant, ChatParticipantDocument } from '@/chat/schema/participant.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from "@nestjs/common";
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

            const result = await this.participantModel.aggregate([
                { $match: { user_uid: { $in: [user_uid, otherUserUid] } } },
                {
                    $group: { _id: "$chat_uid", count: { $sum: 1 } }
                },
                {
                    $match: {
                        count: 2
                    }
                }
            ])

            const messages = await this.messageModel.find({ chat_uid: result[0]?._id })
            const username = await this.userModel.find({ uid: otherUserUid }).select('username')
            const messagesWithFlag = messages.map(msg => {
                const plain = msg.toObject();
                return {
                    ...plain,
                    username,
                    my_message: plain.created_by === user_uid
                };
            });

            // console.log(messagesWithFlag)
            return messagesWithFlag
        } catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}
