import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AppStore } from '../common/store/app.store';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';

@Injectable()
export class DogsService {
  constructor(private readonly store: AppStore) {}

  findMine(ownerUserId: string) {
    return [...this.store.dogs.values()].filter(
      (dog) => dog.ownerUserId === ownerUserId,
    );
  }

  create(ownerUserId: string, dto: CreateDogDto) {
    const id = randomUUID();
    const dog = {
      id,
      ownerUserId,
      name: dto.name,
      breed: dto.breed,
      animalRegistrationNo: dto.animalRegistrationNo,
    };
    this.store.dogs.set(id, dog);
    return dog;
  }

  update(ownerUserId: string, dogId: string, dto: UpdateDogDto) {
    const dog = this.store.dogs.get(dogId);
    if (!dog || dog.ownerUserId !== ownerUserId) {
      throw new NotFoundException('Dog not found');
    }

    const updated = {
      ...dog,
      ...dto,
    };
    this.store.dogs.set(dogId, updated);
    return updated;
  }
}
