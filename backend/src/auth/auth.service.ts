import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { AppStore } from '../common/store/app.store';
import { LoginDto } from './dto/login.dto';
import { SignUpOwnerDto } from './dto/signup-owner.dto';
import { SignUpWalkerDto } from './dto/signup-walker.dto';

@Injectable()
export class AuthService {
  constructor(private readonly store: AppStore) {}

  private hashPassword(password: string) {
    return createHash('sha256').update(password).digest('hex');
  }

  signUpOwner(dto: SignUpOwnerDto) {
    if (this.store.usersByPhone.has(dto.phone)) {
      throw new ConflictException('Phone already exists');
    }

    const userId = randomUUID();
    this.store.users.set(userId, {
      id: userId,
      role: 'owner',
      name: dto.name,
      phone: dto.phone,
      passwordHash: this.hashPassword(dto.password),
    });
    this.store.usersByPhone.set(dto.phone, userId);

    return { userId, role: 'owner' };
  }

  signUpWalker(dto: SignUpWalkerDto) {
    if (this.store.usersByPhone.has(dto.phone)) {
      throw new ConflictException('Phone already exists');
    }

    const userId = randomUUID();
    this.store.users.set(userId, {
      id: userId,
      role: 'walker',
      name: dto.name,
      phone: dto.phone,
      passwordHash: this.hashPassword(dto.password),
    });
    this.store.usersByPhone.set(dto.phone, userId);

    return {
      userId,
      role: 'walker',
      certificateType: dto.certificateType,
      approvalStatus: 'pending',
    };
  }

  login(dto: LoginDto) {
    const userId = this.store.usersByPhone.get(dto.phone);
    if (!userId) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = this.store.users.get(userId);
    if (!user || user.passwordHash !== this.hashPassword(dto.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = randomUUID();
    this.store.tokens.set(accessToken, user.id);

    return {
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone,
      },
    };
  }
}
