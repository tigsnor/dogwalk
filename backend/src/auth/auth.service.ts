import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AppStore } from '../common/store/app.store';
import { getEnv } from '../config/env';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpOwnerDto } from './dto/signup-owner.dto';
import { SignUpWalkerDto } from './dto/signup-walker.dto';

@Injectable()
export class AuthService {
  constructor(private readonly store: AppStore) {}

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private issueTokens(userId: string) {
    const env = getEnv();
    const accessToken = jwt.sign({ sub: userId }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: env.jwtAccessExpiresInSec,
    });
    const refreshToken = jwt.sign({ sub: userId, jti: randomUUID() }, env.jwtRefreshSecret, {
      algorithm: 'HS256',
      expiresIn: env.jwtRefreshExpiresInSec,
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
    if (this.store.usersByPhone.has(dto.phone)) {
      throw new ConflictException('Phone already exists');
    }

    const userId = randomUUID();
    this.store.users.set(userId, {
      id: userId,
      role: 'owner',
      name: dto.name,
      phone: dto.phone,
      passwordHash: await this.hashPassword(dto.password),
    });
    this.store.usersByPhone.set(dto.phone, userId);

    return { userId, role: 'owner' };
  }

  async signUpWalker(dto: SignUpWalkerDto) {
    if (this.store.usersByPhone.has(dto.phone)) {
      throw new ConflictException('Phone already exists');
    }

    const userId = randomUUID();
    this.store.users.set(userId, {
      id: userId,
      role: 'walker',
      name: dto.name,
      phone: dto.phone,
      passwordHash: await this.hashPassword(dto.password),
    });
    this.store.usersByPhone.set(dto.phone, userId);

    return {
      userId,
      role: 'walker',
      certificateType: dto.certificateType,
      approvalStatus: 'pending',
    };
  }

  async login(dto: LoginDto) {
    const userId = this.store.usersByPhone.get(dto.phone);
    if (!userId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.store.users.get(userId);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      ...this.issueTokens(user.id),
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }

  refresh(dto: RefreshTokenDto) {
    const env = getEnv();

    const userId = this.store.refreshTokens.get(dto.refreshToken);
    if (!userId) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const payload = jwt.verify(dto.refreshToken, env.jwtRefreshSecret) as jwt.JwtPayload;
      if (payload.sub !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }
    } catch {
      this.store.refreshTokens.delete(dto.refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    this.store.refreshTokens.delete(dto.refreshToken);
    return this.issueTokens(userId);
  }
}
