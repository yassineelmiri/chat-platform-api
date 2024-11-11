import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { User, UserDocument } from '../user/schemas/user.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { MessageService } from 'src/message/message.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { Message, MessageDocument } from 'src/message/schemas/message.schema';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private messageService: MessageService,
  ) { }

  async createConversation(createConversationDto: CreateConversationDto, userId: string): Promise<Conversation> {
    const { withUser, message } = createConversationDto;

    const userIdObj = new Types.ObjectId(userId);
    const withUserObj = new Types.ObjectId(withUser);

    const userWantToTalkExist = await this.userModel.findById(withUserObj);
    if (!userWantToTalkExist) {
      throw new NotFoundException('User to start conversation with not found');
    }

    let conversation = await this.conversationModel.findOne({
      participants: { $all: [userIdObj, withUserObj] },
    });

    if (conversation) {
      if (message) {
        const messageDto: CreateMessageDto = {
          sender: userId,
          content: message,
        };
        await this.messageService.sendConversationMessage(conversation._id.toString(), messageDto);
        conversation.lastMessage = message; // Update lastMessage field
        await conversation.save(); // Save the conversation with updated lastMessage
      }
      return conversation;
    }

    conversation = new this.conversationModel({
      participants: [userIdObj, withUserObj],
      lastMessage: message || null,
    });
    await conversation.save();

    if (message) {
      const messageDto: CreateMessageDto = {
        sender: userId,
        content: message,
      };
      await this.messageService.sendConversationMessage(conversation._id.toString(), messageDto);
    }

    return conversation;
  }


  async getConversationById(id: string): Promise<Conversation> {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('participants', 'username email')
      .populate('messages')
      .exec();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }


  async getUserConversations(userId: string, page: number, limit: number): Promise<Conversation[]> {
    const skip = (page - 1) * limit;
    const userIdObj = new Types.ObjectId(userId);

    try {
      const conversations = await this.conversationModel
        .find({ participants: userIdObj })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'participants',
          select: 'username email avatar',
          model: 'User'
        })
        .lean()
        .exec();

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }
}
