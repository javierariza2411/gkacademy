import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) userId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Plan' }) planId?: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Subscription' }) subscriptionId?: Types.ObjectId;
  @Prop({ required: true, unique: true }) reference: string;
  @Prop({ required: true }) amount: number;
  @Prop({ default: 'COP' }) currency: string;
  @Prop({ enum: ['ONLINE', 'CASH'], default: 'ONLINE' }) paymentMethod: string;
  @Prop({ default: '' }) concept: string;
  @Prop({ enum: ['PENDING', 'APPROVED', 'DECLINED', 'VOIDED', 'ERROR'], default: 'PENDING' }) status: string;
  @Prop({ default: '' }) providerTransactionId: string;
  @Prop({ default: Date.now }) paidAt: Date;
}

export type PaymentDocument = HydratedDocument<Payment>;
export const PaymentSchema = SchemaFactory.createForClass(Payment);
