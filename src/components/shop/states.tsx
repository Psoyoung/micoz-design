// 쇼핑몰 공통 상태 UI — 로딩 스켈레톤 / 에러(재시도) / 빈 상태.
// 카탈로그 등 쿼리 기반 화면에서 재사용.
import type { CSSProperties } from 'react'
import PrimaryBtn from './PrimaryBtn'

// 제품 카드 자리 스켈레톤(그리드 1칸)
export function ProductCardSkeleton({ compact = false }: { compact?: boolean }) {
  const ph = compact ? 280 : 380
  return (
    <div style={{ opacity: 0.7 }}>
      <div style={{ height: ph, background: 'linear-gradient(100deg, #ece4ef 30%, #f4eef6 50%, #ece4ef 70%)', backgroundSize: '200% 100%', animation: 'micozShimmer 1.2s infinite linear', marginBottom: 18 }} />
      <div style={{ height: 11, width: '40%', background: '#e7dfea', marginBottom: 10 }} />
      <div style={{ height: 16, width: '70%', background: '#e7dfea', marginBottom: 10 }} />
      <div style={{ height: 13, width: '30%', background: '#e7dfea' }} />
    </div>
  )
}

export function ProductGridSkeleton({ count = 6, columns = 3, compact = false }: { count?: number; columns?: number; compact?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 32, rowGap: 64 }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} compact={compact} />
      ))}
    </div>
  )
}

const centerBox: CSSProperties = { padding: '80px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <div style={centerBox} role="alert">
      <div style={{ fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--plum-800)' }}>불러오지 못했습니다</div>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.6, maxWidth: 420 }}>{message || '잠시 후 다시 시도해주세요.'}</div>
      {onRetry && (
        <div style={{ marginTop: 4 }}>
          <PrimaryBtn onClick={onRetry}>다시 시도</PrimaryBtn>
        </div>
      )}
    </div>
  )
}

export function EmptyState({ message = '표시할 항목이 없습니다.' }: { message?: string }) {
  return (
    <div style={centerBox}>
      <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{message}</div>
    </div>
  )
}
