import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ strict: false })
export class Activity extends Document {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    isComplete: boolean;

    @Prop({ required: true })
    creationDate: Date;

    @Prop({ type: Types.ObjectId, ref: 'Employee', required: true })
    employeeId: Types.ObjectId;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);