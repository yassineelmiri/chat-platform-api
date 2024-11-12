import { Controller, Post, Get, Body, Param, Query, UseGuards, Delete, BadRequestException, Req } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RequestWithUser } from 'src/common/types/user.types';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleTypes } from 'src/common/enums/user.enum';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('messages')
@UseGuards(AuthGuard)
@Roles(RoleTypes.User)
export class MessageController {
  constructor(private readonly messageService: MessageService) { }




  @Post(':chatId')
  async sendMessage(
    @Param('chatId') chatId: string,
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: RequestWithUser
  ) {
    try {


      return this.messageService.sendMessage(
        chatId,
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



  // Get all messages belonging to a specific chat with details
  @Get(':chatId')
  async getChatById(
    @Param('chatId') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    try {
      return await this.messageService.getMessagesBelongChat(chatId, page, limit);
    } catch (error) {
      throw new BadRequestException('Failed to retrieve chat messages');
    }
  }

}