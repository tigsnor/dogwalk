import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../common/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getMe(userId: string) {
    const user = await this.usersRepository.findById(userId);
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
