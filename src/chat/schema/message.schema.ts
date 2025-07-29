import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type MessagesDocument = Message & Document
@Schema()
export class Message {
    @Prop({ required: true })
    chat_uid: string

    @Prop({ required: false })
    username: string

    @Prop({ required: true })
    text: string

    @Prop({ required: true })
    created_by: string

    @Prop({ required: false })
    token: string

    @Prop({ required: true, default: () => new Date() })
    created_at: Date
}

export const MessagesSchema = SchemaFactory.createForClass(Message);