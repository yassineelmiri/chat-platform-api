import { Body, Controller, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { JoinChannelDto } from './dto/join-channel.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Channel } from 'src/schemas/channel.schema';
import { Message } from 'src/schemas/message.schema';
import { CreateChannelDto } from './dto/create-channel.dto';


@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) { }

  @Post('join')
  async joinChannel(@Body() joinChannelDto: JoinChannelDto): Promise<Channel> {
    const { userId, channelId } = joinChannelDto;
    return this.channelService.joinChannel(userId, channelId);
  }

  @Post('message')
  async sendMessage(@Body() sendMessageDto: SendMessageDto): Promise<Message> {
    const { userId, channelId, content } = sendMessageDto;
    return this.channelService.sendMessage(userId, channelId, content);
  }

  @Post('create')
  async createChannel(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    return this.channelService.createChannel(createChannelDto);
  }
}
