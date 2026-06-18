// 마이페이지 · 포인트 — Phase 5c: GET /me/points (잔액 + 적립/사용 이력). 조회 전용.
import { useState } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useMyPoints } from '../../../api/points'
import { ErrorState, EmptyState } from '../../../components/shop/states'

export default function PointsTab() {
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const q = useMyPoints(!!user, page)

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 24px', color: 'var(--plum-800)' }}>포인트</h3>

      {/* 잔액 카드 */}
      <div style={{ background: 'var(--plum-900)', color: 'var(--cream)', padding: '28px 32px', marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.3em', opacity: 0.6 }}>POINT BALANCE</div>
        <div style={{ marginTop: 10, fontFamily: 'var(--serif-en)', fontSize: 36 }}>
          {(q.data?.balance ?? 0).toLocaleString('ko-KR')}<span style={{ fontSize: 15, opacity: 0.6, marginLeft: 6 }}>P</span>
        </div>
      </div>

      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: 'var(--plum-800)', marginBottom: 14 }}>적립 · 사용 내역</div>
      {q.isPending ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>포인트 내역을 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data || q.data.history.length === 0 ? (
        <EmptyState message="포인트 적립·사용 내역이 없습니다." />
      ) : (
        <>
          <div style={{ background: '#fff', border: '1px solid var(--line)' }}>
            {q.data.history.map((h, i) => {
              const plus = h.pointAmount >= 0
              return (
                <div key={h.pointSeq} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center', padding: '16px 20px', borderBottom: i < q.data.history.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, padding: '3px 10px', background: plus ? 'var(--plum-100)' : 'var(--line)', color: plus ? 'var(--plum-700)' : 'var(--muted)', letterSpacing: '0.06em' }}>{h.typeLabel}</span>
                      <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{h.reason || '—'}</span>
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>{h.createdDate}{h.expireDate ? ` · 소멸예정 ${h.expireDate}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--serif-en)', fontSize: 16, color: plus ? 'var(--plum-700)' : '#c14b3a', fontWeight: 500 }}>{plus ? '+' : ''}{h.pointAmount.toLocaleString('ko-KR')} P</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>잔액 {h.balanceAfter.toLocaleString('ko-KR')} P</div>
                  </div>
                </div>
              )
            })}
          </div>
          {q.data.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} style={pagerBtn(page === 0)}>이전</button>
              <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--muted)' }}>{q.data.page + 1} / {q.data.totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(q.data.totalPages - 1, p + 1))} disabled={q.data.page >= q.data.totalPages - 1} style={pagerBtn(q.data.page >= q.data.totalPages - 1)}>다음</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function pagerBtn(disabled: boolean) {
  return { padding: '8px 18px', background: 'transparent', border: '1px solid var(--line-strong)', cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1, fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)' } as const
}
