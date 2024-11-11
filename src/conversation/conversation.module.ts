import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/user/schemas/user.schema';
import { Conversation, ConversationSchema } from 'src/conversation/schemas/conversation.schema';
import { MessageService } from 'src/message/message.service';
import { ChannelModule } from 'src/channel/chat.module';
import { Message, MessageSchema } from 'src/message/schemas/message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      {
        name: User.name,
        schema: UserSchema
      },
      { name: Message.name, schema: MessageSchema },
    ]),
    ChannelModule
  ],
  controllers: [ConversationController],
  providers: [ConversationService, MessageService],

})
export class ConversationModule { }