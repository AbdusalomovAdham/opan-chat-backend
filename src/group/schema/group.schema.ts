import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

export type GroupsDocument = Group & Document
@Schema()
export class Group {
    @Prop({ required: true })
    uid: string

    @Prop({ required: true })
    type: 'GROUP'

    @Prop({ required: true })
    created_by: string

    @Prop({ required: true, default: Date.now })
    creted_at: Date
}

export const GroupSchema = SchemaFactory.createForClass(Group)

