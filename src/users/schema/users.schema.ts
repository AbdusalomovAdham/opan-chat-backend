import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UsersDocument = User & Document;

@Schema()
export class User {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    uid: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    email?: string;

    @Prop()
    full_name?: string;

    @Prop()
    avatar?: string;

    @Prop()
    phone_number?: string;

    @Prop()
    address?: string;

    @Prop()
    bio?: string;

    @Prop()
    last_seen?: Date

    @Prop()
    is_online?: false
}

export const UsersSchema = SchemaFactory.createForClass(User);
