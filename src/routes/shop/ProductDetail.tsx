// 쇼핑몰 제품 상세 — 출처: 원본 shop/screens-desktop.jsx DetailPage.
// /products/:id → GET /products/{seq}(useProduct). 옵션·리뷰요약·상세/성분/사용법 실데이터.
// 비주얼은 디자인 보존(그라디언트 Bottle) — API mainImageUrl/images 는 뷰모델에 보유하나 사진으로 렌더하지 않음(보고).
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { won } from '../../lib/format'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../contexts/ToastContext'
import { useProduct, useProducts, useReviews, catalogErrorMessage, type ProductDetailVM } from '../../api/catalog'
import { useFavoriteButton } from '../../api/favorites'
import { ApiError } from '../../api/client'
import Bottle, { type BottleShape } from '../../components/shop/Bottle'
import { Icon } from '../../components/shop/icons'
import OptionPicker from '../../components/shop/OptionPicker'
import Counter from '../../components/shop/Counter'
import PrimaryBtn from '../../components/shop/PrimaryBtn'
import ProductCard from '../../components/shop/ProductCard'
import { ErrorState, EmptyState } from '../../components/shop/states'
import { useIsMobile } from '../../lib/useIsMobile'
import MobileDetail from './mobile/MobileDetail'

export default function ProductDetail() {
  const { id } = useParams()
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const q = useProduct(id)

  if (q.isPending) {
    return <div style={{ background: 'var(--cream)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>불러오는 중…</div>
  }
  if (q.isError) {
    const code = q.error instanceof ApiError ? q.error.code : undefined
    const notFound = code === 'PRODUCT_NOT_FOUND'
    return (
      <div style={{ background: 'var(--cream)', minHeight: '60vh' }}>
        <ErrorState
          message={notFound ? '존재하지 않거나 판매 중지된 상품입니다.' : catalogErrorMessage(q.error)}
          onRetry={notFound ? () => navigate('/products') : () => q.refetch()}
        />
      </div>
    )
  }
  // key 로 product 변경 시 옵션/수량 state 초기화
  return isMobile ? <MobileDetail key={q.data.id} product={q.data} /> : <DetailView key={q.data.id} product={q.data} />
}

function shapeFor(categoryName: string): BottleShape {
  return categoryName === '크림' ? 'jar' : categoryName === '토너' ? 'wide' : 'tall'
}

function DetailView({ product }: { product: ProductDetailVM }) {
  const navigate = useNavigate()
  const { add, quickAdd } = useCart()
  const { show } = useToast()
  const fav = useFavoriteButton()
  const [optId, setOptId] = useState(product.options[0].id)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('detail')
  const [reviewPage, setReviewPage] = useState(0)
  const opt = product.options.find((o) => o.id === optId) ?? product.options[0]
  const reviewsQ = useReviews(tab === 'reviews' ? product.id : undefined, reviewPage)

  // 연관 상품 — 최신순 일부에서 현재 상품 제외
  const relatedQ = useProducts({ size: 5, sort: 'productSeq,desc' })
  const related = (relatedQ.data?.items ?? []).filter((p) => p.id !== product.id).slice(0, 4)

  const rv = product.reviewSummary
  const handleAdd = async () => {
    try {
      await add(product, opt, qty)
      show(`${product.name}이(가) 장바구니에 담겼습니다.`)
    } catch (e) {
      show(catalogErrorMessage(e))
    }
  }

  return (
    <main style={{ background: 'var(--cream)' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '24px 56px', maxWidth: 1440, margin: '0 auto', fontSize: 12, color: 'var(--muted)', letterSpacing: '0.1em' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>HOME</span>
        <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>SHOP</span>
        <span style={{ margin: '0 10px', opacity: 0.5 }}>/</span>
        <span style={{ color: 'var(--ink)' }}>{product.name}</span>
      </div>

      {/* Detail hero */}
      <section style={{ padding: '20px 56px 80px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.05fr 1fr', gap: 80 }}>
          <div>
            <Bottle grad={product.grad} h={720} line={product.nameEn} shape={shapeFor(product.categoryName)} />
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{ flex: 1, aspectRatio: '1', background: [product.grad, 'linear-gradient(155deg, #4d3470, #c4b0d8)', 'linear-gradient(140deg, #2d2347, #6b4d8f)', 'linear-gradient(170deg, #352a50, #9a7fb8)'][i], border: i === 0 ? '1.5px solid var(--plum-700)' : '1.5px solid transparent', cursor: 'pointer' }} />
              ))}
            </div>
          </div>

          {/* right — info */}
          <div style={{ paddingTop: 32 }}>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 16 }}>{(product.line ?? '').toUpperCase()}</div>
            <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 56, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em', lineHeight: 1.1 }}>{product.name}</h1>
            <div style={{ fontFamily: 'var(--serif-en)', fontStyle: 'italic', fontSize: 18, color: 'var(--muted)', marginTop: 6, fontWeight: 300, letterSpacing: '0.05em' }}>{product.nameEn}</div>

            {/* 라벨 + 리뷰요약 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              {product.labels.map((l) => (
                <span key={l} style={{ fontSize: 10, letterSpacing: '0.18em', padding: '4px 10px', background: 'var(--plum-100)', color: 'var(--plum-700)', fontWeight: 500 }}>{l}</span>
              ))}
              {rv.count > 0 && (
                <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>★ {rv.averageRating.toFixed(1)} · 리뷰 {rv.count}개</span>
              )}
            </div>

            <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.9, color: 'var(--ink)', marginTop: 28, fontWeight: 300, marginBottom: 0 }}>{product.shortDesc}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36 }}>
              <span style={{ fontFamily: 'var(--serif-en)', fontSize: 28, color: 'var(--plum-800)' }}>{won(opt.price)}</span>
              <span style={{ fontSize: 11, padding: '4px 10px', background: 'var(--plum-100)', color: 'var(--plum-700)', letterSpacing: '0.15em' }}>5% 적립</span>
            </div>

            <div style={{ marginTop: 36, paddingTop: 32, borderTop: '1px solid var(--line)' }}>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 14 }}>OPTION · 용량</div>
              <OptionPicker options={product.options} value={optId} onChange={setOptId} />
            </div>

            <div style={{ marginTop: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 12 }}>QUANTITY</div>
                <Counter value={qty} onChange={setQty} />
              </div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 12 }}>TOTAL</div>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 26, color: 'var(--plum-800)' }}>{won(opt.price * qty)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
              <PrimaryBtn full size="lg" onClick={handleAdd}>장바구니 담기</PrimaryBtn>
              <button
                onClick={() => fav.onToggle(product.id)}
                aria-label={fav.isFav(product.id) ? '찜 해제' : '찜하기'}
                aria-pressed={fav.isFav(product.id)}
                style={{ width: 56, height: 56, background: fav.isFav(product.id) ? 'var(--plum-50)' : 'transparent', border: '1px solid var(--plum-700)', cursor: 'pointer', color: 'var(--plum-700)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {Icon.heart(18, 'var(--plum-700)', fav.isFav(product.id))}
              </button>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, margin: '36px 0 0', fontSize: 13, color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>· 5만원 이상 구매 시 무료배송 (3-5 영업일 내 도착)</li>
              <li>· 미개봉 30일 이내 무료반품</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tabs — 실데이터(상세/성분/사용법/리뷰요약) */}
      <section style={{ padding: '0 56px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 48, borderBottom: '1px solid var(--line)', marginBottom: 48 }}>
            {[
              ['detail', '상세 설명'],
              ['ingredients', '성분'],
              ['howto', '사용법'],
              ['reviews', `리뷰 (${rv.count})`],
            ].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '20px 0', background: 'transparent', border: 'none', borderBottom: tab === k ? '1.5px solid var(--plum-800)' : '1.5px solid transparent', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: tab === k ? 500 : 400, color: tab === k ? 'var(--plum-800)' : 'var(--muted)', cursor: 'pointer', letterSpacing: '0.05em', marginBottom: -1 }}>{l}</button>
            ))}
          </div>

          {tab === 'detail' && <ProseBlock text={product.detailDesc || product.shortDesc} empty="상세 설명이 준비 중입니다." />}
          {tab === 'ingredients' && <ProseBlock text={product.ingredientInfo} empty="성분 정보가 준비 중입니다." />}
          {tab === 'howto' && <ProseBlock text={product.usageInfo} empty="사용법 정보가 준비 중입니다." />}
          {tab === 'reviews' && (
            <div style={{ maxWidth: 800 }}>
              {rv.count > 0 && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
                  <span style={{ fontFamily: 'var(--serif-en)', fontSize: 40, color: 'var(--plum-800)' }}>{rv.averageRating.toFixed(1)}</span>
                  <span style={{ fontSize: 16, color: 'var(--plum-700)' }}>{'★'.repeat(Math.round(rv.averageRating))}{'☆'.repeat(5 - Math.round(rv.averageRating))}</span>
                  <span style={{ fontSize: 13.5, color: 'var(--muted)' }}>총 {rv.count}개의 리뷰</span>
                </div>
              )}
              {reviewsQ.isPending ? (
                <div style={{ color: 'var(--muted)', fontSize: 14, padding: '40px 0' }}>리뷰 불러오는 중…</div>
              ) : reviewsQ.isError ? (
                <ErrorState message={catalogErrorMessage(reviewsQ.error)} onRetry={() => reviewsQ.refetch()} />
              ) : !reviewsQ.data || reviewsQ.data.items.length === 0 ? (
                <EmptyState message="아직 등록된 리뷰가 없습니다." />
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20, opacity: reviewsQ.isFetching ? 0.6 : 1, transition: 'opacity .2s' }}>
                    {reviewsQ.data.items.map((r) => (
                      <div key={r.id} style={{ padding: 24, background: 'var(--paper)', border: '1px solid var(--line)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <span style={{ color: 'var(--plum-700)', fontFamily: 'var(--serif-en)', fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{r.userMasked} · {r.createdDate.slice(0, 10)}</span>
                        </div>
                        {r.title && <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--plum-800)', marginBottom: 8 }}>{r.title}</div>}
                        <p style={{ fontFamily: 'var(--serif)', fontSize: 14.5, lineHeight: 1.8, color: 'var(--ink)', margin: 0, fontWeight: 300, whiteSpace: 'pre-wrap' }}>{r.content}</p>
                      </div>
                    ))}
                  </div>
                  {reviewsQ.data.totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
                      <button onClick={() => setReviewPage((p) => Math.max(0, p - 1))} disabled={reviewPage === 0} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--line-strong)', opacity: reviewPage === 0 ? 0.4 : 1, fontSize: 13, cursor: reviewPage === 0 ? 'default' : 'pointer' }}>이전</button>
                      <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--muted)' }}>{reviewsQ.data.page + 1} / {reviewsQ.data.totalPages}</span>
                      <button onClick={() => setReviewPage((p) => Math.min((reviewsQ.data?.totalPages ?? 1) - 1, p + 1))} disabled={reviewsQ.data.page >= reviewsQ.data.totalPages - 1} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--line-strong)', opacity: reviewsQ.data.page >= reviewsQ.data.totalPages - 1 ? 0.4 : 1, fontSize: 13, cursor: reviewsQ.data.page >= reviewsQ.data.totalPages - 1 ? 'default' : 'pointer' }}>다음</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      <section style={{ padding: '0 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 16 }}>YOU MAY ALSO LIKE</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 36, margin: 0, marginBottom: 48, color: 'var(--plum-800)' }}>함께 추천하는 제품</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
            {related.map((p) => (
              <ProductCard
                key={p.id}
                p={p}
                compact
                onClick={() => navigate(`/products/${p.id}`)}
                onAdd={async () => {
                  try {
                    await quickAdd(p)
                    show(`${p.name}이(가) 장바구니에 담겼습니다.`)
                  } catch (e) {
                    if (e instanceof ApiError && e.code === 'CART_OPTION_REQUIRED') {
                      show('옵션 선택이 필요한 상품입니다. 상세 페이지로 이동합니다.')
                      navigate(`/products/${p.id}`)
                    } else {
                      show(catalogErrorMessage(e))
                    }
                  }
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function ProseBlock({ text, empty }: { text?: string; empty: string }) {
  if (!text) return <div style={{ fontSize: 14, color: 'var(--muted)' }}>{empty}</div>
  return <div style={{ fontFamily: 'var(--serif)', fontSize: 15.5, lineHeight: 2, color: 'var(--ink)', maxWidth: 800, fontWeight: 300, whiteSpace: 'pre-wrap' }}>{text}</div>
}
