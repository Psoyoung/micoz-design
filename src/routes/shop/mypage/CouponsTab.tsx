// 마이페이지 · 쿠폰 — Phase 5c: GET /me/coupons (보유 쿠폰). 조회 전용(주문 적용 API 미지원 — 표시만).
import { useAuth } from '../../../auth/AuthContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useMyCoupons } from '../../../api/coupons'
import { ErrorState, EmptyState } from '../../../components/shop/states'

export default function CouponsTab() {
  const { user } = useAuth()
  const q = useMyCoupons(!!user)

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 8px', color: 'var(--plum-800)' }}>쿠폰</h3>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px' }}>보유하신 쿠폰입니다. 사용은 결제 단계에서 안내될 예정입니다.</p>

      {q.isPending ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>쿠폰을 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState message="보유한 쿠폰이 없습니다." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {q.data.items.map((c) => {
            const usable = c.status === 'AVAILABLE'
            return (
              <div key={c.userCouponSeq} style={{ position: 'relative', border: `1px solid ${usable ? 'var(--plum-700)' : 'var(--line)'}`, background: usable ? '#faf6fc' : 'var(--paper)', padding: 22, opacity: usable ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: 10.5, padding: '2px 8px', background: 'var(--plum-100)', color: 'var(--plum-700)', letterSpacing: '0.08em', marginRight: 8 }}>{c.typeLabel}</span>
                    <span style={{ fontSize: 11, color: usable ? 'var(--plum-700)' : 'var(--muted)' }}>{c.statusLabel}</span>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 30, color: 'var(--plum-800)', margin: '14px 0 6px' }}>{c.discountLabel}<span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 6 }}>{c.maxDiscountLabel}</span></div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--plum-800)', fontWeight: 500 }}>{c.couponName}</div>
                {c.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6, lineHeight: 1.6 }}>{c.description}</div>}
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px dashed var(--line-strong)', fontSize: 11.5, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>{c.minOrderLabel} 사용 가능</span>
                  <span>{c.usedDate ? `사용일 ${c.usedDate}` : c.expireDate ? `${c.expireDate}까지` : ''} · {c.couponCode}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
