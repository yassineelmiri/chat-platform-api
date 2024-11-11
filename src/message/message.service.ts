import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { Chat, ChatDocument } from 'src/channel/schemas/chat.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
  ) { }

  async sendMessage(chatId: string, createMessageDto: CreateMessageDto, userId: string): Promise<Message> {
    const { content } = createMessageDto;


    const sender = userId // sender is person who authed
    
    // Find the chat
    const chat = await this.chatModel.findById(chatId).exec();
    if (!chat) throw new NotFoundException('Chat not found');

    // Check if the sender is a member of the chat
    if (!chat.members.includes(sender as any)) {
      throw new BadRequestException('User is not a member of the chat');
    }

    // Create and save the message
    const message = new this.messageModel({
      sender,
      content,
      chat: chat._id, // Associate the message with the chat
      type: 'text', // now is text type
    });
    await message.save();

    // Update the lastMessage field in the chat document
    chat.lastMessage = content;
    await chat.save();

    return message;
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

  }
}
