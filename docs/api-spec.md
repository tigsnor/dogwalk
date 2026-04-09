# DogWalk API 초안 (REST + WebSocket)

## 1. 공통 규칙
- Base URL: `/api/v1`
- Auth: JWT Bearer
- Role: owner / walker / admin
- 시간: ISO-8601 UTC 저장

## 2. 인증
- `POST /auth/signup/owner` : 견주 가입
- `POST /auth/signup/walker` : 워커 가입
- `POST /auth/login` : 로그인
- `POST /auth/refresh` : 토큰 재발급

## 3. 반려견
- `GET /dogs` : 내 반려견 목록
- `POST /dogs` : 반려견 등록
- `PATCH /dogs/{dogId}` : 반려견 수정
- `POST /dogs/{dogId}/media` : 반려견 사진 업로드

## 4. 대리산책 요청/세션
- `POST /walk-requests` : 대리산책 요청 생성
- `GET /walk-requests` : 요청 목록 조회
- `GET /walk-requests/{id}` : 요청 상세
- `POST /walk-requests/{id}/cancel` : 요청 취소

- `POST /walk-requests/{id}/accept` : (walker) 요청 수락
- `POST /walk-sessions/{id}/start` : 산책 시작
- `POST /walk-sessions/{id}/finish` : 산책 종료
- `GET /walk-sessions/{id}` : 세션 상세/리포트
- `POST /walk-sessions/{id}/media` : 산책 사진 업로드

## 5. 셀프 산책
- `POST /self-walks/start` : 셀프 산책 시작
- `POST /self-walks/{sessionId}/finish` : 셀프 산책 종료
- `GET /self-walks/history` : 셀프 산책 이력

## 6. 위치 추적
- `WS /ws/locations`
  - walker/client가 `sessionId`, `lat`, `lng`, `accuracy`, `timestamp` 송신
  - owner는 동일 session 구독으로 실시간 수신
- `GET /walk-sessions/{id}/locations` : 히스토리 위치 조회

## 7. 결제/환불
- `POST /payments/prepare` : 결제 준비
- `POST /payments/confirm` : 결제 승인
- `GET /payments/{paymentId}` : 결제 상태 조회
- `POST /payments/{paymentId}/refund` : 환불 요청(관리자)

## 8. 정산
- `GET /settlements/me` : 워커 내 정산내역
- `POST /admin/settlements/run` : 정산 배치 실행(관리자)
- `GET /admin/settlements` : 정산 목록(관리자)

## 9. 크레딧
- `GET /credits/wallet` : 잔액 조회
- `GET /credits/ledger` : 원장 조회
- `POST /admin/credits/adjust` : 수동 조정(관리자)

## 10. 관리자
- `GET /admin/walkers/pending` : 워커 심사 대기 목록
- `POST /admin/walkers/{userId}/approve` : 승인
- `POST /admin/walkers/{userId}/reject` : 반려
- `GET /admin/operations/live-sessions` : 실시간 운영 모니터링
