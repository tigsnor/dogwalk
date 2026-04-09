# 이슈 템플릿 (복붙용)

## [BE] Auth JWT 구현
**목표**
- access/refresh 토큰 발급 및 검증

**작업**
- [ ] 로그인 시 토큰 발급
- [ ] refresh endpoint 구현
- [ ] AuthGuard 적용
- [ ] RoleGuard 적용

**완료조건**
- [ ] 보호 API 401/403 동작 확인
- [ ] unit test 추가

---

## [BE] Dogs CRUD 구현
**목표**
- 반려견 등록/조회/수정 API 완성

**작업**
- [ ] POST /dogs
- [ ] GET /dogs
- [ ] PATCH /dogs/:id
- [ ] DTO validation

**완료조건**
- [ ] owner 계정 E2E 시나리오 통과
- [ ] 잘못된 입력 400 반환

---

## [OPS] 로컬 실행 안정화
**목표**
- 신규 개발자가 10분 안에 로컬 실행

**작업**
- [ ] README 최신화
- [ ] .env.example 검증
- [ ] docker compose 실행 검증

**완료조건**
- [ ] 온보딩 체크리스트 완료
