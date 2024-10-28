import { Controller, Post, Get, Body, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagePaginationDto } from './dto/message-pagination.dto';


@Controller('messages')

export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post('channel/:channelId')
  async sendChannelMessage(
    @Param('channelId') channelId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.sendChannelMessage(channelId, createMessageDto);
  }

  @Get('channel/:channelId')
  async getChannelMessages(
    @Param('channelId') channelId: string,
    @Query() paginationDto: MessagePaginationDto,
  ) {
    return this.messageService.getChannelMessages(channelId, paginationDto);
  }


  @Post('conversation/:conversationId')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.sendConversationMessage(
      conversationId,
      createMessageDto,
    );
  }

  @Get('conversation/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() paginationDto: MessagePaginationDto,
  ) {
    return this.messageService.getConversationMessages(
      conversationId,
      paginationDto,
    );
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Body('userId') userId: string,
  ) {
    return this.messageService.deleteMessage(messageId, userId);
  }

}