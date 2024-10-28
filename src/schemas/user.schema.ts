import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { RoleTypes } from 'src/common/enums/user.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  email: string;  

  @Prop({ required: true })
  password: string;

  @Prop({enum: RoleTypes, default: RoleTypes.Admin})
  role: string;

  @Prop({default: false})
  isOnline: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);