import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentsService {
  prepare() {
    return { status: 'ready' };
  }
}
