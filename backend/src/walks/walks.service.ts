import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore } from '../common/store/app.store';
import { AuthUser } from '../common/types/auth-user';
import { DogsRepository } from '../dogs/dogs.repository';
import { CreateWalkRequestDto } from './dto/create-walk-request.dto';
import { FinishWalkSessionDto } from './dto/finish-walk-session.dto';
import { WalksRepository } from './walks.repository';

@Injectable()
export class WalksService {
  constructor(
    private readonly store: AppStore,
    private readonly dogsRepository: DogsRepository,
    private readonly walksRepository: WalksRepository,
  ) {}

  async createRequest(user: AuthUser, dto: CreateWalkRequestDto) {
    const dog = await this.dogsRepository.findOwnedById(user.id, dto.dogId);
    if (!dog) {
      throw new NotFoundException('Dog not found');
    }

    this.store.dogs.set(dog.id, dog);
    const walkRequest = await this.walksRepository.createRequest(
      user.id,
      randomUUID(),
      dto,
    );

    this.store.walkRequests.set(walkRequest.id, walkRequest);
    return walkRequest;
  }

  async getRequests(user: AuthUser) {
    const requests = await this.walksRepository.findRequestsForUser(user.id, user.role);
    for (const request of requests) {
      this.store.walkRequests.set(request.id, request);
    }
    return requests;
  }

  async getRequestById(user: AuthUser, requestId: string) {
    const request = await this.walksRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Walk request not found');
    }

    const isOwner = request.ownerUserId === user.id;
    const isAssignedWalker = request.walkerUserId === user.id;
    const canAccess =
      isOwner ||
      isAssignedWalker ||
      user.role === 'admin' ||
      (user.role === 'walker' && request.status === 'pending');

    if (!canAccess) {
      throw new ForbiddenException('No permission to view this walk request');
    }

    this.store.walkRequests.set(request.id, request);
    return request;
  }

  async cancelRequest(user: AuthUser, requestId: string) {
    const request = await this.walksRepository.findRequestById(requestId);
    if (!request || request.ownerUserId !== user.id) {
      throw new NotFoundException('Walk request not found');
    }

    if (request.status !== 'pending') {
      throw new UnprocessableEntityException('Only pending requests can be cancelled');
    }

    const updated = await this.walksRepository.cancelRequest(requestId);
    if (!updated) {
      throw new NotFoundException('Walk request not found');
    }

    this.store.walkRequests.set(requestId, updated);
    return updated;
  }

  async acceptRequest(user: AuthUser, requestId: string) {
    const request = await this.walksRepository.findRequestById(requestId);
    if (!request) {
      throw new NotFoundException('Walk request not found');
    }

    if (request.status !== 'pending') {
      throw new UnprocessableEntityException('Only pending requests can be accepted');
    }

    const accepted = await this.walksRepository.acceptRequest(request, user.id);

    this.store.walkSessions.set(accepted.session.id, accepted.session);
    this.store.walkRequests.set(accepted.request.id, accepted.request);

    return accepted;
  }

  async startSession(user: AuthUser, sessionId: string) {
    const session = await this.walksRepository.findSessionById(sessionId);
    if (!session || session.walkerUserId !== user.id) {
      throw new NotFoundException('Walk session not found');
    }

    if (session.status !== 'accepted') {
      throw new UnprocessableEntityException('Only accepted sessions can be started');
    }

    const updated = await this.walksRepository.startSession(sessionId);
    if (!updated) {
      throw new NotFoundException('Walk session not found');
    }

    this.store.walkSessions.set(sessionId, updated);
    return updated;
  }

  async finishSession(user: AuthUser, sessionId: string, dto: FinishWalkSessionDto) {
    const session = await this.walksRepository.findSessionById(sessionId);
    if (!session || session.walkerUserId !== user.id) {
      throw new NotFoundException('Walk session not found');
    }

    if (session.status !== 'in_progress' || !session.startedAt) {
      throw new UnprocessableEntityException('Only in-progress sessions can be finished');
    }

    const avgSpeedKmh = Number(((dto.distanceM / dto.durationSec) * 3.6).toFixed(2));
    const updated = await this.walksRepository.finishSession(
      sessionId,
      dto,
      avgSpeedKmh,
    );
    if (!updated) {
      throw new NotFoundException('Walk session not found');
    }

    this.store.walkSessions.set(sessionId, updated);
    return updated;
  }

  async getSessionById(user: AuthUser, sessionId: string) {
    const session = await this.walksRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundException('Walk session not found');
    }

    if (session.ownerUserId !== user.id && session.walkerUserId !== user.id) {
      throw new ForbiddenException('No permission to view this walk session');
    }

    this.store.walkSessions.set(session.id, session);
    return session;
  }
}
