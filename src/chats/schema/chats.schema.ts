import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type ChatsDocument = Chat & Document

@Schema()
export class Chat {
    @Prop({ required: true })
    uid: string

    @Prop({ required: true })
    type: 'GROUP' | 'P2P'

    @Prop({ required: true })
    create_by: string

    @Prop({ required: true })
    created_at: string
}

export const ChatsSchema = SchemaFactory.createForClass(Chat);
