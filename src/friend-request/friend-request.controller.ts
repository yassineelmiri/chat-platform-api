import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FriendRequestService } from './friend-request.service';
import { CreateFriendRequestDto } from './dto/create-friend-request.dto';
import { UpdateFriendRequestDto } from './dto/update-friend-request.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RoleTypes } from 'src/common/enums/user.enum';
import { RequestWithUser } from 'src/common/types/user.types';







@Controller('friend-requests')
@UseGuards(AuthGuard, RoleGuard)
@Roles(RoleTypes.User)
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) { }

  @Post()
  create(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @Req() req: RequestWithUser,
  ) {
    return this.friendRequestService.create(
      createFriendRequestDto,
      req.userId,
    );
  }

  @Get('pending')
  getPendingRequests(@Req() req: RequestWithUser) {
    return this.friendRequestService.getPendingRequests(req.userId);
  }

  @Patch(':id')
  updateRequestStatus(
    @Param('id') id: string,
    @Body() updateFriendRequestDto: UpdateFriendRequestDto,
  ) {
    return this.friendRequestService.updateRequestStatus(
      id,
      updateFriendRequestDto,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.friendRequestService.delete(id);
  }
}
