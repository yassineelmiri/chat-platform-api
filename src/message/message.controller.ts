import { Controller, Post, Get, Body, Param, Query, UseGuards, Delete, BadRequestException, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagePaginationDto } from './dto/message-pagination.dto';
import { RequestWithUser } from 'src/common/types/user.types';


@Controller('messages')

export class MessageController {
  constructor(private readonly messageService: MessageService) { }




  @Post('conversation/:conversationId')
  async sendMessage(
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: RequestWithUser
  ) {
    try {


      return this.messageService.sendMessage(
        conversationId,
        createMessageDto,
        req.userId
      );
    } catch (error) {

      throw new BadRequestException('Failed to send message');
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