import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ strict: false})
export class TaskLog {
  @Prop({ required: true, default: Date.now })
  registerDate: Date; 
}

@Schema()
export class Task extends Document {
    @Prop({ required: true })
    Title: string;

    @Prop({ required: true })
    Priority: number;

    @Prop({ required: true })
    Start_Date: Date;

    @Prop({ required: true })
    End_Date: Date;

    @Prop({ required: true })
    Concurrence: boolean;

    @Prop({ required: true })
    State: string;

    @Prop({ type: [Types.ObjectId], ref: 'KPI', default: [] })
    Kpis: Types.ObjectId[];

    @Prop({ type: [TaskLog], default: [] })
    Task_Logs: TaskLog[];
}

export const  TaskSchema = SchemaFactory.createForClass(Task);
