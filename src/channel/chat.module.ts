import { Module } from '@nestjs/common';
import { ChannelController } from './chat.controller';
import { ChannelGateway } from './chat.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Message, MessageSchema } from 'src/message/schemas/message.schema';
import { Chat, ChatSchema } from './schemas/chat.schema';
import { ChatService } from './chat.service';

@Module({
  imports: [

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [ChannelController],
  providers: [ChatService, ChannelGateway],
  exports: [ChatService, MongooseModule],  // Export  service to use it in other moduel
})
export class ChannelModule { }