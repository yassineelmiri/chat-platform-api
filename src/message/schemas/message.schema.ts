import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Channel } from '../../channel/schemas/chat.schema';
import { User } from '../../user/schemas/user.schema';
import { Conversation } from '../../conversation/schemas/conversation.schema';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Channel' })
  channel?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation?: Types.ObjectId;

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
