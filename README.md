# Handoff: MICOZ — 럭셔리 보라톤 화장품 쇼핑몰

## Overview

MICOZ는 한방 발효 정수를 컨셉으로 한 가상의 럭셔리 화장품 브랜드입니다. 이 핸드오프는 다음을 포함한 풀 e커머스 디자인 시스템입니다:

- 메인 홈, 제품 리스트, 제품 상세, 장바구니, 결제(한국식 주문서), 주문 완료
- 브랜드 스토리, 마이페이지(주문 내역 · **취소/교환/반품** · 찜한 제품 등)
- 로그인 · 회원가입 (스플릿 비주얼 + 소셜 로그인)
- 모바일 뷰 (홈 / 제품 리스트 / 제품 상세 / 마이페이지)

브랜드 톤은 **"조용한 럭셔리"** — 모던 미니멀 + 한방 전통의 정제된 만남. Deep Plum (#2a1a3e) + Cream (#f5f1ea) + 보라색 그라디언트.

## About the Design Files

이 폴더에 포함된 HTML/JSX 파일들은 **디자인 레퍼런스**입니다 — 의도된 룩과 동작을 보여주는 프로토타입이지, 그대로 프로덕션에 복사할 코드가 아닙니다.

작업 목표는 **이 디자인을 대상 코드베이스의 기존 환경(React, Vue, Next.js 등)에 맞게 재구현**하는 것입니다. 코드베이스에 이미 컴포넌트 라이브러리·디자인 토큰 시스템이 있다면 그 패턴에 따라 구현해주세요. 없다면 가장 적절한 프레임워크를 선택해 구현하면 됩니다 (Next.js + Tailwind + shadcn/ui 권장).

## Fidelity

**High-fidelity (hifi)** — 컬러, 타이포그래피, 간격, 인터랙션이 모두 픽셀 수준으로 정의되어 있습니다. 가능한 그대로 재현해주세요. 단, 제품 이미지는 그라디언트 색상 블록으로 처리된 **플레이스홀더**이므로 실제 제품 사진으로 대체해야 합니다.

## 직접 동작하는 데모

- **`MICOZ-app.html`** — 메인 홈부터 시작하는 풀 동작 프로토타입. 브라우저에서 열면 바로 메인 홈 화면이 뜨고, 헤더 메뉴로 홈/제품/브랜드/마이페이지 이동, 가방 아이콘으로 장바구니, 사람 아이콘으로 로그인까지 모두 작동합니다.

## Design Tokens

### Colors

| Name | Hex | Usage |
|---|---|---|
| `--plum-900` | `#18102a` | 가장 깊은 배경, 푸터 |
| `--plum-800` | `#221638` | 헤더 다크 모드, 강조 텍스트 |
| `--plum-700` | `#2a1a3e` | **메인 컬러** — 버튼, 헤딩, 액센트 |
| `--plum-600` | `#3a2552` | 호버 상태 |
| `--plum-500` | `#4d3470` | 보조 텍스트, 라벨 |
| `--plum-400` | `#6b4d8f` | 미디엄 액센트 |
| `--plum-300` | `#9a7fb8` | 라이트 액센트 |
| `--plum-200` | `#c4b0d8` | 페일 라일락 |
| `--plum-100` | `#e8d8f0` | 배지 배경, 라이트 배경 |
| `--plum-50` | `#f5edf7` | 페이지 헤더 그라디언트 |
| `--cream` | `#f5f1ea` | **메인 배경** |
| `--cream-2` | `#ede7dc` | 보조 배경 |
| `--paper` | `#faf7f2` | 카드 배경 |
| `--ink` | `#1a1424` | 본문 텍스트 |
| `--muted` | `#6b5d72` | 보조 텍스트 |
| `--line` | `rgba(42, 26, 62, 0.12)` | 구분선 (얇은) |
| `--line-strong` | `rgba(42, 26, 62, 0.22)` | 구분선 (강한) |
| `--gold` | `#b89968` | VIP/프리미엄 액센트 |
| Sale Red | `#c14b3a` | 할인율, 최종 결제금액 |

### Typography

```css
--serif:    "Noto Serif KR", "Spectral", serif;   /* 헤드라인, 한글 디스플레이 */
--serif-en: "Spectral", "Noto Serif KR", serif;   /* 영문 액센트, 가격, 이탤릭 */
--sans:     "Pretendard", -apple-system, sans-serif; /* 본문, UI */
```

**스케일 (데스크탑)**

| 용도 | font-size | weight | line-height | letter-spacing |
|---|---|---|---|---|
| 히어로 H1 | 96px | 300 | 1 | -0.02em |
| 페이지 H1 | 64–76px | 300 | 1.1 | -0.02em |
| 섹션 H2 | 44–56px | 300 | 1.2 | -0.01em |
| 상세 H3 | 26–36px | 400 | 1.3 | -0.01em |
| 본문 (serif) | 16–19px | 300 | 1.9 | normal |
| 본문 (sans) | 13–14px | 400 | 1.7 | 0.05em |
| 영문 캡스 라벨 | 10–11px | 400 | 1 | 0.3–0.5em |
| 가격 | 14–28px (serif-en) | 400–500 | 1 | normal |

**모바일** — 히어로 56px, H1 32–40px, 그 외 비례적으로 축소.

### Spacing

- 페이지 좌우 패딩: **56px** (데스크탑), **24px** (모바일)
- 섹션 세로 패딩: **80–160px** (데스크탑)
- 그리드 갭: **24–32px** (제품 카드), **60–80px** (좌우 컬럼)
- 컴포넌트 내부 패딩: **16–28px**

### Radii & borders

- **모든 코너는 0 (직각).** 럭셔리 톤의 핵심 — 카드, 버튼, 인풋 모두 직각. 유일한 예외는 카운터 점 표시(원형)와 토스트.
- 보더: 항상 1px solid `var(--line)` 또는 `var(--line-strong)`.

### Shadows

거의 사용하지 않음 (조용한 럭셔리 톤). 사용처:
- 카트 드로어: `-20px 0 60px rgba(20,12,30,0.15)`
- 보틀 카드: `0 20px 40px -10px rgba(0,0,0,0.35)` (그라디언트 안쪽)
- 토스트: `0 12px 40px rgba(42, 26, 62, 0.3)`

## Screens / Views

### 1. 메인 홈 (`HomePage` in `screens-desktop.jsx`)

**Purpose** — 브랜드의 첫 인상. 시그니처 컬렉션 3종 노출, 베스트셀러 4개, 야간 의식(Night Ritual) 배너.

**Layout (1440px width)**
1. **HERO** (`height: calc(100vh - 80px)`, min 640px) — 보라 그라디언트 배경, 좌측 1.1fr 텍스트(98px 디스플레이 + 본문 + CTA 2개), 우측 1fr 보틀, 하단 인디케이터 3개. 6.5초마다 자동 슬라이드. 페이드인 애니메이션.
2. **PHILOSOPHY** (160px 상하 패딩) — 가운데 정렬, "PHILOSOPHY" 라벨 + 52px 헤드라인 + 본문.
3. **COLLECTIONS** — 3컬럼 그리드, 각 540px 높이 그라디언트 카드, 호버 시 베일 진해짐.
4. **BESTSELLERS** — 4컬럼 제품 카드 그리드.
5. **NIGHT RITUAL** — Plum-900 배경, 2컬럼 (좌측 텍스트 + 우측 4컷 그리드).

### 2. 제품 리스트 (`ProductsPage`)

**Layout** — 페이지 헤더(라이트 그라디언트) + 사이드바(220px) + 메인 (3컬럼 카드 그리드). 카테고리 필터, Concern 필터, 정렬 셀렉트.

### 3. 제품 상세 (`DetailPage`)

**Layout**
1. Breadcrumb
2. 2컬럼 hero (1.05fr 이미지 / 1fr 정보) — 720px 보틀 + 썸네일 4개 / 라벨 + 56px 이름 + 영문 이탤릭 + 설명 + 가격 + 옵션 + 수량 + CTA
3. 탭 (상세 설명 / 성분 / 사용법 / 리뷰)
4. 함께 추천하는 제품 4종

**옵션 선택** — `OptionPicker` (`primitives.jsx`) — 라디오 + 가격 표시 행. 선택 시 보더 색 변경.

### 4. 장바구니 페이지 (`CartPage` in `screens-auth-cart.jsx`)

**Layout** — 페이지 헤더 + 2컬럼 (1.5fr 상품 테이블 / 1fr Plum-900 다크 사이드바). 사이드바엔 무료배송 진행 게이지, 쿠폰 입력, 합계, 결제 버튼.

**빈 상태** — 가방 아이콘 + 카피 + "제품 둘러보기" CTA.

### 5. 결제 (`CheckoutPage` in `screens-desktop2.jsx`) — **한국식 주문서**

**Layout** — 가운데 정렬 페이지 헤더 + 2컬럼 (1fr 폼 / 380px 스티키 사이드바).

**섹션 (모두 `FormSection` 사용, 보더 하단 2px solid plum-800)**
1. **주문자 정보** — 이름, 휴대폰 3분할, 이메일
2. **배송지 정보** — 보라 보더 카드 + 기본 배송지 배지 + 우측 "배송지 관리" 링크
3. **배송 요청 사항** — 셀렉트 (커스텀 화살표 SVG)
4. **주문 상품** — 정가 취소선 + 할인율(빨강) + 적립 포인트 컬럼
5. **쿠폰 및 포인트** — 쿠폰 셀렉트 + 포인트 인풋 + "전액 사용" 버튼
6. **결제 수단** — 4×3 그리드 (신용카드 · 가상계좌 · 실시간 계좌이체 · 휴대폰 · 페이코 · 카카오페이 · 삼성페이 · TOSS · NAVER pay · M pay · 스마일페이 · 포인트 결제). 신용카드 선택 시 카드 종류 + 할부 개월 펼침.

**사이드바**
- Plum-900 헤더 "PAYMENT"
- 주문 금액 / 배송비 / 총 할인 금액 (빨강 액센트)
- 총 결제 예상 금액 (28px, **빨강 #c14b3a**, 럭셔리 디자인이지만 한국 e커머스 관습 따름)
- 적립 예상 포인트
- 약관 동의 2개 (필수) + 전체 동의
- 결제하기 버튼 — 필수 약관 미동의 시 비활성화 (line-strong 배경)

### 6. 주문 완료 (`OrderConfirm`)

가운데 정렬, 체크 아이콘(plum-100 원형) + 카피 + 주문번호 + CTA 2개.

### 7. 로그인 · 회원가입 (`LoginPage` / `SignupPage` in `screens-auth-cart.jsx`)

**스플릿 레이아웃** — 좌측 비주얼 패널(보라 그라디언트 + 브랜드 카피) + 우측 폼. 모든 인풋은 **언더라인 스타일** (`borderBottom`만, 다른 보더 없음, 포커스 시 plum-700).

**로그인** — 이메일 + 비밀번호 + 로그인 유지 체크 + 비밀번호 찾기 + 메인 CTA + 소셜 3개 (카카오 #fee500, 네이버 #03c75a, 애플 #1a1424).

**회원가입** — 이름, 이메일, 휴대폰(인증번호 전송), 비밀번호, 비밀번호 확인 + 약관 박스(전체 동의 + 필수 2개 + 선택 1개) + 가입 CTA. 가입 완료 시 ₩5,000 웰컴 쿠폰 안내.

### 8. 브랜드 스토리 (`StoryPage`)

- 풀스크린 보라 히어로 (200 weight 92px 헤드라인 "깊은 밤이 / 피워낸 / 보랏빛 의식")
- 3개 섹션 (Origin / Craft / Ritual) — 좌우 교차 2컬럼, 텍스트 + 그라디언트 이미지
- Plum-900 숫자 섹션 (28일 / 7가지 / 96% / 2018)

### 9. 마이페이지 (`MyPage`)

- 페이지 헤더 (그라디언트) + 인사 카피
- 2컬럼 (240px 사이드바 / 메인)
- 사이드바: Plum-900 포인트 카드 + 메뉴 리스트 (주문 내역 / **취소·교환·반품** / 찜한 제품 / 내 리뷰 / 배송지 / 회원 정보 / 1:1 문의)
- 탭별 콘텐츠 — `orders`, `returns`, `wishlist` 구현됨; 나머지는 placeholder

### 10. 취소 · 교환 · 반품 (`ReturnsTab` in `screens-desktop2.jsx`)

**서브탭**: 신청하기 / 신청 내역(배지)

**신청하기**
- 4단계 프로세스 strip (Paper 배경, 컬럼 구분선)
- 신청 가능한 주문 카드 — 주문번호 + 수령일 + **반품 기한 남은 일수** 배지 (7일 이하 빨강). 보틀 썸네일 + 정보 + 금액 + "반품 신청" / "교환 신청" 버튼.
- 안내 박스 (왕복 배송비, 한정판 제외 등)

**신청 내역**
- 환불 완료 카드 — 녹색 배지 + 환불 금액 + 완료일
- 교환 진행중 카드 — 앰버 배지 + 4단계 진행 바 + 회수 송장번호 + 배송 조회 링크

### 11. 모바일 (`screens-mobile.jsx`)

- 402×874 (iPhone 14 Pro). 상단 sticky 헤더 (블러 배경) + 하단 sticky 탭바.
- 홈: 560px 히어로 + Philosophy + 컬렉션 카드 3개 + 베스트셀러 2컬럼.
- 상세: 460px 히어로 그라디언트(투명 헤더) + 상품 정보 + 옵션 + 하단 sticky CTA.
- 마이페이지: 포인트 카드 + 4분할 통계 + 리스트 메뉴.

## Components / Primitives (`primitives.jsx`)

| Component | Purpose |
|---|---|
| `MicozLogo` | 영문 캡스 로고 — `letter-spacing: 0.32em` |
| `Bottle` | 그라디언트 + SVG 보틀 실루엣 (tall/jar/wide/drop). 모든 제품 이미지 자리. |
| `PrimaryBtn` | 다크/아웃라인, sm/md/lg. 직각, uppercase, 자간 0.18em. |
| `ThinLink` | 가는 밑줄 링크, uppercase. |
| `OptionPicker` | 옵션 라디오 + 가격 행. |
| `Counter` | -/숫자/+ 카운터. |
| `FadeIn` | 마운트 시 페이드인 (8s ease). |
| `PageFade` | 페이지 전환 페이드 (250ms). |
| `Icon.*` | search, bag, user, heart, arrow, plus, close, menu, check, back. SVG, stroke 1.4. |
| `ProductCard` | 보틀 + 라벨 + 이름 + 가격. 호버 시 보틀 1.04 줌 + 우하단 + 버튼 페이드인. |
| `Toast` | 하단 고정 알림, 2.4초 자동 닫힘. |

## Interactions & Behavior

### 페이지 라우팅
- 상태 변수 하나 (`page`) — `'home' | 'products' | 'detail' | 'cart' | 'checkout' | 'confirm' | 'story' | 'mypage' | 'login' | 'signup'`
- 페이지 변경 시 `PageFade`가 180ms 페이드 아웃 → 250ms 페이드 인 + 스크롤 최상단
- 헤더 좌측: 홈 / 제품 / 브랜드 / 마이페이지
- 헤더 우측: 검색(미구현) / 사람 아이콘(→ login) / 가방 아이콘(→ cart 페이지)

### 장바구니
- `cart` 배열 — `{ cartId, product, opt, qty }`. `cartId = ${productId}-${optionId}`
- 추가 시 동일 cartId 있으면 qty 증가, 없으면 push
- 토스트 노출 (2.4초)
- `결제하기` → checkout 페이지로 이동

### 결제 흐름
- 필수 약관 2개 모두 체크해야 결제하기 활성화
- 결제하기 클릭 → cart 비움 + `confirm` 페이지

### 히어로 슬라이드
- 6.5초마다 다음 컬렉션. 인디케이터 클릭으로 즉시 이동. 페이드 트랜지션 (1.6s).

### 호버 (제품 카드)
- 보틀이 1.04배 줌 (0.8s cubic-bezier)
- 우하단 `+` 버튼이 8px 아래에서 페이드인 (0.3s)

## State Management

```js
// 최소 상태 (DesktopApp)
const [page, setPage] = useState('home');
const [activeProduct, setActiveProduct] = useState(null);
const [cart, setCart] = useState([]);  // [{ cartId, product, opt, qty }]
const [cartOpen, setCartOpen] = useState(false); // (현재는 cart 페이지 사용 중이라 미사용)
const [toast, setToast] = useState({ show: false, message: '' });
```

프로덕션 권장:
- **라우팅**: Next.js App Router 또는 React Router
- **장바구니 영속**: localStorage 또는 서버 + 옵티미스틱 업데이트
- **인증**: NextAuth.js / Clerk
- **결제**: 토스페이먼츠 / 아임포트 SDK 연동

## 데이터 모델 (`data.jsx`)

```ts
type Product = {
  id: string;
  name: string;       // 한글명
  nameEn: string;     // 영문 (보틀 라벨)
  line: string;       // 컬렉션 라인
  category: string;
  desc: string;
  price: number;
  options: { id: string; label: string; price: number }[];
  grad: string;       // CSS gradient string (보틀 색)
  accent: string;     // 컬렉션 액센트 색
  badge?: 'BEST' | 'NEW' | 'LIMITED';
};
```

8개 더미 제품 포함 (비온, 제린, 루안, 단아, 여원, 소단, 청아, 아담).

## Tweakable Controls

원본 디자인 캔버스에는 3개의 디자인 검토 컨트롤이 있었습니다(이 핸드오프엔 미포함). 프로덕션에선 **Deep Plum + Editorial(Noto Serif KR) + Hushed (현재 스케일)** 조합이 기본입니다.

## Assets

이 핸드오프엔 실제 제품 사진이나 브랜드 로고 자산이 포함되어 있지 않습니다. 모든 제품 이미지는 **CSS 그라디언트 색상 블록**으로 처리된 플레이스홀더입니다(`Bottle` 컴포넌트 참고). 프로덕션에선:

1. 실제 제품 사진을 받아 `Bottle` 자리에 `<img>`로 교체
2. 모델 컷, 분위기 컷 자리도 그라디언트 박스로만 표시 — 실제 이미지 필요
3. 폰트는 Google Fonts CDN 사용 (Noto Serif KR, Spectral) + Pretendard JSDelivr CDN. 프로덕션에선 셀프 호스팅 권장.

## Files

```
design_handoff_micoz/
├── README.md                      ← 이 문서
├── MICOZ-app.html                 ← 메인 홈부터 시작하는 동작 프로토타입
├── app-live.jsx                   ← 라우팅 + 장바구니 상태 (진입점)
├── data.jsx                       ← 제품/카테고리/컬렉션 데이터
├── primitives.jsx                 ← 공유 컴포넌트 (로고, 보틀, 버튼, 아이콘 등)
├── screens-desktop.jsx            ← Header, Footer, Home, Products, Detail
├── screens-desktop2.jsx           ← Checkout, Confirm, Story, MyPage, Returns
└── screens-auth-cart.jsx          ← LoginPage, SignupPage, CartPage
```

## 시작 가이드 (Next.js + Tailwind 권장 경로)

1. `npx create-next-app@latest micoz --typescript --tailwind --app`
2. `tailwind.config.ts`에 위 컬러 토큰을 `theme.extend.colors`로 추가
3. `app/layout.tsx`에 Google Fonts (Noto Serif KR, Spectral) + Pretendard 로드
4. `app/page.tsx` — `HomePage` 컴포넌트 재구현 (Hero 슬라이드 + 컬렉션 + 베스트셀러)
5. 라우트별 파일 — `app/products/page.tsx`, `app/products/[id]/page.tsx`, `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/login/page.tsx`, `app/signup/page.tsx`, `app/mypage/page.tsx`, `app/story/page.tsx`
6. 공통 컴포넌트 — `components/Bottle.tsx`, `components/ProductCard.tsx`, `components/PrimaryBtn.tsx`, `components/Header.tsx`, `components/Footer.tsx`
7. 장바구니 상태는 Zustand 또는 Context — `useCart()` 훅
8. 결제 API는 토스페이먼츠 또는 아임포트로 연동

핵심 디자인 원칙:
- **직각** (border-radius 0)
- **세리프 헤드라인 + Pretendard 본문**
- **여백을 풍부하게** — 섹션 패딩 80–160px, 페이지 좌우 56px
- **이탤릭 강조 절제** — em 태그로 영문만 (`<em style="font-style: italic">JERIN</em>`)
- **uppercase 캡스 라벨** — 0.3–0.5em 자간, 11px
