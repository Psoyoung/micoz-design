// 쇼핑몰 홈 — 출처: 원본 shop/screens-desktop.jsx HomePage.
// 히어로 → GET /banners(HERO), 베스트셀러 → GET /products/featured?label=BEST.
// 보고: Banner API 엔 title/description/linkUrl 만 → 원본 히어로의 tag/이탤릭sub/body 에디토리얼 제거(레이아웃 유지),
//   배경 이미지는 2a 결정과 일관되게 디자인 로컬 이미지(placeholder CDN 미사용). 카테고리 타일은 네비용 colocate 보존.
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../contexts/ToastContext'
import { useIsMobile } from '../../lib/useIsMobile'
import { useBanners, useFeatured, catalogErrorMessage, type HeroBanner } from '../../api/catalog'
import { ApiError } from '../../api/client'
import type { ProductSummary } from '../../lib/data'
import MobileHome from './mobile/MobileHome'
import FadeIn from '../../components/shop/FadeIn'
import PrimaryBtn from '../../components/shop/PrimaryBtn'
import ThinLink from '../../components/shop/ThinLink'
import ProductCard from '../../components/shop/ProductCard'
import { ProductGridSkeleton, ErrorState, EmptyState } from '../../components/shop/states'

const TILES = [
  { title: 'Cosmetics', desc: ['건강함과 아름다운 미래를', '만나보세요.'], img: '/image/home1.jpg', placeholder: 'linear-gradient(160deg, #f6f0ea 0%, #d8cfc4 100%)' },
  { title: 'Health Supplements', desc: ['건강한 오늘,', '더 나은 내일을 위한 작은 습관.'], img: '/image/home2.jpg', placeholder: 'linear-gradient(150deg, #c98fa3 0%, #7e3552 60%, #4d1f33 100%)' },
  { title: 'Daily Essentials', desc: ['생활에 필요한', '실용적인 아이템'], img: '/image/home3.jpg', placeholder: 'linear-gradient(150deg, #c7d6e0 0%, #6e8ba4 60%, #3a546d 100%)' },
  { title: 'Beauty Devices', desc: ['스스로를 위한 특별한 시간,', '홈뷰티의 시작.'], img: '/image/home4.jpg', placeholder: 'linear-gradient(150deg, #d8a978 0%, #a06a32 55%, #6a4218 100%)' },
]
// 히어로 배경(디자인 — placeholder CDN 대신 로컬 이미지). 배너 수만큼 순환.
const HERO_BG = ['/image/main1.jpg', '/image/main2.jpg', '/image/home1.jpg']
const FALLBACK_HERO: HeroBanner = { id: 0, title: 'MICOZ', sub: '피부 본연의 빛을 깨우다', link: '/products' }

export default function HomePage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileHome /> : <DesktopHome />
}

