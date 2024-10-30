import { IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isSafeMode?: boolean;

  @IsMongoId()
  ownerId?: string;
}
