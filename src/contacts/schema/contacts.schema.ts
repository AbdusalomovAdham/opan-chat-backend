import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ContactsDocument = Contact & Document

@Schema()
export class Contact {
    @Prop({ required: true })
    uid: string

    @Prop({ required: true })
    user_uid: string

    @Prop({ required: true })
    contact_uid: string

    @Prop({ required: true, default: () => new Date() })
    created_at: Date

}

export const ContactsSchema = SchemaFactory.createForClass(Contact)