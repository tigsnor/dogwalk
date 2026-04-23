import { Injectable } from '@nestjs/common';
import { AuthUser } from '../types/auth-user';

export type Dog = {
  id: string;
  ownerUserId: string;
  name: string;
  breed?: string;
  animalRegistrationNo?: string;
};

@Injectable()
export class AppStore {
  users = new Map<string, AuthUser>();
  usersByPhone = new Map<string, string>();
  refreshTokens = new Map<string, string>();
  dogs = new Map<string, Dog>();
}
