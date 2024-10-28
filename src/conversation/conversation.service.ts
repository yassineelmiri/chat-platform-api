import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Conversation, ConversationDocument } from '../schemas/conversation.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { MessageService } from 'src/message/message.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private messageService: MessageService,
  ) { }

  async createConversation(createConversationDto: CreateConversationDto): Promise<Conversation> {
    const { participantIds, content } = createConversationDto;


    // Check if users exist
    const participants = await this.userModel.find({ _id: { $in: participantIds } });
    if (participants.length !== participantIds.length) {
      throw new NotFoundException('One or more users not found');
    }

    // create the new conversation
    const newConversation = new this.conversationModel({
      participants: participantIds,
      messages: [], //  here i initialize with empty messages array
    });

    await newConversation.save();

    // send the initial message if content is provided
    if (content) {
      const messageDto: CreateMessageDto = {
        senderId: participants[0]._id as any, //  the First participant index sends initial message
        content: content,
      };

      const message = await this.messageService.sendConversationMessage(
        newConversation._id.toString(),
        messageDto
      );


      //TODO: push to channe;
    }

    return newConversation;
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



  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationModel
      .find({ participants: userId })
      .populate('participants', 'username email')
      .populate('messages')
      .exec();
  }
}