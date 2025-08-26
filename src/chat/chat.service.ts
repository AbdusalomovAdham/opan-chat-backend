import { Injectable, InternalServerErrorException } from '@nestjs/common';
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
            const existingChat = await this.chatModel.findOne({ uid: user_uid });
            if (!existingChat) {
                throw new Error('Chat not found!');
            }

            const newMessage = new this.messageModel({
                uid: uuidv4(),
                chat_uid: user_uid,
                text: message,
                created_by: senderUid,
                created_at: new Date(),
            });
            await newMessage.save();

            return newMessage;
        } catch (error) {
            console.error('Error saving message:', error);
            throw error;
        }
    }

    async getAllMessage() {
        return this.messageModel.find().sort({ created_at: 1 }).exec();
    }

    async saveFile(fileName: string, fileType: string, fileSize: string, message_type: string, chat_uid: string, token: string, fileUrl: string) {
        try {
            const verifyToken = await this.jwtTokenService.verifyToken(token)
            const senderUid = verifyToken.sub
            console.log('chat_uid', chat_uid)
            const messageUid = uuidv4()
            const newMessage = new this.messageModel({
                uid: messageUid,
                chat_uid: chat_uid,
                text: null,
                created_by: senderUid,
                created_at: new Date(),
                file: {
                    name: fileName,
                    url: fileUrl,
                    mime_type: fileType,
                    size: fileSize,
                    message_type
                }
            })
            await newMessage.save()
            return newMessage
        }
        catch (error) {
            throw new InternalServerErrorException(error.message)
        }
    }
}

