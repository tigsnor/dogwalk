import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getMe() {
    return { id: 'stub-user', role: 'owner' };
  }
}
