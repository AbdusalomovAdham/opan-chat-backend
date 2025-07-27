import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Message, MessagesDocument } from "./schema/message.schema";
import { Model } from 'mongoose';


@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Message.name) private readonly messageModule: Model<MessagesDocument>
    ) { }

    async saveMessage(data: { username: string, message: string, user_uid: string }) {
        const newMsg = new this.messageModule(data)
        return await newMsg.save()
    }

    async getAllMessage() {
        return await this.messageModule.find().sort({ create_at: 1 }).exec()
    }

}