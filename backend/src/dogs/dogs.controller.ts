import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { AuthUser } from '../common/types/auth-user';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { DogsService } from './dogs.service';

@Controller('dogs')
@Roles('owner')
export class DogsController {
  constructor(private readonly dogsService: DogsService) {}

  @Get()
  findMine(@CurrentUser() user: AuthUser) {
    return this.dogsService.findMine(user.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDogDto) {
    return this.dogsService.create(user.id, dto);
  }

  @Patch(':dogId')
  update(
    @CurrentUser() user: AuthUser,
    @Param('dogId') dogId: string,
    @Body() dto: UpdateDogDto,
  ) {
    return this.dogsService.update(user.id, dogId, dto);
  }
}
