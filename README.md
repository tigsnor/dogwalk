# DogWalk

반려견 대리산책/셀프산책/크레딧/쇼핑몰 서비스를 위한 프로젝트입니다.

## 문서
- 요구사항: `docs/requirements.md`
- ERD: `docs/erd.md`
- API 초안: `docs/api-spec.md`
- 화면 목록: `docs/screen-list.md`
- Sprint 1 계획: `docs/plans/sprint-1-plan.md`
- 제품 백로그: `docs/plans/product-backlog.md`
- 이슈 템플릿: `docs/plans/issue-templates.md`

## 백엔드 실행 준비
백엔드 스캐폴드는 `backend/` 폴더에 있습니다.

```bash
cd backend
npm install
docker compose -f docker-compose.dev.yml up -d
npm run start:dev
```

헬스체크:
- `GET http://localhost:3000/api/v1/health`


## 프론트 프로토타입
`frontend/index.html` 파일을 브라우저에서 열면 UI 프로토타입을 확인할 수 있습니다.
