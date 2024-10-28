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
import { AuthGuard } from 'src/common/guards/auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { RoleTypes } from 'src/common/enums/user.enum';





// this Custom type extending Express Request with user property
interface RequestWithUser extends Request {
  user: { userId: string };
}


@Controller('friend-requests')
@UseGuards(AuthGuard, RoleGuard)
@Roles(RoleTypes.User)
export class FriendRequestController {
  constructor(private readonly friendRequestService: FriendRequestService) {}

  @Post()
  create(
    @Body() createFriendRequestDto: CreateFriendRequestDto,
    @Req() req: any,
  ) {
    return this.friendRequestService.create(
      createFriendRequestDto,
      req.user.userId,
    );
  }

  @Get('pending')
  getPendingRequests(@Req() req: RequestWithUser) {
    return this.friendRequestService.getPendingRequests(req.user.userId);
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
