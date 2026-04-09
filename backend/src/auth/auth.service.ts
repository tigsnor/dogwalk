import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { SignUpOwnerDto } from './dto/signup-owner.dto';
import { SignUpWalkerDto } from './dto/signup-walker.dto';

@Injectable()
export class AuthService {
  signUpOwner(dto: SignUpOwnerDto) {
    return { message: 'owner signup requested', dto };
  }

  signUpWalker(dto: SignUpWalkerDto) {
    return { message: 'walker signup requested', dto };
  }

  login(dto: LoginDto) {
    return {
      message: 'login requested',
      dto,
      token: 'stub-token',
    };
  }
}
