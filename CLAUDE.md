# API 연동 (백엔드 REST 연결) — 쇼핑몰 단

관리자 API 연동은 이번 트랙 범위 아님. 쇼핑몰만.

## 계약 출처
- docs/micoz_api.md = 사용자 API 명세. 엔드포인트·DTO·ErrorCode의 진실의 기준. 매 작업 전 읽는다.
- docs/micoz_schema.sql = DB 스키마.
- 충돌 시 API 명세 우선(프론트 타입/enum을 API에 맞춤). 명세의 "(추정)" 필드는 불확실로 간주, 가능하면 실제 DTO로 검증·보고.

## 공통 규약 (반드시)
- 베이스 http://localhost:8080. Vite 프록시 /api → :8080.
- 응답 봉투 ApiResponse<T> { code, message, data? }.
- **성공/실패는 HTTP status가 아니라 바디 `code`로 분기**(200인데 code≠SUCCESS로 비즈니스 오류 오는 케이스 존재 — 가장 중요한 함정). code≠"SUCCESS"면 {code,message} 타입드 에러로 throw → React Query error.
- 페이징 PageResponse<T> { content, page, size, totalElements, totalPages }. 파라미터 page(0-based)/size/sort.

## 인증 / 세션
- 토큰: localStorage에 access+refresh.
- axios: 요청 Bearer 주입 / 응답 envelope 언랩 + code 분기 / 만료 시 refresh 1회 재시도 / 재사용 탐지 시 강제 로그아웃.
- AuthContext: login/logout/refresh/현재 사용자(GET /me). mock current-user 대체.
- 라우트 가드(인증 필요): /checkout, mypage, orders, returns, reviews, points, coupons, inquiries, favorites.
- 공개(무인증): /, /products, /products/:id, /story, 카테고리·상품·배너·상품리뷰. /cart는 게스트 허용(아래).

## 타입 전략 — 어댑터(매퍼) 레이어
- api/types.ts: 명세서 DTO 그대로(productSeq/productName 등).
- 매퍼: DTO → 프론트 뷰모델(id/name 등). 컴포넌트는 기존 뷰모델 타입 유지·무수정.
- 쿼리 훅이 fetch→map→뷰모델 반환. API 형태는 매퍼 한 곳에 격리.
- DTO·매퍼는 각 도메인 Phase에서 해당 도메인 것만 정의(41개 일괄 X).

## 장바구니 — 게스트 + 서버 이중 모드
- useCart() 한 인터페이스 뒤: 비로그인=로컬(CartContext/localStorage), 로그인=서버 쿼리(/cart) 자동 선택. UI는 모드 무관.
- 로그인 시 병합: 로컬 항목을 POST /cart로 리플레이(서버가 수량 합산) → 로컬 비우고 카트 쿼리 무효화. 병합 중 품절 항목은 건너뛰고 안내.
- 로그인 벽은 /checkout(주문 인증). /cart는 게스트 로컬 표시.
- CartContext 삭제 금지 — 게스트 스토어로 유지.

## 상태 처리 (마이그레이션에서 미뤄둔 것 — 여기서 추가)
- 쿼리 기반 화면마다 로딩(스켈레톤/스피너)·에러(재시도 + 명세 message)·빈 상태.
- ErrorCode → 한글 친화 메시지 매핑(공용 유틸).

## enum 정렬 (Phase 0에서 API에 맞춤)
- InquiryType PRODUCT/ORDER/DELIVERY/RETURN/ETC · CouponType PERCENT/FIXED · ReturnReasonType CHANGE_OF_MIND/DEFECT/WRONG_DELIVERY/ETC · ReturnStatus REQUESTED/APPROVED/COLLECTED/INSPECTED/COMPLETED/REJECTED · OrderStatus 명세 값(SHIPPED 등) · PaymentType 사용자 CARD/KAKAO/NAVER.
- enum은 admin 공유 → 값 변경 시 admin mock 데이터도 동기화(표시 유지, admin API 아님).

## 주문 흐름 (서버)
- 2단계: POST /orders(생성, clientAmount=서버 재계산과 일치 필요) → POST /orders/{seq}/pay(모의PG, 거절카드 4000-0000-0000-0002).
- order_no는 서버 발급(MZ-yyMMdd-NNNNN). 클라 generateOrderNo 폐기.
- 에러 처리: ORDER_AMOUNT_MISMATCH / PRODUCT_SOLD_OUT / PAY_APPROVAL_FAILED.

## Phase 순서
0. 계약 정렬: enum/라벨 API 정렬 + 공통 타입(ApiResponse/PageResponse/ErrorCode). 훅·삭제 없음.
1. API 기반: Vite 프록시 + axios(code 분기·refresh 로테이션) + React Query + AuthContext + 라우트 가드 + auth 4종(login/signup/find-id/reset-password) 연동.
2. 공개 카탈로그: categories/products/detail/featured/banners/상품리뷰 → 훅 교체 + 로딩/에러/빈 상태.
3. 카트+찜: 이중 모드 카트 + 로그인 병합 + 찜.
4. 체크아웃+주문: 2단계 결제 + 내 주문 목록/상세 + 배송지 CRUD.
5. mypage 잔여: 프로필/비번변경/반품/리뷰/포인트/쿠폰/문의.
6. 마무리: 낙관적 업데이트(카트/찜)·에러 UX 통일·obsolete mock 정리(generateOrderNo·mock current-user·API화 도메인 mock 데이터). 스키마 스캐폴딩 타입은 유지.

## 작업 규율 (마이그레이션과 동일)
- 단계별 진행, 시키지 않은 범위 미리 X.
- 명세와 지시 충돌 시 명세 우선 + 보고. (추정) 필드는 검증/보고.
- 각 Phase 후 tsc --noEmit + build 통과 + 영향 라우트 동작 확인 보고.
- 변이는 실제 엔드포인트로(목업 변이 제거). enum/공유 코드 변경 시 admin 화면 렌더 깨짐 0 확인.