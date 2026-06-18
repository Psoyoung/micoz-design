// 모바일 제품 상세 — 출처: 원본 shop/screens-mobile.jsx MobileDetail
// 자체 크롬(MobileHeader dark transparent + onBack). 담기 → cart 반영 + 드로어 오픈(모바일 카트 표면).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviews, catalogErrorMessage, type ProductDetailVM } from '../../../api/catalog'
import { useFavoriteButton } from '../../../api/favorites'
import { won } from '../../../lib/format'
import { useCart } from '../../../contexts/CartContext'
import { useToast } from '../../../contexts/ToastContext'
import MobileHeader from '../../../components/shop/MobileHeader'
import Bottle, { type BottleShape } from '../../../components/shop/Bottle'
import { Icon } from '../../../components/shop/icons'
import OptionPicker from '../../../components/shop/OptionPicker'
import Counter from '../../../components/shop/Counter'
import PrimaryBtn from '../../../components/shop/PrimaryBtn'
import { ErrorState, EmptyState } from '../../../components/shop/states'

export default function MobileDetail({ product }: { product: ProductDetailVM }) {
  const navigate = useNavigate()
  const { items, add, openDrawer } = useCart()
  const { show } = useToast()
  const fav = useFavoriteButton()
  const [optId, setOptId] = useState(product.options[0].id)
  const [qty, setQty] = useState(1)
  const [reviewPage, setReviewPage] = useState(0)
  const opt = product.options.find((o) => o.id === optId) ?? product.options[0]
  const reviewsQ = useReviews(product.id, reviewPage)
  const shape: BottleShape = product.categoryName === '크림' ? 'jar' : 'tall'

  const handleAdd = async () => {
    try {
      await add(product, opt, qty)
      openDrawer()
    } catch (e) {
      show(catalogErrorMessage(e))
    }
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100%', paddingBottom: 100 }}>
      <MobileHeader onBack={() => navigate('/products')} cart={items} onCart={openDrawer} dark transparent />
      <div style={{ marginTop: -52, paddingTop: 52, background: product.grad, height: 460, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <Bottle grad={product.grad} h={420} line={product.nameEn} shape={shape} />
      </div>
      <div style={{ padding: '32px 24px' }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 12 }}>{(product.line ?? '').toUpperCase()}</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 36, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>{product.name}</h1>
        <div style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 14, color: 'var(--muted)', marginTop: 4 }}>{product.nameEn}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {product.labels.map((l) => (
            <span key={l} style={{ fontSize: 9.5, letterSpacing: '0.16em', padding: '3px 8px', background: 'var(--plum-100)', color: 'var(--plum-700)', fontWeight: 500 }}>{l}</span>
          ))}
          {product.reviewSummary.count > 0 && (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>★ {product.reviewSummary.averageRating.toFixed(1)} · 리뷰 {product.reviewSummary.count}</span>
          )}
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 14, lineHeight: 1.8, color: 'var(--ink)', marginTop: 20, fontWeight: 300 }}>{product.shortDesc}</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 24 }}>
          <span style={{ fontFamily: 'var(--serif-en)', fontSize: 22, color: 'var(--plum-800)' }}>{won(opt.price)}</span>
          <span style={{ fontSize: 10, padding: '3px 8px', background: 'var(--plum-100)', color: 'var(--plum-700)', letterSpacing: '0.15em' }}>5% 적립</span>
        </div>

        <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 12 }}>OPTION</div>
          <OptionPicker options={product.options} value={optId} onChange={setOptId} />
        </div>

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Counter value={qty} onChange={setQty} />
          <span style={{ fontFamily: 'var(--serif-en)', fontSize: 22, color: 'var(--plum-800)' }}>{won(opt.price * qty)}</span>
        </div>
      </div>

      {/* 리뷰 목록 (페이징) */}
      <section style={{ padding: '8px 24px 24px' }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 16 }}>REVIEWS{product.reviewSummary.count > 0 ? ` · ${product.reviewSummary.count}` : ''}</div>
        {reviewsQ.isPending ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>리뷰 불러오는 중…</div>
        ) : reviewsQ.isError ? (
          <ErrorState message={catalogErrorMessage(reviewsQ.error)} onRetry={() => reviewsQ.refetch()} />
        ) : !reviewsQ.data || reviewsQ.data.items.length === 0 ? (
          <EmptyState message="아직 등록된 리뷰가 없습니다." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviewsQ.data.items.map((r) => (
              <div key={r.id} style={{ padding: 16, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'var(--plum-700)', fontFamily: 'var(--serif-en)', fontSize: 12 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{r.userMasked} · {r.createdDate.slice(0, 10)}</span>
                </div>
                {r.title && <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--plum-800)', marginBottom: 6 }}>{r.title}</div>}
                <p style={{ fontFamily: 'var(--serif)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--ink)', margin: 0, fontWeight: 300, whiteSpace: 'pre-wrap' }}>{r.content}</p>
              </div>
            ))}
            {reviewsQ.data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, marginTop: 12 }}>
                <button onClick={() => setReviewPage((p) => Math.max(0, p - 1))} disabled={reviewPage === 0} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--line-strong)', opacity: reviewPage === 0 ? 0.4 : 1, fontSize: 12 }}>이전</button>
                <span style={{ fontFamily: 'var(--serif-en)', fontSize: 11, color: 'var(--muted)' }}>{reviewsQ.data.page + 1} / {reviewsQ.data.totalPages}</span>
                <button onClick={() => setReviewPage((p) => Math.min((reviewsQ.data?.totalPages ?? 1) - 1, p + 1))} disabled={reviewsQ.data.page >= reviewsQ.data.totalPages - 1} style={{ padding: '6px 14px', background: 'transparent', border: '1px solid var(--line-strong)', opacity: reviewsQ.data.page >= reviewsQ.data.totalPages - 1 ? 0.4 : 1, fontSize: 12 }}>다음</button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* sticky add to cart */}
      <div style={{ position: 'sticky', bottom: 0, padding: '16px 24px 32px', background: 'var(--cream)', borderTop: '1px solid var(--line)', display: 'flex', gap: 10 }}>
        <button
          onClick={() => fav.onToggle(product.id)}
          aria-label={fav.isFav(product.id) ? '찜 해제' : '찜하기'}
          aria-pressed={fav.isFav(product.id)}
          style={{ width: 52, height: 52, background: fav.isFav(product.id) ? 'var(--plum-50)' : 'transparent', border: '1px solid var(--plum-700)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--plum-700)' }}
        >
          {Icon.heart(16, 'var(--plum-700)', fav.isFav(product.id))}
        </button>
        <PrimaryBtn full size="lg" onClick={handleAdd}>
          장바구니 담기
        </PrimaryBtn>
      </div>
    </div>
  )
}
