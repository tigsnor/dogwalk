import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { RefreshTokensRepository } from '../common/repositories/refresh-tokens.repository';
import { UsersRepository } from '../common/repositories/users.repository';
import { AppStore } from '../common/store/app.store';
import { getEnv } from '../config/env';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpOwnerDto } from './dto/signup-owner.dto';
import { SignUpWalkerDto } from './dto/signup-walker.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly store: AppStore,
    private readonly usersRepository: UsersRepository,
    private readonly refreshTokensRepository: RefreshTokensRepository,
  ) {}

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private async issueTokens(userId: string) {
    const env = getEnv();
    const accessToken = jwt.sign({ sub: userId }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: env.jwtAccessExpiresInSec,
    });
    const refreshTokenId = randomUUID();
    const refreshToken = jwt.sign(
      { sub: userId, jti: refreshTokenId },
      env.jwtRefreshSecret,
      {
        algorithm: 'HS256',
        expiresIn: env.jwtRefreshExpiresInSec,
      },
    );

    await this.refreshTokensRepository.create({
      id: refreshTokenId,
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + env.jwtRefreshExpiresInSec * 1000),
    });
    this.store.refreshTokens.set(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresInSec: env.jwtAccessExpiresInSec,
    };
  }

  async signUpOwner(dto: SignUpOwnerDto) {
    const existingUser = await this.usersRepository.findByPhone(dto.phone);
    if (existingUser) {
      throw new ConflictException('Phone already exists');
    }

    const user = await this.usersRepository.create({
      id: randomUUID(),
      role: 'owner',
      name: dto.name,
      phone: dto.phone,
      passwordHash: await this.hashPassword(dto.password),
    });
    this.store.users.set(user.id, user);
    this.store.usersByPhone.set(user.phone, user.id);

    return { userId: user.id, role: 'owner' };
  }

  async signUpWalker(dto: SignUpWalkerDto) {
    const existingUser = await this.usersRepository.findByPhone(dto.phone);
    if (existingUser) {
      throw new ConflictException('Phone already exists');
    }

    const user = await this.usersRepository.create({
      id: randomUUID(),
      role: 'walker',
      name: dto.name,
      phone: dto.phone,
      passwordHash: await this.hashPassword(dto.password),
      walkerApprovalStatus: 'pending',
    });
    this.store.users.set(user.id, user);
    this.store.usersByPhone.set(user.phone, user.id);

    return {
      userId: user.id,
      role: 'walker',
      certificateType: dto.certificateType,
      approvalStatus: 'pending',
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findByPhone(dto.phone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.store.users.set(user.id, user);
    this.store.usersByPhone.set(user.phone, user.id);

    return {
      ...(await this.issueTokens(user.id)),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const env = getEnv();

    const refreshTokenRecord = await this.refreshTokensRepository.findActiveByToken(
      dto.refreshToken,
    );
    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload = jwt.verify(dto.refreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;
      if (payload.sub !== refreshTokenRecord.userId || payload.jti !== refreshTokenRecord.id) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    } catch {
      await this.refreshTokensRepository.revoke(refreshTokenRecord.id);
      this.store.refreshTokens.delete(dto.refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.refreshTokensRepository.revoke(refreshTokenRecord.id);
    this.store.refreshTokens.delete(dto.refreshToken);
    return this.issueTokens(refreshTokenRecord.userId);
  }
}
