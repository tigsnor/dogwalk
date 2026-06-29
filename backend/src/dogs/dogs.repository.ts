import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../common/db/database.service';
import { Dog } from '../common/store/app.store';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';

type DogRow = {
  id: string;
  owner_user_id: string;
  name: string;
  breed: string | null;
  animal_registration_no: string | null;
};

@Injectable()
export class DogsRepository implements OnModuleInit {
  constructor(private readonly database: DatabaseService) {}

  async onModuleInit() {
    await this.ensureSchema();
  }

  async ensureSchema() {
    await this.database.query(`
      create table if not exists dogs (
        id uuid primary key,
        owner_user_id uuid not null references users(id) on delete cascade,
        name text not null,
        breed text,
        animal_registration_no text unique,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      )
    `);
    await this.database.query(
      `create index if not exists dogs_owner_user_id_idx on dogs(owner_user_id)`,
    );
  }

  private toDog(row: DogRow): Dog {
    return {
      id: row.id,
      ownerUserId: row.owner_user_id,
      name: row.name,
      breed: row.breed ?? undefined,
      animalRegistrationNo: row.animal_registration_no ?? undefined,
    };
  }

  async findMine(ownerUserId: string): Promise<Dog[]> {
    const result = await this.database.query<DogRow>(
      `
        select id, owner_user_id, name, breed, animal_registration_no
        from dogs
        where owner_user_id = $1
        order by name asc
      `,
      [ownerUserId],
    );

    return result.rows.map((row) => this.toDog(row));
  }

  async findOwnedById(ownerUserId: string, dogId: string): Promise<Dog | null> {
    const result = await this.database.query<DogRow>(
      `
        select id, owner_user_id, name, breed, animal_registration_no
        from dogs
        where owner_user_id = $1 and id = $2
      `,
      [ownerUserId, dogId],
    );

    return result.rows[0] ? this.toDog(result.rows[0]) : null;
  }

  async create(ownerUserId: string, dogId: string, dto: CreateDogDto): Promise<Dog> {
    const result = await this.database.query<DogRow>(
      `
        insert into dogs (id, owner_user_id, name, breed, animal_registration_no)
        values ($1, $2, $3, $4, $5)
        returning id, owner_user_id, name, breed, animal_registration_no
      `,
      [dogId, ownerUserId, dto.name, dto.breed ?? null, dto.animalRegistrationNo ?? null],
    );

    return this.toDog(result.rows[0]);
  }

  async update(ownerUserId: string, dogId: string, dto: UpdateDogDto): Promise<Dog | null> {
    const current = await this.findOwnedById(ownerUserId, dogId);
    if (!current) return null;

    const result = await this.database.query<DogRow>(
      `
        update dogs
        set name = $3,
            breed = $4,
            animal_registration_no = $5,
            updated_at = now()
        where owner_user_id = $1 and id = $2
        returning id, owner_user_id, name, breed, animal_registration_no
      `,
      [
        ownerUserId,
        dogId,
        dto.name ?? current.name,
        dto.breed ?? current.breed ?? null,
        dto.animalRegistrationNo ?? current.animalRegistrationNo ?? null,
      ],
    );

    return result.rows[0] ? this.toDog(result.rows[0]) : null;
  }
}
