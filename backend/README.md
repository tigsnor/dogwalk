# Backend Scaffold (NestJS)

DogWalk 백엔드의 실행 가능한 초기 구조입니다.

## 구현된 내용
- NestJS 부트스트랩 + 전역 prefix `api/v1`
- 전역 ValidationPipe + 전역 AuthGuard/RoleGuard
- 공개 엔드포인트(`@Public`) / 역할 제한(`@Roles`) 데코레이터
- 도메인 모듈 스켈레톤
  - auth, users, dogs, walks, payments, settlements, credits, admin
- SQL 초안 스키마 (`db/schema.sql`)
- 로컬 인프라 (`docker-compose.dev.yml`: Postgres, Redis)

## 실행 방법
## 환경변수 보안 요구사항
- `JWT_SECRET`, `JWT_REFRESH_SECRET`는 **필수**입니다.
- 기본 placeholder 값(`replace-with-...`, `change-me`)은 허용되지 않습니다.
- 두 시크릿 모두 최소 32자 이상이어야 합니다.
- 권장 생성 예시:

```bash
openssl rand -hex 32
```

```bash
cd backend
npm install
docker compose -f docker-compose.dev.yml up -d
npm run start:dev
```

## 현재 동작하는 핵심 API
- `POST /api/v1/auth/signup/owner`
- `POST /api/v1/auth/signup/walker`
- `POST /api/v1/auth/login` (JWT access/refresh 발급)
- `POST /api/v1/auth/refresh` (refresh 토큰 재발급)
- `GET /api/v1/users/me` (인증 필요)
- `GET /api/v1/dogs` (owner 전용)
- `POST /api/v1/dogs` (owner 전용)
- `PATCH /api/v1/dogs/:dogId` (owner 전용)
- `GET /api/v1/admin/walkers/pending` (admin 전용)
- `GET /api/v1/health` (공개)

## 인증 방식 (현재)
1. 회원가입
2. 로그인 후 `accessToken`/`refreshToken` 획득
3. 액세스 토큰 만료 시 `POST /api/v1/auth/refresh` 호출
4. 보호 API 호출 시 헤더 포함

```http
Authorization: Bearer <accessToken>
```

## 다음 단계
1. 인메모리 저장소(AppStore) → DB/ORM(Prisma/TypeORM) 전환
2. 산책/결제/정산/크레딧 비즈니스 로직 확장
