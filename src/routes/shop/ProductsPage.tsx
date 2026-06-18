// 쇼핑몰 제품 목록 — 출처: 원본 shop/screens-desktop.jsx ProductsPage.
// 데이터: GET /categories · /products (useCategories/useProducts). 필터(categorySeq)·정렬·페이징을 API 파라미터로.
// 카드 빠른담기는 목록 DTO 에 옵션이 없어 기본 옵션(basePrice)으로 로컬 카트에 담음(정식 카트는 Phase 3).
import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../contexts/ToastContext'
import { useIsMobile } from '../../lib/useIsMobile'
import { useCategories, useProducts, catalogErrorMessage, type ProductsParams } from '../../api/catalog'
import { ApiError } from '../../api/client'
import type { ProductSummary } from '../../lib/data'
import MobileProducts from './mobile/MobileProducts'
import ProductCard from '../../components/shop/ProductCard'
import { ProductGridSkeleton, ErrorState, EmptyState } from '../../components/shop/states'

const PAGE_SIZE = 9
const SORT_PARAM: Record<string, string> = {
  featured: 'productSeq,desc',
  'price-asc': 'basePrice,asc',
  'price-desc': 'basePrice,desc',
  name: 'productName,asc',
}

// 뷰포트 분기 — 한쪽 트리만 렌더
export default function ProductsPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileProducts /> : <DesktopProducts />
}

function DesktopProducts() {
  const navigate = useNavigate()
  const { quickAdd } = useCart()
  const { show } = useToast()
  const [categorySeq, setCategorySeq] = useState<number | null>(null)
  const [sort, setSort] = useState('featured')
  const [page, setPage] = useState(0)

  const cats = useCategories()
  const params: ProductsParams = { categorySeq, page, size: PAGE_SIZE, sort: SORT_PARAM[sort] }
  const products = useProducts(params)

  const pick = (next: { categorySeq?: number | null; sort?: string }) => {
    if (next.categorySeq !== undefined) setCategorySeq(next.categorySeq)
    if (next.sort !== undefined) setSort(next.sort)
    setPage(0) // 필터/정렬 바뀌면 첫 페이지로
  }

  const handleAdd = async (p: ProductSummary) => {
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
  }

  const data = products.data
  const total = data?.totalElements ?? 0

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <section style={{ padding: '56px 56px 32px', background: 'linear-gradient(180deg, #f5edf7 0%, var(--cream) 100%)' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 22, letterSpacing: '0.32em', color: 'var(--plum-700)', fontWeight: 500 }}>SHOP · PRODUCT</div>
        </div>
      </section>

      <section style={{ padding: '40px 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 64 }}>
          {/* Sidebar */}
          <aside>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>CATEGORY</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {(cats.data ?? [{ categorySeq: null, name: '전체', slug: 'all' }]).map((c) => (
                <li key={c.slug}>
                  <button
                    onClick={() => pick({ categorySeq: c.categorySeq })}
                    style={{
                      display: 'flex', justifyContent: 'space-between', width: '100%', padding: '10px 0',
                      background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'var(--sans)', fontSize: 14,
                      color: categorySeq === c.categorySeq ? 'var(--plum-800)' : 'var(--muted)',
                      fontWeight: categorySeq === c.categorySeq ? 500 : 400,
                    }}
                  >
                    <span>{c.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--muted)', marginTop: 48, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>CONCERN</div>
            {['수분', '결 정돈', '탄력', '진정', '광채'].map((t) => (
              <button key={t} style={{ display: 'block', padding: '8px 0', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', fontWeight: 300 }}>{t}</button>
            ))}
          </aside>

          <div>
            {/* Sort row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36, paddingBottom: 20, borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{total}개 제품</div>
              <select
                value={sort}
                onChange={(e) => pick({ sort: e.target.value })}
                style={{ background: 'transparent', border: 'none', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', cursor: 'pointer', letterSpacing: '0.05em', outline: 'none' }}
              >
                <option value="featured">추천순</option>
                <option value="price-asc">가격 낮은순</option>
                <option value="price-desc">가격 높은순</option>
                <option value="name">이름순</option>
              </select>
            </div>

            {/* 상태 분기 */}
            {products.isPending ? (
              <ProductGridSkeleton count={PAGE_SIZE} columns={3} />
            ) : products.isError ? (
              <ErrorState message={catalogErrorMessage(products.error)} onRetry={() => products.refetch()} />
            ) : !data || data.items.length === 0 ? (
              <EmptyState message="해당 조건의 제품이 없습니다." />
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, rowGap: 64, opacity: products.isFetching ? 0.6 : 1, transition: 'opacity .2s' }}>
                  {data.items.map((p) => (
                    <ProductCard key={p.id} p={p} onClick={() => navigate(`/products/${p.id}`)} onAdd={() => handleAdd(p)} />
                  ))}
                </div>
                {data.totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 56 }}>
                    <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={pagerBtn(page === 0)}>이전</button>
                    <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--muted)' }}>{data.page + 1} / {data.totalPages}</span>
                    <button onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))} disabled={data.page >= data.totalPages - 1} style={pagerBtn(data.page >= data.totalPages - 1)}>다음</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}

function pagerBtn(disabled: boolean): CSSProperties {
  return { padding: '8px 18px', background: 'transparent', border: '1px solid var(--line-strong)', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', letterSpacing: '0.04em' }
}
