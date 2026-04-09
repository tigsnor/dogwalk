# DogWalk

반려견 대리산책/셀프산책/크레딧/쇼핑몰 서비스를 위한 프로젝트입니다.

## 문서
- 요구사항: `docs/requirements.md`
- ERD: `docs/erd.md`
- API 초안: `docs/api-spec.md`
- 화면 목록: `docs/screen-list.md`

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
