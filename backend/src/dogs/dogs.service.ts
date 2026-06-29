import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore } from '../common/store/app.store';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { DogsRepository } from './dogs.repository';

@Injectable()
export class DogsService {
  constructor(
    private readonly store: AppStore,
    private readonly dogsRepository: DogsRepository,
  ) {}

  async findMine(ownerUserId: string) {
    const dogs = await this.dogsRepository.findMine(ownerUserId);
    for (const dog of dogs) {
      this.store.dogs.set(dog.id, dog);
    }
    return dogs;
  }

  async create(ownerUserId: string, dto: CreateDogDto) {
    const dog = await this.dogsRepository.create(ownerUserId, randomUUID(), dto);
    this.store.dogs.set(dog.id, dog);
    return dog;
  }

  async update(ownerUserId: string, dogId: string, dto: UpdateDogDto) {
    const updated = await this.dogsRepository.update(ownerUserId, dogId, dto);
    if (!updated) {
      throw new NotFoundException('Dog not found');
    }

    this.store.dogs.set(dogId, updated);
    return updated;
  }
}
