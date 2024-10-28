import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { User, UserDocument } from 'src/schemas/user.schema';
import { FriendRequest, FriendRequestDocument, FriendRequestStatus } from 'src/schemas/friend-request.schema';

@Injectable()
export class FriendRequestService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendRequestModel: Model<FriendRequestDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(
    createFriendRequestDto: CreateFriendRequestDto,
    senderId: string,
  ) {
    const { recipientId } = createFriendRequestDto;

    const existingRequest = await this.friendRequestModel.findOne({
      sender: senderId,
      recipient: recipientId,
      status: FriendRequestStatus.PENDING,
    });

    if (existingRequest) {
      throw new Error('Friend request already sent');
    }

    const friendRequest = new this.friendRequestModel({
      sender: senderId,
      recipient: recipientId,
    });
    return friendRequest.save();
  }

  async getPendingRequests(userId: string) {
    return this.friendRequestModel
      .find({
        recipient: userId,
        status: FriendRequestStatus.PENDING,
      })
      .populate('sender', 'username email');
  }

  async updateRequestStatus(
    id: string,
    updateFriendRequestDto: UpdateFriendRequestDto,
  ) {
    const friendRequest = await this.friendRequestModel.findById(id);

    if (!friendRequest) throw new NotFoundException('Friend request not found');

    friendRequest.status = updateFriendRequestDto.status;
    await friendRequest.save();

    if (updateFriendRequestDto.status === FriendRequestStatus.ACCEPTED) {
      await this.addFriendship(friendRequest.sender, friendRequest.recipient);
    }

    return friendRequest;
  }

  async delete(id: string) {
    return this.friendRequestModel.findByIdAndDelete(id);
  }

  private async addFriendship(
    senderId: Types.ObjectId,
    recipientId: Types.ObjectId,
  ) {
    await this.userModel.updateOne(
      { _id: senderId },
      { $addToSet: { friends: recipientId } },
    );
    await this.userModel.updateOne(
      { _id: recipientId },
      { $addToSet: { friends: senderId } },
    );
  }
}
