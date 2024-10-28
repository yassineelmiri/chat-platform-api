import { Controller, Post, Body, Param } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from 'src/schemas/conversation.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from 'src/schemas/message.schema';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

    // @desc : for create conversation first time u will send msg to user
  @Post()
  async createConversation(@Body() createConversationDto: CreateConversationDto): Promise<Conversation> {
    return this.conversationService.createConversation(createConversationDto);
  }


  
}
