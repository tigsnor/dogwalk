import { Injectable } from '@nestjs/common';
import { AuthUser } from '../types/auth-user';

export type Dog = {
  id: string;
  ownerUserId: string;
  name: string;
  breed?: string;
  animalRegistrationNo?: string;
};

export type WalkRequestStatus = 'pending' | 'accepted' | 'cancelled';

export type WalkRequest = {
  id: string;
  ownerUserId: string;
  dogId: string;
  scheduledAt: string;
  requestNote?: string;
  status: WalkRequestStatus;
  walkerUserId?: string;
  walkSessionId?: string;
  createdAt: string;
  updatedAt: string;
};

export type WalkSessionStatus = 'accepted' | 'in_progress' | 'finished';

export type WalkSession = {
  id: string;
  walkRequestId: string;
  ownerUserId: string;
  walkerUserId: string;
  dogId: string;
  status: WalkSessionStatus;
  startedAt?: string;
  finishedAt?: string;
  distanceM?: number;
  durationSec?: number;
  avgSpeedKmh?: number;
  memo?: string;
  createdAt: string;
  updatedAt: string;
};

export type PaymentStatus = 'prepared' | 'confirmed' | 'refunded';

export type Payment = {
  id: string;
  ownerUserId: string;
  walkSessionId: string;
  provider: 'card' | 'easy-pay' | 'offline-pos';
  amountTotal: number;
  creditUsed: number;
  amountPaid: number;
  status: PaymentStatus;
  confirmedAt?: string;
  refundedAt?: string;
  refundReason?: string;
  settlementId?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreditLedgerType = 'earn' | 'spend' | 'expire' | 'adjust' | 'refund';

export type CreditLedgerEntry = {
  id: string;
  userId: string;
  type: CreditLedgerType;
  amount: number;
  memo?: string;
  createdAt: string;
};

export type Settlement = {
  id: string;
  walkerUserId: string;
  paymentIds: string[];
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  createdAt: string;
};

@Injectable()
export class AppStore {
  users = new Map<string, AuthUser>();
  usersByPhone = new Map<string, string>();
  refreshTokens = new Map<string, string>();
  dogs = new Map<string, Dog>();
  walkRequests = new Map<string, WalkRequest>();
  walkSessions = new Map<string, WalkSession>();

  payments = new Map<string, Payment>();
  creditBalances = new Map<string, number>();
  creditLedger: CreditLedgerEntry[] = [];
  settlements = new Map<string, Settlement>();
}
