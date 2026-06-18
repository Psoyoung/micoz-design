// 모바일 마이페이지 — 출처: 원본 shop/screens-mobile.jsx MobileMyPage (대시보드/메뉴)
// 메뉴 진입 시 데스크탑 탭 컴포넌트(ReturnsTab/Reviews/Address/Profile/Support)·목업·모달을 재사용.
// 프레젠테이션(셸)만 모바일. 사용자는 AuthContext(GET /me).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../contexts/CartContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useFavorites } from '../../../api/favorites'
import MobileHeader from '../../../components/shop/MobileHeader'
import MobileTabBar from '../../../components/shop/MobileTabBar'
import ProductCard from '../../../components/shop/ProductCard'
import { ProductGridSkeleton, ErrorState, EmptyState } from '../../../components/shop/states'
import { Icon } from '../../../components/shop/icons'
import { useAuth } from '../../../auth/AuthContext'
import OrdersTab from '../mypage/OrdersTab'
import ReturnsTab from '../mypage/ReturnsTab'
import ReviewsTab from '../mypage/ReviewsTab'
import AddressTab from '../mypage/AddressTab'
import ProfileTab from '../mypage/ProfileTab'
import SupportTab from '../mypage/SupportTab'
import PointsTab from '../mypage/PointsTab'
import CouponsTab from '../mypage/CouponsTab'

type View = 'menu' | 'orders' | 'returns' | 'wishlist' | 'reviews' | 'points' | 'coupons' | 'address' | 'profile' | 'support'

const TAB_PATH: Record<string, string> = { home: '/', products: '/products', mypage: '/mypage', cart: '/cart' }

const MENU: [string, View | null][] = [
  ['주문 내역', 'orders'],
  ['취소 · 교환 · 반품', 'returns'],
  ['찜한 제품', 'wishlist'],
  ['내 리뷰', 'reviews'],
  ['포인트', 'points'],
  ['쿠폰', 'coupons'],
  ['배송지 관리', 'address'],
  ['회원 정보', 'profile'],
  ['1:1 문의', 'support'],
  ['로그아웃', null],
]

const SECTION_TITLE: Record<Exclude<View, 'menu'>, string> = {
  orders: '주문 내역',
  returns: '취소 · 교환 · 반품',
  wishlist: '찜한 제품',
  reviews: '내 리뷰',
  points: '포인트',
  coupons: '쿠폰',
  address: '배송지 관리',
  profile: '회원 정보',
  support: '1:1 문의',
}

export default function MobileMyPage() {
  const navigate = useNavigate()
  const { items, openDrawer } = useCart()
  const { user, logout } = useAuth()
  const [view, setView] = useState<View>('menu')
  const onNavTab = (p: string) => navigate(TAB_PATH[p] ?? '/')

  // ─── 섹션 상세 (데스크탑 탭 재사용) ───
  if (view !== 'menu') {
    return (
      <div style={{ background: 'var(--cream)', minHeight: '100%', paddingBottom: 80 }}>
        <MobileHeader title={SECTION_TITLE[view]} onBack={() => setView('menu')} cart={items} onCart={openDrawer} />
        <div style={{ padding: '12px 16px' }}>
          {view === 'orders' && <OrdersTab />}
          {view === 'wishlist' && <MobileWishlist />}
          {view === 'returns' && <ReturnsTab />}
          {view === 'reviews' && <ReviewsTab />}
          {view === 'points' && <PointsTab />}
          {view === 'coupons' && <CouponsTab />}
          {view === 'address' && <AddressTab />}
          {view === 'profile' && <ProfileTab />}
          {view === 'support' && <SupportTab />}
        </div>
        <MobileTabBar page="mypage" onNav={onNavTab} />
      </div>
    )
  }

  // ─── 대시보드 / 메뉴 (원본 마크업) ───
  return (
    <div style={{ background: 'var(--cream)', minHeight: '100%', paddingBottom: 80 }}>
      <MobileHeader cart={items} onCart={openDrawer} />
      <section style={{ padding: '24px 24px 16px' }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 8 }}>MY MICOZ</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 32, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>
          {user?.name ?? ''} 님,
          <br />
          안녕하세요.
        </h1>
      </section>
      <section style={{ padding: '0 24px' }}>
        <div style={{ background: 'var(--plum-900)', color: 'var(--cream)', padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em', opacity: 0.6 }}>POINT</span>
            <span style={{ fontSize: 11, opacity: 0.5 }}>{user?.gradeName ?? ''}</span>
          </div>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 28, marginTop: 6 }}>
            {(user?.pointBalance ?? 0).toLocaleString('ko-KR')}
            <span style={{ fontSize: 12, opacity: 0.6, marginLeft: 4 }}>P</span>
          </div>
          <div style={{ marginTop: 16, height: 2, background: 'rgba(245,241,234,0.18)' }}>
            <div style={{ width: '62%', height: '100%', background: 'var(--plum-200)' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
          {(
            [
              ['주문', 12],
              ['찜', 8],
              ['리뷰', 4],
              ['쿠폰', 3],
            ] as [string, number][]
          ).map(([l, c]) => (
            <div key={l} style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: '14px 8px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 22, color: 'var(--plum-800)' }}>{c}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {MENU.map(([l, v]) => (
            <li key={l}>
              <button
                onClick={() => (v ? setView(v) : void logout())}
                style={{
                  width: '100%',
                  padding: '18px 0',
                  fontSize: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: '1px solid var(--line)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--ink)',
                  fontFamily: 'var(--sans)',
                }}
              >
                <span>{l}</span>
                <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>{Icon.arrow(14)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <MobileTabBar page="mypage" onNav={onNavTab} />
    </div>
  )
}

// 찜한 제품 (모바일) — GET /me/favorites
function MobileWishlist() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const wishlistQ = useFavorites(!!user, 0, 12)

  if (wishlistQ.isPending) return <ProductGridSkeleton count={4} columns={2} compact />
  if (wishlistQ.isError) return <ErrorState message={catalogErrorMessage(wishlistQ.error)} onRetry={() => wishlistQ.refetch()} />
  if (!wishlistQ.data || wishlistQ.data.items.length === 0) return <EmptyState message="아직 찜한 제품이 없습니다." />

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, rowGap: 28 }}>
      {wishlistQ.data.items.map((p) => (
        <ProductCard key={p.id} p={p} compact onClick={() => navigate(`/products/${p.id}`)} />
      ))}
    </div>
  )
}
