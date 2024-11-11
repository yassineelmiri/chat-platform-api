import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/conversation/schemas/conversation.schema';
import { Message, MessageSchema } from 'src/message/schemas/message.schema';
import { Channel, ChannelSchema } from 'src/channel/schemas/chat.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Channel.name, schema: ChannelSchema },

    ]),

  ],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule { }