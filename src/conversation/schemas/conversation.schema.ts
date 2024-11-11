import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../user/schemas/user.schema';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true })
export class Conversation {
  @Prop([{ type: Types.ObjectId, ref: 'User', required: true }])
  participants: Types.ObjectId[];

  @Prop({ type: String })
  lastMessage: string;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);