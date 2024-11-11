import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { CreateChatDto } from './dto/create-chat.dto';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { MessageService } from 'src/message/message.service';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { Message, MessageDocument } from 'src/message/schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private messageService: MessageService,
  ) { }





  // could be group and normal chat between 2 people
  async createChat(createChatDto: CreateChatDto, userId: string): Promise<Chat> {
    const { name, type, isPrivate, isSafeMode, members, isGroup, message } = createChatDto;


    const ownerId = new Types.ObjectId(userId);  // convert userId toObjectId and   owner is who create group or conversation first time
    // Validate members if provided
    if (members) {
      const membersExist = await this.userModel.find({ _id: { $all: members } });
      if (!membersExist || membersExist.length !== members.length) {
        throw new NotFoundException('One or more members not found');
      }
    }

    // Create new Chat group/conversation
    const newChat = new this.chatModel({
      name,
      type,
      isPrivate,
      isSafeMode,
      owner: isGroup ? ownerId : undefined, // if chat is group save owener
      members: [ownerId, ...members],
      isGroup,
    });


    // create first msg if user wnat start normal conversation
    if (!isGroup && message) {
      // Create initial message if its a direct conversation
      const messageDto: CreateMessageDto = {
        content: message,
      };
      await this.messageService.sendMessage(newChat._id.toString(), messageDto, userId);
      newChat.lastMessage = message;
    }

    await newChat.save();
    return newChat;
  }



  async joinChat(userId: string, chatId: string): Promise<Chat> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) throw new NotFoundException('Chat not found');

    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (!chat.members.includes(userId as any)) {
      chat.members.push(userId as any);
      await chat.save();
    }

    return chat;
  }



  // thsi if you want remove chat weaher group or not
  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (!chat.isGroup && chat.owner?.toString() !== userId) {
      throw new BadRequestException('User can only delete their own Chat');
    }

    await this.chatModel.findByIdAndDelete(chatId);
  }


  // this is fetch all messages chat
  async getChatById(chatId: string, page: number, limit: number): Promise<Chat> {
    const skip = (page - 1) * limit;
    const chatIdObj = new Types.ObjectId(chatId);

    const chat = await this.chatModel
      .findById(chatIdObj)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('members', 'username email')
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }



  // bring all chats weather is group or dm
  async getUserChats(userId: string, page: number, limit: number): Promise<any[]> {
    const skip = (page - 1) * limit;
    const userIdObj = new Types.ObjectId(userId);

    const chats = await this.chatModel
      .find({ members: userIdObj })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'members',
        select: 'username email avatar',
        model: 'User'
      })
      .lean()
      .exec();

    return chats;
  }
}