// 마이페이지 · 취소/교환/반품 — Phase 5b: mock → 내 반품 목록(GET /me/returns) + 상세(GET /me/returns/{seq}).
// 신청(create)은 주문 상세(OrdersTab → ReturnRequestModal)에서 — itemSeq 가 주문 파생이라 그쪽에 colocate.
import { useState, type ReactNode } from 'react'
import { won } from '../../../lib/format'
import { useAuth } from '../../../auth/AuthContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useMyReturns, useMyReturn, type ReturnDetailVM } from '../../../api/returns'
import { ErrorState, EmptyState } from '../../../components/shop/states'
import { Icon } from '../../../components/shop/icons'

export default function ReturnsTab() {
  const [selected, setSelected] = useState<number | null>(null)
  return (
    <div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 8px', color: 'var(--plum-800)' }}>취소 · 교환 · 반품</h3>
      <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.7 }}>
        배송 완료 후 <span style={{ color: 'var(--plum-700)' }}>7일 이내</span> 반품·교환을 신청할 수 있어요. 신청은 <span style={{ color: 'var(--plum-700)' }}>주문 내역 → 주문 상세</span>에서 진행합니다.
      </p>
      {selected != null ? <ReturnDetail returnSeq={selected} onBack={() => setSelected(null)} /> : <ReturnList onSelect={setSelected} />}
    </div>
  )
}

function statusStyle(label: string) {
  const active = label === '승인' || label === '회수중' || label === '검수중'
  const done = label === '완료'
  return { fontSize: 11, padding: '4px 12px', letterSpacing: '0.08em', background: done ? 'var(--plum-700)' : active ? 'var(--plum-100)' : 'transparent', color: done ? 'var(--cream)' : active ? 'var(--plum-700)' : 'var(--muted)', border: done || active ? 'none' : '1px solid var(--line-strong)' }
}

function ReturnList({ onSelect }: { onSelect: (seq: number) => void }) {
  const { user } = useAuth()
  const q = useMyReturns(!!user)

  if (q.isPending) return <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>반품 내역을 불러오는 중…</div>
  if (q.isError) return <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
  if (!q.data || q.data.items.length === 0) return <EmptyState message="신청한 취소·교환·반품 내역이 없습니다." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {q.data.items.map((r) => (
        <button key={r.returnSeq} onClick={() => onSelect(r.returnSeq)} style={{ textAlign: 'left', border: '1px solid var(--line)', background: '#fff', cursor: 'pointer', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 11, padding: '3px 10px', background: 'var(--plum-100)', color: 'var(--plum-700)', letterSpacing: '0.08em', marginRight: 12 }}>{r.typeLabel}</span>
              <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13.5, color: 'var(--plum-700)' }}>{r.returnNo}</span>
              <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--muted)' }}>{r.requestedDate}</span>
            </div>
            <span style={statusStyle(r.statusLabel)}>{r.statusLabel}</span>
          </div>
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
            <span style={{ color: 'var(--ink)' }}>주문 {r.orderNo} · 사유 {r.reasonLabel} · {r.totalItemCount}개 상품</span>
            <span style={{ fontSize: 11.5, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>상세 보기 {Icon.arrow(12)}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function ReturnDetail({ returnSeq, onBack }: { returnSeq: number; onBack: () => void }) {
  const q = useMyReturn(returnSeq)
  return (
    <div>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', padding: 0, marginBottom: 20 }}>
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>{Icon.arrow(14)}</span> 반품 목록
      </button>
      {q.isPending ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>반품 상세를 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data ? (
        <EmptyState message="반품 내역을 찾을 수 없습니다." />
      ) : (
        <RDetail r={q.data} />
      )}
    </div>
  )
}

function RDetail({ r }: { r: ReturnDetailVM }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 16, borderBottom: '2px solid var(--plum-800)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', background: 'var(--plum-100)', color: 'var(--plum-700)' }}>{r.typeLabel}</span>
            <span style={{ fontFamily: 'var(--serif-en)', fontSize: 17, color: 'var(--plum-800)' }}>{r.returnNo}</span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>주문 {r.orderNo} · 신청일 {r.requestedDate}</div>
        </div>
        <span style={statusStyle(r.statusLabel)}>{r.statusLabel}</span>
      </div>

      <Sec title="신청 상품">
        <div style={{ background: '#fff', border: '1px solid var(--line)' }}>
          {r.items.map((it, i) => (
            <div key={it.returnItemSeq} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: i < r.items.length - 1 ? '1px solid var(--line)' : 'none', fontSize: 13.5 }}>
              <div>
                <span style={{ color: 'var(--plum-800)' }}>{it.productName}</span> <span style={{ color: 'var(--muted)' }}>{it.optionName} · {it.quantity}개</span>
                {it.exchangeOptionName && <span style={{ color: 'var(--plum-600)' }}> → 교환: {it.exchangeOptionName}</span>}
              </div>
              <span style={{ fontFamily: 'var(--serif-en)', color: 'var(--plum-800)' }}>{won(it.unitPrice)}</span>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="신청 정보">
        <div style={{ background: '#fff', border: '1px solid var(--line)', padding: 18, fontSize: 13.5, lineHeight: 1.9 }}>
          <Row label="사유" value={`${r.reasonLabel}${r.returnReason ? ` · ${r.returnReason}` : ''}`} />
          {(r.pickupZipCode || r.pickupAddress) && <Row label="회수지" value={`(${r.pickupZipCode ?? ''}) ${r.pickupAddress ?? ''} ${r.pickupAddressDetail ?? ''}`.trim()} />}
          {r.pickupPhone && <Row label="회수 연락처" value={r.pickupPhone} />}
          {r.completedDate && <Row label="완료일" value={r.completedDate} />}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Row label="반품 배송비" value={r.returnShippingFee === 0 ? '무료' : won(r.returnShippingFee)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--plum-800)' }}>환불 예정 금액</span>
              <span style={{ fontFamily: 'var(--serif-en)', fontSize: 20, color: 'var(--plum-800)', fontWeight: 600 }}>{won(r.refundAmount)}</span>
            </div>
          </div>
        </div>
      </Sec>
    </div>
  )
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 15, color: 'var(--plum-800)', marginBottom: 12 }}>{title}</div>
      {children}
    </section>
  )
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <span style={{ flex: '0 0 86px', color: 'var(--muted)', fontSize: 12.5 }}>{label}</span>
      <span style={{ color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}
