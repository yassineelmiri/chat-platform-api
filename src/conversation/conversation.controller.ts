import { Controller, Post, Body, Param, BadRequestException } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { Conversation } from 'src/conversation/schemas/conversation.schema';
import { SendMessageDto } from './dto/send-message.dto';
import { Message } from 'src/message/schemas/message.schema';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) { }

  // @desc : for create conversation first time u will send msg to user
  @Post()
  async createConversation(@Body() createConversationDto: CreateConversationDto): Promise<Conversation> {
    try {
      return this.conversationService.createConversation(createConversationDto);
    } catch (error) {

      throw new BadRequestException('Failed to Create conversation');
    }
  }



}
