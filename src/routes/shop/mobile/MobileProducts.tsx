// 모바일 제품 목록 — 출처: 원본 shop/screens-mobile.jsx MobileProducts.
// GET /categories·/products 연동. 카테고리 칩 → API 필터(categorySeq). 로딩/에러/빈 상태.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../../contexts/CartContext'
import { useCategories, useProducts, catalogErrorMessage } from '../../../api/catalog'
import MobileHeader from '../../../components/shop/MobileHeader'
import MobileTabBar from '../../../components/shop/MobileTabBar'
import ProductCard from '../../../components/shop/ProductCard'
import { ProductGridSkeleton, ErrorState, EmptyState } from '../../../components/shop/states'

const TAB_PATH: Record<string, string> = { home: '/', products: '/products', mypage: '/mypage', cart: '/cart' }
const PAGE_SIZE = 20

export default function MobileProducts() {
  const navigate = useNavigate()
  const { items, openDrawer } = useCart()
  const [categorySeq, setCategorySeq] = useState<number | null>(null)
  const [page, setPage] = useState(0)

  const cats = useCategories()
  const products = useProducts({ categorySeq, page, size: PAGE_SIZE, sort: 'productSeq,desc' })
  const data = products.data

  const pickCat = (seq: number | null) => { setCategorySeq(seq); setPage(0) }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100%' }}>
      <MobileHeader cart={items} onCart={openDrawer} />
      <section style={{ padding: '24px 24px 0' }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 8 }}>SHOP · ALL</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 40, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.02em' }}>제품 전체</h1>
      </section>
      <div style={{ overflowX: 'auto', padding: '24px 24px 12px', display: 'flex', gap: 8, scrollbarWidth: 'none' }}>
        {(cats.data ?? [{ categorySeq: null, name: '전체', slug: 'all' }]).map((c) => (
          <button
            key={c.slug}
            onClick={() => pickCat(c.categorySeq)}
            style={{
              padding: '8px 16px', whiteSpace: 'nowrap',
              background: categorySeq === c.categorySeq ? 'var(--plum-700)' : 'transparent',
              color: categorySeq === c.categorySeq ? 'var(--cream)' : 'var(--ink)',
              border: `1px solid ${categorySeq === c.categorySeq ? 'var(--plum-700)' : 'var(--line-strong)'}`,
              fontSize: 12, cursor: 'pointer', letterSpacing: '0.05em',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 24px 100px' }}>
        {products.isPending ? (
          <ProductGridSkeleton count={4} columns={2} compact />
        ) : products.isError ? (
          <ErrorState message={catalogErrorMessage(products.error)} onRetry={() => products.refetch()} />
        ) : !data || data.items.length === 0 ? (
          <EmptyState message="해당 조건의 제품이 없습니다." />
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, rowGap: 32, opacity: products.isFetching ? 0.6 : 1, transition: 'opacity .2s' }}>
              {data.items.map((p) => (
                <ProductCard key={p.id} p={p} compact onClick={() => navigate(`/products/${p.id}`)} />
              ))}
            </div>
            {data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}>
                <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--line-strong)', opacity: page === 0 ? 0.4 : 1, fontSize: 13 }}>이전</button>
                <span style={{ fontFamily: 'var(--serif-en)', fontSize: 12, color: 'var(--muted)' }}>{data.page + 1} / {data.totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={data.page >= data.totalPages - 1} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--line-strong)', opacity: data.page >= data.totalPages - 1 ? 0.4 : 1, fontSize: 13 }}>다음</button>
              </div>
            )}
          </>
        )}
      </div>
      <MobileTabBar page="products" onNav={(p) => navigate(TAB_PATH[p] ?? '/')} />
    </div>
  )
}
