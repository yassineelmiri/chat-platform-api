import { IsEnum } from 'class-validator';
import { FriendRequestStatus } from 'src/schemas/friend-request.schema';

export class UpdateFriendRequestDto {
  @IsEnum(FriendRequestStatus)
  status: FriendRequestStatus;
}