function DesktopHome() {
  const navigate = useNavigate()
  const { quickAdd } = useCart()
  const { show } = useToast()
  const [heroIdx, setHeroIdx] = useState(0)
  const [hoverTile, setHoverTile] = useState(-1)

  const bannersQ = useBanners()
  const featuredQ = useFeatured('BEST', 4)
  const heroes = bannersQ.data && bannersQ.data.length ? bannersQ.data : [FALLBACK_HERO]

  useEffect(() => {
    if (heroes.length <= 1) return
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % heroes.length), 6500)
    return () => clearInterval(t)
  }, [heroes.length])

  const idx = heroIdx % heroes.length
  const c = heroes[idx]
  const bg = HERO_BG[idx % HERO_BG.length]

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

  return (
    <main style={{ background: 'var(--cream)' }}>
      {/* HERO */}
      <section style={{ position: 'relative', height: 'calc(100vh - 80px)', minHeight: 640, backgroundColor: '#ece2d4', backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', overflow: 'hidden', transition: 'background-image 1.6s ease' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 40%, rgba(196, 176, 216, 0.18), transparent 60%)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', maxWidth: 1440, margin: '0 auto', padding: '0 56px', display: 'flex', alignItems: 'center' }}>
          <div style={{ color: 'var(--cream)' }}>
            <FadeIn key={`t-${idx}`} delay={150}>
              <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 88, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, marginBottom: 12 }}>{c.title}</h1>
            </FadeIn>
            {c.sub && (
              <FadeIn key={`d-${idx}`} delay={300}>
                <p style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 19, lineHeight: 1.7, opacity: 0.85, maxWidth: 460, marginTop: 24, marginBottom: 48 }}>{c.sub}</p>
              </FadeIn>
            )}
            <FadeIn key={`b-${idx}`} delay={420}>
              <div style={{ display: 'flex', gap: 20, marginTop: c.sub ? 0 : 40 }}>
                <PrimaryBtn onClick={() => navigate(c.link)} dark={false} style={{ background: 'var(--cream)', color: 'var(--plum-800)', border: 'none' }}>컬렉션 보기</PrimaryBtn>
                <button onClick={() => navigate('/story')} style={{ padding: '14px 28px', background: 'transparent', color: 'var(--cream)', border: '1px solid rgba(245,241,234,0.4)', fontSize: 13, fontFamily: 'var(--sans)', fontWeight: 500, letterSpacing: '0.18em', cursor: 'pointer', textTransform: 'uppercase' }}>브랜드 이야기</button>
              </div>
            </FadeIn>
          </div>
        </div>

        {heroes.length > 1 && (
          <div style={{ position: 'absolute', bottom: 36, left: 56, display: 'flex', gap: 8, alignItems: 'center', zIndex: 3 }}>
            {heroes.map((_, i) => (
              <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === idx ? 32 : 8, height: 1.5, background: i === idx ? 'var(--cream)' : 'rgba(245,241,234,0.4)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all .4s' }} />
            ))}
            <span style={{ marginLeft: 18, fontFamily: 'var(--serif-en)', fontSize: 11, color: 'var(--cream)', opacity: 0.6, letterSpacing: '0.15em' }}>0{idx + 1} / 0{heroes.length}</span>
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 36, right: 56, zIndex: 3, color: 'var(--cream)', opacity: 0.6, fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em' }}>SCROLL ↓</div>
      </section>

      {/* PRODUCTS — 카테고리 타일 (네비용 colocate 보존) */}
      <section style={{ padding: '40px 0 120px' }}>
        <div style={{ maxWidth: 1440, padding: '0 56px', margin: '0px 0px 56px', textAlign: 'left' }}>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 16 }}>MICOZ PRODUCTS</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 44, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>미코즈의 제품</h2>
          <p style={{ margin: '18px 0 0', fontSize: 14.5, color: 'var(--muted)', fontFamily: 'var(--sans)', fontWeight: 400, letterSpacing: '-0.005em' }}>미코즈는 아름다움의 본질을 탐구하며, 피부 본연의 건강과 빛을 선사하는 제품을 만듭니다.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {TILES.map((t, i) => (
            <button key={i} onClick={() => navigate('/products')} onMouseEnter={() => setHoverTile(i)} onMouseLeave={() => setHoverTile(-1)} style={{ position: 'relative', height: 540, background: t.placeholder, backgroundImage: t.img ? `url(${t.img})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', overflow: 'hidden', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'center', color: '#fff', transition: 'filter .4s' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.40) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 28px', opacity: hoverTile === i ? 0 : 1, transition: 'opacity .4s' }}>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 30, fontWeight: 500, letterSpacing: '0.005em', color: '#fff', textShadow: '0 1px 8px rgba(0,0,0,0.25)' }}>{t.title}</div>
                <div style={{ marginTop: 18, fontSize: 13.5, lineHeight: 1.75, color: 'rgba(255,255,255,0.95)', fontFamily: 'var(--sans)', fontWeight: 400, letterSpacing: '0.01em', textShadow: '0 1px 6px rgba(0,0,0,0.25)' }}>
                  {t.desc.map((d, j) => (<div key={j}>{d}</div>))}
                </div>
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.35)', opacity: hoverTile === i ? 1 : 0, transition: 'opacity .4s', pointerEvents: 'none' }}>
                <div style={{ padding: '14px 32px', background: 'rgba(255,255,255,0.92)', color: 'var(--ink)', fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 500, letterSpacing: '0.02em', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>바로가기</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* BEST PRODUCTS — /products/featured */}
      <section style={{ padding: '40px 56px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 56 }}>
            <div>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 16 }}>BESTSELLERS</div>
              <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 44, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>가장 사랑받는</h2>
            </div>
            <ThinLink onClick={() => navigate('/products')}>모든 제품 →</ThinLink>
          </div>
          {featuredQ.isPending ? (
            <ProductGridSkeleton count={4} columns={4} />
          ) : featuredQ.isError ? (
            <ErrorState message={catalogErrorMessage(featuredQ.error)} onRetry={() => featuredQ.refetch()} />
          ) : !featuredQ.data || featuredQ.data.length === 0 ? (
            <EmptyState message="베스트셀러가 아직 없습니다." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
              {featuredQ.data.map((p) => (
                <ProductCard key={p.id} p={p} onClick={() => navigate(`/products/${p.id}`)} onAdd={() => handleAdd(p)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
