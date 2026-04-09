import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignUpOwnerDto } from './dto/signup-owner.dto';
import { SignUpWalkerDto } from './dto/signup-walker.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup/owner')
  signUpOwner(@Body() dto: SignUpOwnerDto) {
    return this.authService.signUpOwner(dto);
  }

  @Post('signup/walker')
  signUpWalker(@Body() dto: SignUpWalkerDto) {
    return this.authService.signUpWalker(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
