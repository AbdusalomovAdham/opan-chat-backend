import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CallsDocument = Call & Document

@Schema()
export class Call {
    @Prop({ required: true })
    uid: string

    @Prop({ required: true })
    caller_uid: string

    @Prop({ required: true })
    reciver_uid: string

    @Prop({ required: true })
    type: 'audio' | 'video'

    @Prop({ required: true })
    status: 'missed' | 'answered' | 'declined'

    @Prop({ required: false })
    duration: number

    @Prop({ required: true, default: () => new Date() })
    created_at: Date

}

export const CallsSchema = SchemaFactory.createForClass(Call)