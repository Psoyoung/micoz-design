// 마이페이지 · 주문 내역 — Phase 4c: mock ORDERS → 실 API(GET /me/orders, /me/orders/{seq}).
// 데스크탑/모바일 공용. 목록(카드) → 상세(아이템 스냅샷·배송·결제). 로딩/에러/빈 상태.
import { useState, type ReactNode } from 'react'
import { won } from '../../../lib/format'
import { useAuth } from '../../../auth/AuthContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useMyOrders, useMyOrder, type OrderDetailVM } from '../../../api/myorders'
import { ErrorState, EmptyState } from '../../../components/shop/states'
import { Icon } from '../../../components/shop/icons'
import { ReviewModal, ReturnRequestModal } from './OrderActionModals'

export default function OrdersTab() {
  const [selected, setSelected] = useState<number | null>(null)
  if (selected != null) return <OrderDetail orderSeq={selected} onBack={() => setSelected(null)} />
  return <OrderList onSelect={setSelected} />
}

function statusStyle(label: string) {
  const active = label === '결제완료' || label === '배송중' || label === '준비중' || label === '출고'
  return { fontSize: 11, padding: '4px 12px', letterSpacing: '0.08em', background: active ? 'var(--plum-100)' : 'transparent', border: active ? 'none' : '1px solid var(--line-strong)', color: active ? 'var(--plum-700)' : 'var(--muted)' }
}

