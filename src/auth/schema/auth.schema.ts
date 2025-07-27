import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuthDocument = User & Document

@Schema()
export class User {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    uid: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: false })
    email?: string;

    @Prop({ required: false })
    @Prop()
    avatar?: string;

    @Prop({ required: false })
    @Prop()
    phone_number?: string
}


export const AuthSchema = SchemaFactory.createForClass(User);
