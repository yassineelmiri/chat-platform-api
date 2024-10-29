import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../schemas/message.schema';
import { Channel, ChannelDocument } from 'src/schemas/channel.schema';
import { Conversation, ConversationDocument } from 'src/schemas/conversation.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagePaginationDto } from './dto/message-pagination.dto';


@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,


  ) { }


  // this respons for send msg inside channel
  async sendChannelMessage(
    channelId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const channel = await this.channelModel.findById(channelId);
    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    if (!channel.members.includes(createMessageDto.senderId as any)) {
      throw new BadRequestException('User is not a member of this channel');
    }

    const message = new this.messageModel({
      ...createMessageDto,
      channel: channelId,
    });

    await message.save();

    await this.channelModel.findByIdAndUpdate(
      channelId,
      { $push: { messages: message._id } },
    );

    return message;
  }


  // this respons for get msgs inside channel
  async getChannelMessages(
    channelId: string,
    paginationDto: MessagePaginationDto,
  ): Promise<Message[]> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    return this.messageModel
      .find({ channel: channelId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username')
      .exec();
  }




  // now this for conversations 
  async sendConversationMessage(
    conversationId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participants.includes(createMessageDto.senderId as any)) {
      throw new BadRequestException('User is not a participant in this conversation');
    }

    const message = new this.messageModel({
      ...createMessageDto,
      conversation: conversationId,
    });

    await message.save();

    await this.conversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { messages: message._id } },
    );

    return message;
  }


  async getConversationMessages(
    conversationId: string,
    paginationDto: MessagePaginationDto,
  ): Promise<Message[]> {
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    return this.messageModel
      .find({ conversation: conversationId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username')
      .exec();
  }



  // this response for delete msg in both channel and conversation
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.sender.toString() !== userId) {
      throw new BadRequestException('User can only delete their own messages');
    }

    await this.messageModel.findByIdAndDelete(messageId);

    // Remove message reference from conversation
    if (message.conversation) {
      await this.conversationModel.findByIdAndUpdate(
        message.conversation,
        { $pull: { messages: messageId } }
      );
    }
  }
}