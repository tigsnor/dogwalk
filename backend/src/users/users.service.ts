import { Injectable, NotFoundException } from '@nestjs/common';
import { AppStore } from '../common/store/app.store';

@Injectable()
export class UsersService {
  constructor(private readonly store: AppStore) {}

  getMe(userId: string) {
    const user = this.store.users.get(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      role: user.role,
      name: user.name,
      phone: user.phone,
    };
  }
}
