import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class Chat {
    @Prop({ required: false })
    created_by: string;

    @Prop({ required: false })
    users: string;

    @Prop({ default: () => new Date() })
    created_at: Date;

    @Prop({ required: false })
    uid: string;

    @Prop({ required: false })
    type: 'GROUP' | 'P2P';

    @Prop({ required: false })
    avatar?: string

    @Prop({ required: false })
    group_name: string
}

export type ChatDocument = Chat & Document;
export const ChatSchema = SchemaFactory.createForClass(Chat);
