# Backend Skeleton

NestJS 기반의 DogWalk 백엔드 초기 스캐폴드입니다.

## 포함 내용
- NestJS 엔트리포인트 (`src/main.ts`)
- 기본 모듈/헬스체크 컨트롤러 (`/api/v1/health`)
- TypeScript 빌드 설정 (`tsconfig.json`)
- 개발용 인프라 (`docker-compose.dev.yml` - Postgres/Redis)
- 환경 변수 샘플 (`.env.example`)

## 빠른 시작
1. 의존성 설치
   - `npm install`
2. 로컬 인프라 실행
   - `docker compose -f docker-compose.dev.yml up -d`
3. 개발 서버 실행
   - `npm run start:dev`

## 현재 상태
- 패키지 설치가 가능한 환경에서는 즉시 실행 가능하도록 `package.json`을 구성했습니다.
- 실제 도메인 모듈(auth, users, dogs, walks, payments, settlements, credits, admin)은 다음 단계에서 추가합니다.
