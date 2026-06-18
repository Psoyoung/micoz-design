// 마이페이지 — 출처: 원본 shop/screens-desktop2.jsx MyPage
// 사용자=AuthContext(GET /me), 각 탭=실 API. 탭 전환은 내부 state.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../../../lib/useIsMobile'
import { useAuth } from '../../../auth/AuthContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useFavorites } from '../../../api/favorites'
import MobileMyPage from '../mobile/MobileMyPage'
import ProductCard from '../../../components/shop/ProductCard'
import { ProductGridSkeleton, ErrorState, EmptyState } from '../../../components/shop/states'
import OrdersTab from './OrdersTab'
import ReturnsTab from './ReturnsTab'
import ReviewsTab from './ReviewsTab'
import AddressTab from './AddressTab'
import ProfileTab from './ProfileTab'
import SupportTab from './SupportTab'
import PointsTab from './PointsTab'
import CouponsTab from './CouponsTab'

const NAV: [key: string, label: string, count: number | null][] = [
  ['orders', '주문 내역', null],
  ['returns', '취소 · 교환 · 반품', null],
  ['wishlist', '찜한 제품', null],
  ['reviews', '내 리뷰', null],
  ['points', '포인트', null],
  ['coupons', '쿠폰', null],
  ['address', '배송지 관리', null],
  ['profile', '회원 정보', null],
  ['support', '1:1 문의', null],
]

// 뷰포트 분기 — 한쪽 트리만 렌더
export default function MyPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileMyPage /> : <DesktopMyPage />
}

function DesktopMyPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [tab, setTab] = useState('orders')
  const wishlistQ = useFavorites(!!user, 0, 12)

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <section style={{ padding: '80px 56px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 60 }}>
          <aside>
            <div style={{ marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--line-strong)' }}>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 10 }}>MY PAGE</div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--plum-800)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>마이페이지</div>
              {user && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 10 }}>{user.name} 님 환영합니다</div>}
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {NAV.map(([k, l, c]) => (
                <li key={k}>
                  <button
                    onClick={() => setTab(k)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '14px 0',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '1px solid var(--line)',
                      fontFamily: 'var(--sans)',
                      fontSize: 14,
                      color: tab === k ? 'var(--plum-800)' : 'var(--muted)',
                      fontWeight: tab === k ? 500 : 400,
                    }}
                  >
                    <span>{l}</span>
                    {c !== null && <span style={{ fontFamily: 'var(--serif-en)', fontSize: 12, opacity: 0.7 }}>{c}</span>}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => void logout()}
              style={{ marginTop: 20, padding: '12px 0', width: '100%', background: 'transparent', border: '1px solid var(--line-strong)', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--muted)', letterSpacing: '0.06em' }}
            >
              로그아웃
            </button>
          </aside>

          <div>
            {tab === 'orders' && <OrdersTab />}

            {tab === 'wishlist' && (
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 32px', color: 'var(--plum-800)' }}>찜한 제품</h3>
                {wishlistQ.isPending ? (
                  <ProductGridSkeleton count={6} columns={3} compact />
                ) : wishlistQ.isError ? (
                  <ErrorState message={catalogErrorMessage(wishlistQ.error)} onRetry={() => wishlistQ.refetch()} />
                ) : !wishlistQ.data || wishlistQ.data.items.length === 0 ? (
                  <EmptyState message="아직 찜한 제품이 없습니다." />
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
                    {wishlistQ.data.items.map((p) => (
                      <ProductCard key={p.id} p={p} compact onClick={() => navigate(`/products/${p.id}`)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'returns' && <ReturnsTab />}
            {tab === 'reviews' && <ReviewsTab />}
            {tab === 'points' && <PointsTab />}
            {tab === 'coupons' && <CouponsTab />}
            {tab === 'address' && <AddressTab />}
            {tab === 'profile' && <ProfileTab />}
            {tab === 'support' && <SupportTab />}
          </div>
        </div>
      </section>
    </main>
  )
}
