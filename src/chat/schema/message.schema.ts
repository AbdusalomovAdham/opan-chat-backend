import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type MessagesDocument = Message & Document
@Schema({ timestamps: true })
export class Message {
    @Prop({ required: false })
    chat_uid: string

    @Prop({ required: true })
    user_uid: string

    @Prop({ required: false })
    username: string

    @Prop({ required: true })
    message: string

    @Prop({ required: false })
    created_by: string

    @Prop({ required: true, default: () => new Date() })
    created_at: Date
}

export const MessagesSchema = SchemaFactory.createForClass(Message);