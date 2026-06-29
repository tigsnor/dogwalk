import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { CreateWalkRequestDto } from './dto/create-walk-request.dto';
import { FinishWalkSessionDto } from './dto/finish-walk-session.dto';
import { WalksService } from './walks.service';

@Controller()
export class WalksController {
  constructor(private readonly walksService: WalksService) {}

  @Post('walk-requests')
  @Roles('owner')
  createRequest(@CurrentUser() user: AuthUser, @Body() dto: CreateWalkRequestDto) {
    return this.walksService.createRequest(user, dto);
  }

  @Get('walk-requests')
  @Roles('owner', 'walker', 'admin')
  getRequests(@CurrentUser() user: AuthUser) {
    return this.walksService.getRequests(user);
  }

  @Get('walk-requests/:id')
  @Roles('owner', 'walker', 'admin')
  getRequestById(@CurrentUser() user: AuthUser, @Param('id') requestId: string) {
    return this.walksService.getRequestById(user, requestId);
  }

  @Post('walk-requests/:id/cancel')
  @Roles('owner')
  cancelRequest(@CurrentUser() user: AuthUser, @Param('id') requestId: string) {
    return this.walksService.cancelRequest(user, requestId);
  }

  @Post('walk-requests/:id/accept')
  @Roles('walker')
  acceptRequest(@CurrentUser() user: AuthUser, @Param('id') requestId: string) {
    return this.walksService.acceptRequest(user, requestId);
  }

  @Post('walk-sessions/:id/start')
  @Roles('walker')
  startSession(@CurrentUser() user: AuthUser, @Param('id') sessionId: string) {
    return this.walksService.startSession(user, sessionId);
  }

  @Post('walk-sessions/:id/finish')
  @Roles('walker')
  finishSession(
    @CurrentUser() user: AuthUser,
    @Param('id') sessionId: string,
    @Body() dto: FinishWalkSessionDto,
  ) {
    return this.walksService.finishSession(user, sessionId, dto);
  }

  @Get('walk-sessions/:id')
  @Roles('owner', 'walker')
  getSessionById(@CurrentUser() user: AuthUser, @Param('id') sessionId: string) {
    return this.walksService.getSessionById(user, sessionId);
  }
}
