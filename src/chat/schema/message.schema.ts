import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type MessagesDocument = Message & Document;

@Schema({ _id: false })
export class FileMeta {
    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    url: string

    @Prop({ required: true })
    mime_type: string

    @Prop({ required: true })
    size: string

    @Prop({ required: false })
    message_type: string
}

const FileMetaSchema = SchemaFactory.createForClass(FileMeta)

@Schema()
export class Message {
    @Prop({ required: true })
    uid: string;

    @Prop({ required: true })
    chat_uid: string;

    @Prop({ required: false })
    text?: string;

    @Prop({ required: true })
    created_by: string

    @Prop({ required: false })
    token?: string

    @Prop({ required: true, default: () => new Date() })
    created_at: Date

    @Prop({ required: false, type: FileMetaSchema })
    file?: FileMeta

    @Prop({ required: true, default: false })
    is_read: boolean
}

export const MessagesSchema = SchemaFactory.createForClass(Message)
