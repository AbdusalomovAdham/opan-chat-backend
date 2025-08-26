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

    async getChats({ uid }: { uid: string }): Promise<any[]> {
        try {
            const userChats = await this.participantModel.find({ user_uid: uid });
            if (!userChats.length) return [];

            const chatUids = userChats.map(chat => chat.chat_uid);

            const p2pChats = await this.chatModel.find({
                uid: { $in: chatUids },
                type: 'P2P',
            });
            if (!p2pChats.length) return [];

            const p2pChatUids = p2pChats.map(c => c.uid);

            const allParticipants = await this.participantModel.find({
                chat_uid: { $in: p2pChatUids },
            });

            const otherUserUids = [
                ...new Set(
                    allParticipants
                        .filter(p => p.user_uid !== uid)
                        .map(p => p.user_uid),
                ),
            ];

            const users = await this.userModel.find({
                uid: { $in: otherUserUids },
            }).select('-password');

            // 🔹 Last messages
            const lastMessages = await this.messageModel.aggregate([
                { $match: { chat_uid: { $in: p2pChatUids } } },
                { $sort: { created_at: -1 } },
                {
                    $group: {
                        _id: "$chat_uid",
                        lastMessage: { $first: "$text" },
                    },
                },
            ]);

            const chatToLastMessage = lastMessages.reduce((acc, m) => {
                acc[m._id] = m.lastMessage;
                return acc;
            }, {} as Record<string, any>);

            // 🔹 Unread counts
            const unreadCounts = await this.messageModel.aggregate([
                {
                    $match: {
                        chat_uid: { $in: p2pChatUids },
                        is_read: false,
                        sender_uid: { $ne: uid }, // o‘zing yuborgan xabar bo‘lmasin
                    },
                },
                {
                    $group: {
                        _id: "$chat_uid",
                        unreadCount: { $sum: 1 },
                    },
                },
            ]);

            const chatToUnreadCount = unreadCounts.reduce((acc, m) => {
                acc[m._id] = m.unreadCount;
                return acc;
            }, {} as Record<string, number>);

            // 🔹 Chat UID mapping
            const uidToChatUid = allParticipants.reduce((acc, p) => {
                if (p.user_uid !== uid) {
                    acc[p.user_uid] = p.chat_uid;
                }
                return acc;
            }, {} as Record<string, string>);

            // 🔹 Return users list with lastMessage + unreadCount
            const usersList = users.map(user => {
                const chatUid = uidToChatUid[user.uid];
                return {
                    ...user.toObject(),
                    chat_uid: chatUid || null,
                    lastMessage: chatToLastMessage[chatUid] || null,
                    unreadCount: chatToUnreadCount[chatUid] || 0, // ⬅️ qo‘shildi
                };
            });

            return usersList;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
    
    async getMessagesWithUser({ chat_uid, myUid }: { chat_uid: string, myUid: string }) {
        try {
            const chatUserUids = await this.participantModel.find({ chat_uid });
            if (!chatUserUids.length) {
                throw new InternalServerErrorException('Not found chat');
            }

            const chatUserUidMap = chatUserUids.map(chat => chat.user_uid);

            // Foydalanuvchilarni olish
            const chatUsersInfo = await this.userModel.find({
                uid: { $in: chatUserUidMap },
            }).select('username avatar uid -_id');

            // xotirada tezroq topish uchun userlarni map qilib qo‘yamiz
            const userMap = chatUsersInfo.reduce((acc, user) => {
                acc[user.uid] = user;
                return acc;
            }, {} as Record<string, any>);

            // Messagelarni olish
            const chatMessageList = await this.messageModel.find({
                chat_uid,
            })

            // Messagelarga user va my_message qo‘shish
            const result = chatMessageList.map(msg => ({
                ...msg.toObject(),
                my_message: msg.created_by === myUid,
                user: userMap[msg.created_by] || null,
            }));

            return result;
        } catch (error) {
            throw new InternalServerErrorException(error.message);
        }
    }
}
