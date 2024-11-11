import { IsArray, IsBoolean, IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;

  @IsBoolean()
  @IsOptional()
  isSafeMode?: boolean;

  @IsMongoId()
  @IsOptional()
  ownerId?: string;

  @IsMongoId()
  @IsOptional()
  @IsArray()
  mambers?: string[];
}
