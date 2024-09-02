import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema()
export class Tenant extends Document {
  @Prop({ required: true })
  companyName: string;
  @Prop({ required: true, unique: true })
  tenantId: string;
  @Prop({ required: true, minlength: 8})
  password: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