function OrderList({ onSelect }: { onSelect: (seq: number) => void }) {
  const { user } = useAuth()
  const q = useMyOrders(!!user)

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: '0 0 28px', color: 'var(--plum-800)' }}>주문 내역</h3>
      {q.isPending ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>주문 내역을 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState message="주문 내역이 없습니다." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {q.data.items.map((o) => (
            <button
              key={o.orderSeq}
              onClick={() => onSelect(o.orderSeq)}
              style={{ textAlign: 'left', border: '1px solid var(--line)', background: '#ffffff', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--plum-700)' }}>{o.orderNo}</span>
                  <span style={{ marginLeft: 12, fontSize: 12, color: 'var(--muted)' }}>{o.orderDate}</span>
                </div>
                <span style={statusStyle(o.statusLabel)}>{o.statusLabel}</span>
              </div>
              <div style={{ padding: '18px 20px', display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 64, height: 80, background: o.grad }} />
                <div>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: 15.5, color: 'var(--plum-800)' }}>{o.firstItemName}</div>
                  {o.totalItemCount > 1 && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>외 {o.totalItemCount - 1}개 상품</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--serif-en)', fontSize: 17, color: 'var(--plum-800)', fontWeight: 500 }}>{won(o.finalAmount)}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>상세 보기 {Icon.arrow(12)}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function OrderDetail({ orderSeq, onBack }: { orderSeq: number; onBack: () => void }) {
  const q = useMyOrder(orderSeq)

  return (
    <div>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', padding: 0, marginBottom: 20 }}>
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>{Icon.arrow(14)}</span> 주문 목록
      </button>

      {q.isPending ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>주문 상세를 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data ? (
        <EmptyState message="주문을 찾을 수 없습니다." />
      ) : (
        <Detail o={q.data} />
      )}
    </div>
  )
}

function Detail({ o }: { o: OrderDetailVM }) {
  const [reviewItem, setReviewItem] = useState<{ itemSeq: number; productName: string } | null>(null)
  const [returnOpen, setReturnOpen] = useState(false)
  const canReview = o.orderStatus === 'DELIVERED'
  const canCancel = o.orderStatus === 'PAID' || o.orderStatus === 'PREPARING'
  const canReturnExchange = o.orderStatus === 'DELIVERED'
  const canReturn = canCancel || canReturnExchange
  const returnLabel = canReturnExchange ? '반품 · 교환 신청' : '주문 취소'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 주문 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 16, borderBottom: '2px solid var(--plum-800)' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 18, color: 'var(--plum-800)' }}>{o.orderNo}</div>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 6 }}>{o.orderDate}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {canReturn && (
            <button onClick={() => setReturnOpen(true)} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid var(--plum-700)', color: 'var(--plum-700)', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }}>{returnLabel}</button>
          )}
          <span style={statusStyle(o.statusLabel)}>{o.statusLabel}</span>
        </div>
      </div>

      {/* 주문 상품 (스냅샷) */}
      <Section title="주문 상품">
        <div style={{ background: '#fff', border: '1px solid var(--line)' }}>
          {o.items.map((it, i) => (
            <div key={it.itemSeq} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, alignItems: 'center', padding: '14px 16px', borderBottom: i < o.items.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ width: 60, height: 74, background: it.grad }} />
              <div>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--plum-800)' }}>{it.productName}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{it.optionName}{it.optionName ? ' · ' : ''}{it.quantity}개</div>
                {canReview && (
                  <button onClick={() => setReviewItem({ itemSeq: it.itemSeq, productName: it.productName })} style={{ marginTop: 8, padding: '5px 12px', background: 'transparent', border: '1px solid var(--line-strong)', color: 'var(--plum-700)', cursor: 'pointer', fontSize: 11.5 }}>리뷰 작성</button>
                )}
              </div>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 15, color: 'var(--plum-800)' }}>{won(it.itemAmount)}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* 배송 정보 */}
      {o.shipping && (
        <Section title="배송 정보">
          <div style={{ background: '#fff', border: '1px solid var(--line)', padding: 18, fontSize: 13.5, lineHeight: 1.9, color: 'var(--ink)' }}>
            <InfoRow label="배송 상태" value={o.shipping.statusLabel} accent />
            <InfoRow label="수령인" value={`${o.shipping.recipientName} · ${o.shipping.recipientPhone}`} />
            <InfoRow label="주소" value={`(${o.shipping.zipCode}) ${o.shipping.address} ${o.shipping.addressDetail ?? ''}`} />
            {o.shipping.shippingMemo && <InfoRow label="요청사항" value={o.shipping.shippingMemo} />}
            {o.shipping.trackingNo && <InfoRow label="운송장" value={o.shipping.trackingNo} />}
            {o.shipping.shippedDate && <InfoRow label="출고일" value={o.shipping.shippedDate} />}
            {o.shipping.deliveredDate && <InfoRow label="배송완료" value={o.shipping.deliveredDate} />}
          </div>
        </Section>
      )}

      {/* 결제 정보 — PAID 인 것만 노출 */}
      <Section title="결제 정보">
        <div style={{ background: '#fff', border: '1px solid var(--line)', padding: 18, fontSize: 13.5, lineHeight: 1.9 }}>
          {o.payment ? (
            <>
              <InfoRow label="결제 수단" value={`${o.payment.typeLabel}${o.payment.installment && o.payment.installment > 0 ? ` (${o.payment.installment}개월)` : ''}`} />
              {o.payment.cardNoMasked && <InfoRow label="카드 번호" value={`${o.payment.cardCompany ?? ''} ${o.payment.cardNoMasked}`.trim()} />}
              {o.payment.approvalNo && <InfoRow label="승인 번호" value={o.payment.approvalNo} />}
              {o.payment.paidDate && <InfoRow label="결제 일시" value={o.payment.paidDate} />}
            </>
          ) : (
            <div style={{ color: 'var(--muted)' }}>결제 대기 중인 주문입니다.</div>
          )}

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <AmountRow label="상품 금액" value={won(o.itemsTotal)} />
            {o.totalDiscount > 0 && <AmountRow label="할인" value={`- ${won(o.totalDiscount)}`} accent />}
            <AmountRow label="배송비" value={o.shippingFee === 0 ? '무료' : `+ ${won(o.shippingFee)}`} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--plum-800)' }}>총 결제 금액</span>
              <span style={{ fontFamily: 'var(--serif-en)', fontSize: 22, color: 'var(--plum-800)', fontWeight: 600 }}>{won(o.finalAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--muted)' }}>
              <span>적립 예정 포인트</span>
              <span style={{ fontFamily: 'var(--serif-en)', color: 'var(--plum-700)' }}>+ {o.pointToEarn.toLocaleString('ko-KR')} P</span>
            </div>
          </div>
        </div>
      </Section>

      {reviewItem && <ReviewModal itemSeq={reviewItem.itemSeq} productName={reviewItem.productName} onClose={() => setReviewItem(null)} />}
      {returnOpen && <ReturnRequestModal order={o} onClose={() => setReturnOpen(false)} />}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 15, color: 'var(--plum-800)', marginBottom: 12 }}>{title}</div>
      {children}
    </section>
  )
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 14 }}>
      <span style={{ flex: '0 0 76px', color: 'var(--muted)', fontSize: 12.5 }}>{label}</span>
      <span style={{ color: accent ? 'var(--plum-700)' : 'var(--ink)', fontWeight: accent ? 600 : 400 }}>{value}</span>
    </div>
  )
}

function AmountRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--serif-en)', color: accent ? '#c14b3a' : 'var(--ink)' }}>{value}</span>
    </div>
  )
}
