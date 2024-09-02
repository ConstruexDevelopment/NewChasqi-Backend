import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ strict: false})
export class KPI {
  @Prop({ required: true})
  title: string;

  @Prop({ required: true})
  target: number;

  @Prop({ required: true})
  timeUnit: number;

  @Prop({ required: true})
  fieldtobeevaluated: string;
}

@Schema({ strict: false})
export class TaskLog {
  @Prop({ required: true, default: Date.now })
  registerDate: Date; 
}

@Schema()
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  priority: number;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true})
  concurrence: boolean;

  @Prop({ required: true})
  state: string;

  @Prop({ type: [KPI], default: []})
  kpis: KPI[];

  @Prop({ type: [TaskLog], default: []})
  tasklogs: TaskLog[];
}

@Schema({ strict: false})
export class Employee extends Document {
  @Prop({ required: true })
  name: string;
  
  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  work_position: string;
  
  @Prop({ type: [Task], default: [] })
  tasks: Task[];
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);
