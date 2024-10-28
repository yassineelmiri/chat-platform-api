import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { User } from './user.schema';
import { Message } from './message.schema';

export type ChannelDocument = HydratedDocument<Channel>;



@Schema()
export class Channel extends Document {
  @Prop()
  name: string;

  @Prop()
  type: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop({ default: false })
  isSafeMode: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  owner: User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  members: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  moderators: User[];

  @Prop({ type: [String], default: [] })
  bannedWords: string[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
