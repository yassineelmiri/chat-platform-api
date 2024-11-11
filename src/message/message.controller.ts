import { Controller, Post, Get, Body, Param, Query, UseGuards, Delete, BadRequestException } from '@nestjs/common';
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
    try {
      return this.messageService.sendChannelMessage(channelId, createMessageDto);
    } catch (error) {

      throw new BadRequestException('Failed to send message');
    }
  }

  @Get('channel/:channelId')
  async getChannelMessages(
    @Param('channelId') channelId: string,
    @Query() paginationDto: MessagePaginationDto,
  ) {
    try {

      return this.messageService.getChannelMessages(channelId, paginationDto);
    } catch (error) {

      throw new BadRequestException('Failed to get messages');
    }
  }


  @Post('conversation/:conversationId')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    try {


      return this.messageService.sendConversationMessage(
        conversationId,
        createMessageDto,
      );
    } catch (error) {

      throw new BadRequestException('Failed to send message');
    }
  }

  @Get('conversation/:conversationId')
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query() paginationDto: MessagePaginationDto,
  ) {
    try {
      return this.messageService.getConversationMessages(
        conversationId,
        paginationDto,
      );
    } catch (error) {

      throw new BadRequestException('Failed to get messages');
    }
  }

  @Delete(':messageId')
  async deleteMessage(
    @Param('messageId') messageId: string,
    @Body('userId') userId: string,
  ) {
    try {
      return this.messageService.deleteMessage(messageId, userId);
    } catch (error) {

      throw new BadRequestException('Failed to delete messages');
    }
  }

}