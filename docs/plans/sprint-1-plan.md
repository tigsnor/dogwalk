# Sprint 1 실행 계획 (2주)

## 목표
- 로컬 개발 환경 안정화
- 인증/권한 기반 API 골격 완성
- DB 마이그레이션 시작 가능한 구조 확정

## 일정
- 기간: 10 영업일 (2주)
- 산출물: 실행 가능한 백엔드, 인증 API, 사용자/반려견 기본 CRUD, 개발가이드

## 작업 항목

### A. 환경/인프라
- [ ] `.npmrc` 또는 사내 레지스트리 정책 정리
- [ ] `npm install` 성공 확인
- [ ] Docker 기반 Postgres/Redis 기동 확인
- [ ] `.env` 파일 로컬 템플릿 확정

**완료 조건(DoD)**
- `npm install` 성공
- `docker compose -f backend/docker-compose.dev.yml up -d` 성공
- `GET /api/v1/health` 200 응답

### B. 인증/권한
- [ ] 비밀번호 해시(bcrypt) 적용
- [ ] JWT access/refresh 토큰 발급
- [ ] AuthGuard + RoleGuard 구현
- [ ] owner/walker/admin 권한 매트릭스 반영

**완료 조건(DoD)**
- 로그인 성공 시 access/refresh 발급
- 보호 라우트 무권한 접근 401/403 처리

### C. 사용자/반려견 도메인
- [ ] `users/me` 실데이터 조회
- [ ] `dogs` 등록/조회/수정 API 구현
- [ ] 요청 DTO Validation 강화

**완료 조건(DoD)**
- owner 계정으로 반려견 등록 후 조회 가능
- 잘못된 입력에 대해 400 검증 에러 반환

### D. DB/마이그레이션
- [ ] ORM 선택 확정(Prisma 권장)
- [ ] users/dogs 기본 마이그레이션 작성
- [ ] seed 스크립트 추가(owner/walker/admin)

**완료 조건(DoD)**
- 초기화 명령 1회로 테이블 생성 + seed 완료

### E. 테스트/품질
- [ ] auth service unit test
- [ ] dogs service unit test
- [ ] health/auth E2E smoke test
- [ ] lint/typecheck 파이프라인 구성

**완료 조건(DoD)**
- 최소 테스트 커버리지 60%
- CI에서 lint/typecheck/test 통과

## 위험요소 / 대응
1. 사내 네트워크 정책으로 npm 설치 실패
   - 대응: 내부 레지스트리/캐시 mirror 설정
2. 결제/지도 외부 API 연동 지연
   - 대응: Sprint 1은 mock adapter로 차단
3. 권한 설계 변경 가능성
   - 대응: Role enum + 정책 문서화 후 확장
