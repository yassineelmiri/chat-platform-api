import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversation, ConversationSchema } from 'src/schemas/conversation.schema';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import { Channel, ChannelSchema } from 'src/schemas/channel.schema';

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