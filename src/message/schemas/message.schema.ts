import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'chat' })
  chat: Types.ObjectId;


  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: Types.ObjectId[];

  @Prop()
  editedAt?: Date;


  @Prop()
  deletedAt?: Date;

  @Prop({ type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' })
  type: string;


}

export const MessageSchema = SchemaFactory.createForClass(Message);
