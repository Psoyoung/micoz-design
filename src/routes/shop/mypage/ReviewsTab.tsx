// 마이페이지 · 내 리뷰 — Phase 5b: mock → GET /me/reviews.
// 작성(create)은 주문 상세(OrdersTab → ReviewModal)에서 — DELIVERED 주문 아이템(itemSeq) 파생.
// ReviewResponse 엔 상품명이 없어 productSeq 팔레트 타일 + 상품 보기 링크로 표현(상품명은 상세 페이지에서).
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext'
import { catalogErrorMessage, productPalette } from '../../../api/catalog'
import { useMyReviews } from '../../../api/reviews'
import { ErrorState, EmptyState } from '../../../components/shop/states'

export default function ReviewsTab() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const q = useMyReviews(!!user)

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 32px', color: 'var(--plum-800)' }}>내 리뷰</h3>
      {q.isPending ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>리뷰를 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState message="작성한 리뷰가 없습니다. 배송 완료된 주문에서 리뷰를 남겨보세요." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {q.data.items.map((r) => (
            <article key={r.id} style={{ display: 'grid', gridTemplateColumns: '78px 1fr', gap: 22, padding: 24, background: 'var(--paper)', border: '1px solid var(--line)' }}>
              <div onClick={() => navigate(`/products/${r.productSeq}`)} style={{ width: 78, height: 100, background: productPalette(r.productSeq).grad, flexShrink: 0, cursor: 'pointer' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'baseline' }}>
                  <div style={{ fontSize: 13, color: 'var(--plum-500)', letterSpacing: '0.1em' }}>
                    {'★'.repeat(r.rating)}<span style={{ opacity: 0.2 }}>{'★'.repeat(5 - r.rating)}</span>
                  </div>
                  <div style={{ fontFamily: 'var(--serif-en)', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.04em' }}>{r.createdDate.slice(0, 10)}</div>
                </div>
                {r.title && <div style={{ fontFamily: 'var(--serif)', fontSize: 15, marginTop: 10, color: 'var(--ink)', fontWeight: 500 }}>{r.title}</div>}
                <p style={{ margin: '8px 0 14px', fontSize: 13.5, lineHeight: 1.7, color: 'var(--muted)', whiteSpace: 'pre-wrap' }}>{r.content}</p>
                <button onClick={() => navigate(`/products/${r.productSeq}`)} style={{ background: 'transparent', border: '1px solid var(--line-strong)', cursor: 'pointer', fontSize: 12, color: 'var(--plum-700)', padding: '6px 14px' }}>상품 보기 →</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
