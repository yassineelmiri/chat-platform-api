import { BadRequestException, Body, Controller, Delete, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleTypes } from 'src/common/enums/user.enum';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RequestWithUser } from 'src/common/types/user.types';
import { Chat } from './schemas/chat.schema';
import { ChatService } from './chat.service';


@Controller('chats')
@UseGuards(AuthGuard)
@Roles(RoleTypes.User)
export class ChannelController {
  constructor(private readonly chatService: ChatService) { }



  @Post('create')
  async createChat(@Body() createChatDto: CreateChatDto, @Req() req: RequestWithUser): Promise<Chat> {
    try {
      return this.chatService.createChat({ ownerId: req.userId, ...createChatDto });
    } catch (error) {

      throw new BadRequestException('Failed to create chat');
    }
  }


  @Delete(':chatId')
  async deleteChat(
    @Param('chatId') chatId: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {

    return this.chatService.deleteChat(chatId, req.userId);
  }

}
