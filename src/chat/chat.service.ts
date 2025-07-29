import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Chat, ChatDocument } from '@/chat/schema/chat.schema';
import { ChatParticipant, ChatParticipantDocument } from '@/chat/schema/participant.schema';
import { Message, MessagesDocument } from '@/chat/schema/message.schema';
import { JwtTokenService } from '@/auth/jwt/token.service';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly messageModel: Model<MessagesDocument>,
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(ChatParticipant.name) private readonly participantModel: Model<ChatParticipantDocument>,
        private readonly jwtTokenService: JwtTokenService,
    ) { }

    async saveMessage(data: { message: string; user_uid: string; token: string }) {
        try {
            const { message, user_uid, token } = data;

            const decoded = await this.jwtTokenService.verifyToken(token);
            const senderUid = decoded.sub;

            const [receiverChats, senderChats] = await Promise.all([
                this.participantModel.find({ user_uid }).select('chat_uid'),
                this.participantModel.find({ user_uid: senderUid }).select('chat_uid'),
            ]);

            const receiverChatUids = receiverChats.map(cp => cp.chat_uid.toString());
            const senderChatUids = senderChats.map(cp => cp.chat_uid.toString());

            const commonChatUids = receiverChatUids.filter(chatUid =>
                senderChatUids.includes(chatUid),
            );

            const existingChat = await this.chatModel.findOne({
                uid: { $in: commonChatUids },
                type: 'P2P',
            });

            const messageUid = uuidv4();

            if (existingChat) {
                const newMessage = new this.messageModel({
                    uid: messageUid,
                    chat_uid: existingChat.uid,
                    text: message,
                    created_by: senderUid,
                    created_at: new Date(),
                });

                await newMessage.save();

                return { message: 'Message saved in existing chat.' };
            }

            const newChatUid = uuidv4();

            const newChat = new this.chatModel({
                uid: newChatUid,
                type: 'P2P',
                created_by: senderUid,
                created_at: new Date(),
            });

            await newChat.save();

            const participants = [
                {
                    uid: uuidv4(),
                    chat_uid: newChatUid,
                    user_uid,
                },
                {
                    uid: uuidv4(),
                    chat_uid: newChatUid,
                    user_uid: senderUid,
                },
            ];

            await this.participantModel.insertMany(participants);

            const newMessage = new this.messageModel({
                uid: messageUid,
                chat_uid: newChatUid,
                text: message,
                created_by: senderUid,
                created_at: new Date(),
            });

            await newMessage.save();

            return { message: 'New chat created and message saved.' };
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    async getAllMessage() {
        return this.messageModel.find().sort({ created_at: 1 }).exec();
    }
}
