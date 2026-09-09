import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) studentId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) coachId: Types.ObjectId;
  @Prop({ required: true }) date: string;
  @Prop({ required: true }) time: string;
  @Prop({ default: 60 }) durationMinutes: number;
  @Prop({ default: '' }) location: string;
  @Prop({ enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' }) status: string;
  @Prop({ default: '' }) notes: string;
}

export type SessionDocument = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
