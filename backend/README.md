# Backend Scaffold (NestJS)

DogWalk 백엔드의 실행 가능한 초기 구조입니다.

## 구현된 내용
- NestJS 부트스트랩 + 전역 prefix `api/v1`
- ValidationPipe 설정
- 도메인 모듈 스켈레톤
  - auth, users, dogs, walks, payments, settlements, credits, admin
- 기본 헬스체크 API
  - `GET /api/v1/health`
- SQL 초안 스키마
  - `db/schema.sql`
- 로컬 인프라
  - `docker-compose.dev.yml` (Postgres, Redis)

## 실행 방법
```bash
cd backend
npm install
docker compose -f docker-compose.dev.yml up -d
npm run start:dev
```

## API 예시
- `POST /api/v1/auth/signup/owner`
- `POST /api/v1/auth/signup/walker`
- `POST /api/v1/auth/login`
- `GET /api/v1/users/me`
- `GET /api/v1/dogs`
- `GET /api/v1/walk-requests`
- `POST /api/v1/payments/prepare`
- `GET /api/v1/settlements/me`
- `GET /api/v1/credits/wallet`
- `GET /api/v1/admin/walkers/pending`

## 다음 단계
1. DB ORM(Prisma/TypeORM) 도입 및 마이그레이션 자동화
2. JWT 인증/인가 가드 및 role-based access 적용
3. 결제사 연동 어댑터 구현
4. WebSocket 위치 스트리밍 구현
