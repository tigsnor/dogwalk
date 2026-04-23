import { Injectable } from '@nestjs/common';

@Injectable()
export class CreditsService {
  wallet() {
    return { balance: 0 };
  }
}
