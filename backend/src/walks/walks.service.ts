import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore, WalkRequest, WalkSession } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { CreateWalkRequestDto } from './dto/create-walk-request.dto';
import { FinishWalkSessionDto } from './dto/finish-walk-session.dto';

@Injectable()
export class WalksService {
  constructor(private readonly store: AppStore) {}

  private nowIso() {
    return new Date().toISOString();
  }

  createRequest(user: AuthUser, dto: CreateWalkRequestDto) {
    const dog = this.store.dogs.get(dto.dogId);
    if (!dog || dog.ownerUserId !== user.id) {
      throw new NotFoundException('Dog not found');
    }

    const timestamp = this.nowIso();
    const walkRequest: WalkRequest = {
      id: randomUUID(),
      ownerUserId: user.id,
      dogId: dto.dogId,
      scheduledAt: dto.scheduledAt,
      requestNote: dto.requestNote,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.walkRequests.set(walkRequest.id, walkRequest);
    return walkRequest;
  }

  getRequests(user: AuthUser) {
    const requests = [...this.store.walkRequests.values()];

    if (user.role === 'owner') {
      return requests.filter((request) => request.ownerUserId === user.id);
    }

    if (user.role === 'walker') {
      return requests.filter(
        (request) =>
          request.status === 'pending' ||
          (request.status === 'accepted' && request.walkerUserId === user.id),
      );
    }

    return requests;
  }

  getRequestById(user: AuthUser, requestId: string) {
    const request = this.store.walkRequests.get(requestId);
    if (!request) {
      throw new NotFoundException('Walk request not found');
    }

    const isOwner = request.ownerUserId === user.id;
    const isAssignedWalker = request.walkerUserId === user.id;
    const canAccess = isOwner || isAssignedWalker || (user.role === 'walker' && request.status === 'pending');

    if (!canAccess) {
      throw new ForbiddenException('No permission to view this walk request');
    }

    return request;
  }

  cancelRequest(user: AuthUser, requestId: string) {
    const request = this.store.walkRequests.get(requestId);
    if (!request || request.ownerUserId !== user.id) {
      throw new NotFoundException('Walk request not found');
    }

    if (request.status !== 'pending') {
      throw new UnprocessableEntityException('Only pending requests can be cancelled');
    }

    const updated: WalkRequest = {
      ...request,
      status: 'cancelled',
      updatedAt: this.nowIso(),
    };

    this.store.walkRequests.set(requestId, updated);
    return updated;
  }

  acceptRequest(user: AuthUser, requestId: string) {
    const request = this.store.walkRequests.get(requestId);
    if (!request) {
      throw new NotFoundException('Walk request not found');
    }

    if (request.status !== 'pending') {
      throw new UnprocessableEntityException('Only pending requests can be accepted');
    }

    const timestamp = this.nowIso();
    const walkSession: WalkSession = {
      id: randomUUID(),
      walkRequestId: request.id,
      ownerUserId: request.ownerUserId,
      walkerUserId: user.id,
      dogId: request.dogId,
      status: 'accepted',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const updatedRequest: WalkRequest = {
      ...request,
      status: 'accepted',
      walkerUserId: user.id,
      walkSessionId: walkSession.id,
      updatedAt: timestamp,
    };

    this.store.walkSessions.set(walkSession.id, walkSession);
    this.store.walkRequests.set(request.id, updatedRequest);

    return {
      request: updatedRequest,
      session: walkSession,
    };
  }

  startSession(user: AuthUser, sessionId: string) {
    const session = this.store.walkSessions.get(sessionId);
    if (!session || session.walkerUserId !== user.id) {
      throw new NotFoundException('Walk session not found');
    }

    if (session.status !== 'accepted') {
      throw new UnprocessableEntityException('Only accepted sessions can be started');
    }

    const updated: WalkSession = {
      ...session,
      status: 'in_progress',
      startedAt: this.nowIso(),
      updatedAt: this.nowIso(),
    };

    this.store.walkSessions.set(sessionId, updated);
    return updated;
  }

  finishSession(user: AuthUser, sessionId: string, dto: FinishWalkSessionDto) {
    const session = this.store.walkSessions.get(sessionId);
    if (!session || session.walkerUserId !== user.id) {
      throw new NotFoundException('Walk session not found');
    }

    if (session.status !== 'in_progress' || !session.startedAt) {
      throw new UnprocessableEntityException('Only in-progress sessions can be finished');
    }

    const avgSpeedKmh = Number(((dto.distanceM / dto.durationSec) * 3.6).toFixed(2));
    const timestamp = this.nowIso();

    const updated: WalkSession = {
      ...session,
      status: 'finished',
      distanceM: dto.distanceM,
      durationSec: dto.durationSec,
      avgSpeedKmh,
      memo: dto.memo,
      finishedAt: timestamp,
      updatedAt: timestamp,
    };

    this.store.walkSessions.set(sessionId, updated);
    return updated;
  }

  getSessionById(user: AuthUser, sessionId: string) {
    const session = this.store.walkSessions.get(sessionId);
    if (!session) {
      throw new NotFoundException('Walk session not found');
    }

    if (session.ownerUserId !== user.id && session.walkerUserId !== user.id) {
      throw new ForbiddenException('No permission to view this walk session');
    }

    return session;
  }
}
