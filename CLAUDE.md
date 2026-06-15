# MICOZ 프로젝트

Claude Design으로 만든 HTML(쇼핑몰 + 관리자)을 작동하는 React 프로젝트로 마이그레이션한다.

## 원본 구조 (현재 상태)
- 빌드 단계 없음. React 18 + ReactDOM + Babel Standalone을 CDN으로 로드, `.jsx`를 브라우저에서 직접 트랜스파일.
- HTML 3개는 얇은 진입점일 뿐, 실제 UI는 전부 `.jsx`에 **인라인 `style={{}}` + CSS 변수(`var(--plum-700)`)** 로 들어 있다.
  - `index.html` — 쇼핑몰/관리자 진입 선택 랜딩(자체 `<style>` CSS)
  - `MICOZ-app.html` — 쇼핑몰. `:root` 토큰 + 모바일 미디어쿼리 + `shop/*.jsx` 9개 로드
  - `MICOZ-admin.html` — 관리자. `--ad-*` 토큰 + `admin/*.jsx` 5개 로드
- 라우터 없음. `useState('home' | 'dashboard' ...)` 단일 문자열 + 조건부 렌더링으로 화면 전환.
- `design_bundle/`은 과거 스냅샷(중복). 마이그레이션 대상 아님 — 건드리지 말 것.

## 스택
- Vite + React + TypeScript
- 라우팅: react-router (수동 정의). 파일기반 라우팅 플러그인 사용 금지.
- 서버 상태(API 연동 단계): TanStack Query 예정
- 주석은 한국어로 작성

## 폴더 구조 (확정 — 임의 변경 금지)
```
src/
  main.tsx
  App.tsx                  # 라우터 루트
  styles/ tokens.css, global.css
  lib/ data/, format.ts
  components/
    ui/                    # shop·admin 공용 primitive (Button, Input, Modal, Toast)
    shop/                  # ProductCard, Bottle, OptionPicker ...
    admin/                 # Sidebar, Topbar, DataTable, Stat, charts ...
  routes/
    shop/  ShopLayout.tsx + home/products/product/cart/checkout/order-confirm/story/mypage/auth
    admin/ AdminLayout.tsx + dashboard/members/categories/products/orders/returns/inquiries/settings
```

## 라우팅 규칙
- react-router 수동 정의. 동적 경로는 :id 문법 (예: /product/:id).
- ShopLayout / AdminLayout이 `<Outlet/>`으로 자식 라우트를 감싼다.
- 쇼핑몰은 "/", 관리자는 "/admin" 하위.
- (auth)는 폴더 묶음 이름일 뿐 라우팅엔 영향 없음.

### 라우트 매핑 (원본 page state → URL)
- 쇼핑몰: `/` `/products` `/products/:id` `/cart` `/checkout` `/order/complete` `/story` `/mypage` · auth `/login` `/signup` `/find`
- 관리자: `/admin`(dashboard) `/admin/members` `/admin/categories` `/admin/products` `/admin/orders` `/admin/returns` `/admin/inquiries` `/admin/settings/banner` `/admin/settings/shipping` `/admin/settings/team`
- 쇼핑몰은 데스크탑/모바일 별도 컴포넌트가 존재(`MobileHome` 등). 768px 분기 유지.

## 스타일·토큰 규칙
- 컴포넌트 스타일은 원본의 인라인 `style={{}}` 방식을 그대로 유지. Tailwind/CSS Modules/styled-components로 전환 금지.
- 색·폰트·간격은 CSS 변수(`var(--plum-700)` 등) 참조. 하드코딩 금지.
- 원본의 `<style>` CSS, `:root` 변수 선언, 모바일 미디어쿼리는 `styles/tokens.css`·`global.css`로 이관(폐기 금지). 변수명 보존.
- 인라인으로 불가능한 것(`:hover/:focus/:active`, `@media`, `@keyframes` 애니메이션, `::placeholder`, `::-webkit-scrollbar`)만 className + CSS로 처리. 해당 요소에만 최소로 적용.
- 차트·아이콘은 원본대로 외부 라이브러리 없이 SVG 직접 구현 유지.
- 반복되는 스타일 객체는 공유 컴포넌트 안에서 한 번만 정의해 재사용. 별도 CSS 시스템 도입 금지.
- `global.css`는 reset + 토큰 적용 정도만.

### 토큰 출처
- 쇼핑몰 팔레트: 플럼 `--plum-900`(#2d2347)~`--plum-50`(#f5edf7), 중립 `--cream`(#fafafa)/`--ink`(#1a1424)/`--muted`(#6b5d72)/`--gold`(#b89968). 폰트 `--serif`(Noto Serif KR/Spectral)·`--sans`(Pretendard).
- 관리자 팔레트: `--ad-paper`(#f6f3ec) 등 따뜻한 종이톤 + 더 진한 플럼(#18102a~) + `--mono`(JetBrains Mono). 쇼핑몰과 별도 변수군이므로 합치지 말 것.

## 컴포넌트 규칙
- 2곳 이상에서 쓰는 것만 components/로. 한 페이지에서만 쓰는 건 해당 route 폴더에 colocate.
- shop·admin 양쪽이 쓰는 진짜 공용은 components/ui/.
- 중복 컴포넌트 새로 만들지 말 것. 기존 것 재사용.

### 주요 공용 컴포넌트 (원본 기준)
- 쇼핑몰: `DesktopHeader`/`MobileHeader`/`MobileTabBar`, `DesktopFooter`, `ProductCard`, `Bottle`, `PrimaryBtn`/`ThinLink`, `OptionPicker`/`Counter`, `Toast`, `FadeIn`/`PageFade`, `CartDrawer`, 각종 `*Modal`, `Icon`(SVG).
- 관리자: `Sidebar`/`Topbar`, `DataTable`/`Pagination`, `FilterBar`/`FilterChip`/`AdminDropdown`, `Card`/`Stat`, 차트 `Sparkline`/`Donut`/`BarRow`/`SalesAreaChart`, `StatusChip`/`GradeChip`, `AdminBtn`, 각종 `*Modal`, `AIcon`(SVG).

## 마이그레이션 원칙
- 원본 마크업·스타일을 그대로 보존. 디자인 개선·재해석 금지.
- 단계별로 진행한다. 시키지 않은 범위(다음 단계 내용)를 미리 손대지 말 것.
- 정적 HTML엔 없던 로딩/에러/빈 상태는 API 연동 단계에서 추가한다.

### 변환 순서
1. 기반 셋업 (Vite + react-router, tokens.css로 CSS 변수 이관)
2. 데이터 레이어 (`shop/data.jsx`·`admin/admin-data.jsx` → 타입 있는 모듈)
3. 공용 컴포넌트 (components/ui, shop, admin primitives)
4. 쇼핑몰 데스크탑 화면
5. 쇼핑몰 모바일 화면 (768px 분기)
6. 관리자 10개 view
7. 정리 (중복 제거, 전 라우트 점검)

## 검증
- 각 단계 완료 후 dev 서버를 띄워 결과를 확인하고 보고한다.
- API 연동 단계: 타입 체크(tsc --noEmit)와 빌드 통과를 확인한다.
