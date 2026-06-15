// 관리자 페이지네이션 — 출처: 원본 admin/admin-primitives.jsx Pagination
import type { CSSProperties } from 'react'

const pageBtn: CSSProperties = {
  minWidth: 30,
  padding: '6px 10px',
  fontFamily: 'var(--mono)',
  fontSize: 12,
  background: '#fff',
  border: '1px solid var(--ad-line)',
  color: 'var(--ad-ink)',
  cursor: 'pointer',
}

type Props = {
  page: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}

export default function Pagination({ page, total, pageSize, onChange }: Props) {
  const pages = Math.ceil(total / pageSize)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 22px', borderTop: '1px solid var(--ad-line)', fontSize: 12, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em' }}>
      <div>총 {total.toLocaleString()}건 · {page}/{pages} 페이지</div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={pageBtn} onClick={() => onChange(Math.max(1, page - 1))}>이전</button>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{ ...pageBtn, background: n === page ? '#3a2552' : '#fff', color: n === page ? '#f5f1ea' : 'var(--ad-ink)', borderColor: n === page ? '#3a2552' : 'var(--ad-line)' }}
          >
            {n}
          </button>
        ))}
        <button style={pageBtn} onClick={() => onChange(Math.min(pages, page + 1))}>다음</button>
      </div>
    </div>
  )
}
