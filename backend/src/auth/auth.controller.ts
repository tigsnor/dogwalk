import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SignUpOwnerDto } from './dto/signup-owner.dto';
import { SignUpWalkerDto } from './dto/signup-walker.dto';

@Controller('auth')
@Public()
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

  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }
}
