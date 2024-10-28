import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import { Conversation, ConversationSchema } from 'src/schemas/conversation.schema';
import { MessageService } from 'src/message/message.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Conversation.name, schema: ConversationSchema },
      { name: Message.name, schema: MessageSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ConversationService, MessageService],
  exports: [ConversationService, MessageService],
})
export class ConversationModule { }
