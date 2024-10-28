import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateConversationDto {
    @IsArray()
    @IsNotEmpty()
    participantIds: string[]; // Array of User IDs user  and user 

    @IsString()
    content: string; //  here contain initial message content 
}
