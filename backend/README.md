# Backend Skeleton

이 폴더는 실제 서비스 구현 전 백엔드 구조를 합의하기 위한 최소 스켈레톤이다.

## 추천 구조 (NestJS 스타일 예시)
- `src/auth` 인증
- `src/users` 회원/프로필
- `src/dogs` 반려견
- `src/walks` 요청/세션/위치
- `src/payments` 결제/환불
- `src/settlements` 정산
- `src/credits` 크레딧
- `src/admin` 관리자 기능

## 다음 단계
1. 프레임워크 생성 후 모듈별 DTO/Entity 정의
2. DB 마이그레이션 작성
3. 결제사 연동 샌드박스 테스트
4. 위치 WebSocket 부하 테스트
