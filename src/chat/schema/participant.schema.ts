import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class ChatParticipant {
    @Prop({ required: false, unique: true })
    uid: string;

    @Prop({ required: true })
    chat_uid: string;

    @Prop({ required: true })
    user_uid: string;

    @Prop({ required: false })
    created_by: string;
}

export type ChatParticipantDocument = ChatParticipant & Document;
export const ChatParticipantSchema = SchemaFactory.createForClass(ChatParticipant);
