import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Channel } from './channel.schema';
import { User } from './user.schema';
import { Conversation } from './conversation.schema';

export type MessageDocument = Message & Document;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender: User;

  @Prop({ type: Types.ObjectId, ref: 'Channel' })
  channel?: Channel;

  @Prop({ type: Types.ObjectId, ref: 'Conversation' })
  conversation?: Conversation;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: User[];

  @Prop()
  editedAt?: Date;


  @Prop()
  deletedAt?: Date;

  @Prop({ type: String, enum: ['text', 'image', 'file', 'system'], default: 'text' })
  type: string;


}

export const MessageSchema = SchemaFactory.createForClass(Message);
