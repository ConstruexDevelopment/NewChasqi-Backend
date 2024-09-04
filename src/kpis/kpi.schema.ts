import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ strict: false})
export class KPI extends Document {
  @Prop({ required: true})
  Title: string;

  @Prop({ required: true})
  Target: number;

  @Prop({ required: true})
  Time_Unit: number;

  @Prop({ required: true})
  Field_To_Be_Evaluated: string;
}

export const  KPISchema = SchemaFactory.createForClass(KPI);