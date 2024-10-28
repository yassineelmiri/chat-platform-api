import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateFriendRequestDto {
  @IsNotEmpty()
  @IsMongoId()
  recipientId: string;
}
