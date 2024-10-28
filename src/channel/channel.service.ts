import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Mongoose, Types } from 'mongoose';
import { Channel, ChannelDocument } from 'src/schemas/channel.schema';
import { Message, MessageDocument } from 'src/schemas/message.schema';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateChannelDto } from './dto/create-channel.dto';


@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,

    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) { }


  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const { name, type, isPrivate, isSafeMode, ownerId } = createChannelDto;

    const owner = await this.userModel.findById(ownerId);
    if (!owner) throw new NotFoundException('Owner not found');

    // Create the new channel
    const newChannel = new this.channelModel({
      name,
      type,
      isPrivate,
      isSafeMode,
      owner: ownerId,
      members: [ownerId]  // Automatically add owner to members 
    });

    // Save the channel and update owner  channels list by add it to his list
    await newChannel.save();
    owner.channels.push(newChannel._id as any);
    await owner.save();

    return newChannel;
  }



  // This Method for joining a channel
  async joinChannel(userId: string, channelId: string): Promise<Channel> {

    // fetch channel by id & chck if xist
    const channel = await this.channelModel.findById(channelId);
    if (!channel) throw new NotFoundException('Channel not found');

    // fetch user by id & chck if exist
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    // check if this user already  in channel
    if (!channel.members.includes(userId as any)) {
      channel.members.push(userId as any);
      await channel.save();

      user.channels.push(channelId as any);
      await user.save();
    }

    return channel;
  }

  // Method for sending a message
  async sendMessage(userId: string, channelId: string, content: string): Promise<Message> {
    const user = await this.userModel.findById(userId);
    const channel = await this.channelModel.findById(channelId);

    if (!user) throw new NotFoundException('User not found');
    if (!channel) throw new NotFoundException('Channel not found');

    const message = new this.messageModel({
      sender: user._id,
      channel: channel._id,
      content,
    });

    await message.save();

    // Add message reference to both channel and user
    channel.messages.push(message._id as any);
    await channel.save();

    user.messages.push(message._id as any);
    await user.save();

    return message;
  }
}
