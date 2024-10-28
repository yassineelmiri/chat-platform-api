import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { RoleTypes, StatusUser } from 'src/common/enums/user.enum';
import { Channel } from './channel.schema';
import { Message } from './message.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: RoleTypes, default: RoleTypes.Admin })
  role: string;

  @Prop({ enum: StatusUser, default: StatusUser.OFFLINE })
  status: string;

  @Prop({ default: 0 })
  reputation: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  friends: User[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Channel' }] })
  channels: Channel[];

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Message' }] })
  messages: Message[];

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);