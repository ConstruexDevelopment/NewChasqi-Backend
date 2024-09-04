import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
 
@Schema({ strict: false })
export class Employee extends Document {
  @Prop({ required: true })
  Name: string;

  @Prop({ required: true })
  Department: string;

  @Prop({ required: true })
  Work_position: string;

  @Prop({ required: true })
  Role: number; 

  // Relación uno a muchos con Task
  @Prop({ type: [Types.ObjectId], ref: 'Task', default: [] })
  Tasks: Types.ObjectId[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
