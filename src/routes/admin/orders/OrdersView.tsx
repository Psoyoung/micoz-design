// 관리자 주문관리 — 출처: 원본 admin/admin-views-2.jsx OrdersView/OrderDetailModal/KV/DateRangeField
// lib/data ORDERS(OrderListRow). 결제상태는 deriveOrderDisplayStatus(환불 파생, D-6),
//   배송상태는 deriveOrderShippingDisplay(취소/반품 null 파생), 결제수단은 paymentGroupLabel(D-6).
// 주의(원본 대비):
//   - 상단 필터 칩(전체/결제완료/…)은 원본에서 active 표시만 바꿀 뿐 테이블을 거르지 않았음 → 그대로 비기능 보존.
//   - 결제수단/배송상태 표시는 원본 문자열과 전부 일치(라벨맵·파생 정렬 완료):
//     결제수단 카드/계좌이체/간편결제, 배송상태 입금대기 주문은 '대기'·결제완료 READY 는 '준비중'.
// 상세 모달의 주문 상품 라인업은 원본대로 주문번호 시드 기반 결정적 목업.
import { useState, type CSSProperties } from 'react'
import {
  ORDERS,
  paymentGroupLabel,
  deriveOrderDisplayStatus,
  deriveOrderShippingDisplay,
  type OrderListRow,
} from '../../../lib/data'
import { wonCompact } from '../../../lib/format'
import Card from '../../../components/admin/Card'
import { FilterBar, FilterChip } from '../../../components/admin/filters'
import AdminBtn from '../../../components/admin/AdminBtn'
import DataTable, { type Column } from '../../../components/admin/DataTable'
import Pagination from '../../../components/admin/Pagination'
import { StatusChip } from '../../../components/admin/chips'
import ProductThumb from '../../../components/admin/ProductThumb'
import { AIcon } from '../../../components/admin/icons'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }

// 상단 6칸 KPI — 원본 정적 값 보존
const KPIS = [
  { label: '오늘 주문', value: '84', sub: '결제완료 78건', accent: '#3a2552' },
  { label: '결제 대기', value: '6', sub: '24h 경과 2건', accent: '#c08a3a' },
  { label: '배송 준비', value: '23', sub: '오늘 출고 대상', accent: '#6b4d8f' },
  { label: '배송 중', value: '142', sub: '평균 1.8일', accent: '#3a6dbf' },
  { label: '배송 완료', value: '2,418', sub: '이번 달 누적', accent: '#3a8a5a' },
  { label: '취소/환불', value: '12', sub: '취소율 0.8%', accent: '#a85050' },
]

const columns: Column<OrderListRow>[] = [
  { key: 'orderNo', label: '주문번호', mono: true, nowrap: true, render: (v) => <span style={{ color: '#3a2552', fontWeight: 500 }}>{v as string}</span> },
  { key: 'orderDate', label: '주문일시', mono: true, muted: true, nowrap: true },
  { key: 'customerName', label: '고객', render: (v) => <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{v as string}</span> },
  { key: 'itemCount', label: '상품', align: 'right', mono: true, render: (v) => (v as number) + '개' },
  { key: 'finalAmount', label: '결제금액', align: 'right', mono: true, nowrap: true, render: (v) => <span style={{ fontWeight: 500 }}>{wonCompact(v as number)}</span> },
  { key: 'paymentType', label: '결제수단', muted: true, render: (_v, r) => paymentGroupLabel(r.paymentType) },
  { key: 'orderStatus', label: '결제상태', render: (_v, r) => <StatusChip status={deriveOrderDisplayStatus(r)} /> },
  { key: 'shippingStatus', label: '배송상태', render: (_v, r) => <StatusChip status={deriveOrderShippingDisplay(r)} /> },
]

export default function OrdersView() {
  const [tab, setTab] = useState('all')
  const [openOrder, setOpenOrder] = useState<OrderListRow | null>(null)

  return (
    <div style={pageWrap}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
        {KPIS.map((s) => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid var(--ad-line)', padding: '16px 18px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 24, height: 2, background: s.accent }} />
            <div style={{ fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 26, marginTop: 6 }}>{s.value}<span style={{ fontSize: 13, color: 'var(--ad-muted)', marginLeft: 4 }}>건</span></div>
            <div style={{ fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <Card padding={0}>
        <FilterBar
          action={
            <>
              <AdminBtn icon={AIcon.download(13)} size="sm">송장 인쇄</AdminBtn>
              <AdminBtn icon={AIcon.download(13)} size="sm">CSV 내보내기</AdminBtn>
            </>
          }
        >
          <FilterChip label="전체" value={ORDERS.length} active={tab === 'all'} onClick={() => setTab('all')} />
          <FilterChip label="결제완료" value={11} active={tab === 'paid'} onClick={() => setTab('paid')} />
          <FilterChip label="입금대기" value={1} active={tab === 'wait'} onClick={() => setTab('wait')} />
          <FilterChip label="배송중" value={3} active={tab === 'ship'} onClick={() => setTab('ship')} />
          <FilterChip label="취소/환불" value={2} active={tab === 'cancel'} onClick={() => setTab('cancel')} />
          <span style={{ width: 1, height: 22, background: 'var(--ad-line)', margin: '0 4px' }} />
          <DateRangeField />
        </FilterBar>

        <DataTable columns={columns} rows={ORDERS} rowKey="orderNo" onRowClick={(r) => setOpenOrder(r)} />
        <Pagination page={1} total={84} pageSize={20} onChange={() => {}} />
      </Card>

      <OrderDetailModal order={openOrder} onClose={() => setOpenOrder(null)} />
    </div>
  )
}

// ─── 주문 상세 모달 ───
const POOL = [
  { sku: 'BIE-ES-050', name: '비온 에센스 50ml', price: 138000, line: '비온' },
  { sku: 'JER-SE-030', name: '제린 세럼 30ml', price: 168000, line: '제린' },
  { sku: 'LUA-CR-050', name: '루안 크림 50ml', price: 198000, line: '루안' },
  { sku: 'DAN-TO-150', name: '단아 토너 150ml', price: 78000, line: '단아' },
  { sku: 'YEO-CL-180', name: '여원 클렌저 180ml', price: 58000, line: '여원' },
  { sku: 'SOD-MS-PK5', name: '소단 마스크 5팩', price: 38000, line: '소단' },
  { sku: 'CHE-MI-080', name: '청아 미스트 80ml', price: 48000, line: '청아' },
  { sku: 'ADA-EY-020', name: '아담 아이크림 20ml', price: 128000, line: '아담' },
]

function OrderDetailModal({ order, onClose }: { order: OrderListRow | null; onClose: () => void }) {
  useModalDismiss(onClose, !!order)
  if (!order) return null

  // mock 상품 라인업 — 주문번호 끝 4자리 시드로 결정적 생성
  const seed = parseInt(order.orderNo.slice(-4), 10) || 0
  const items: Array<{ sku: string; name: string; price: number; line: string; qty: number }> = []
  for (let i = 0; i < Math.max(1, order.itemCount); i++) {
    const p = POOL[(seed + i * 3) % POOL.length]
    const qty = i === order.itemCount - 1 ? Math.max(1, order.itemCount - i) : 1
    items.push({ ...p, qty })
  }
  const subtotal = items.reduce((a, b) => a + b.price * b.qty, 0)
  const shippingFee = order.finalAmount >= 50000 ? 0 : 3000
  const discount = Math.max(0, subtotal + shippingFee - order.finalAmount)

  const summaryRows: Array<[string, string, boolean?]> = [
    ['상품금액', wonCompact(subtotal)],
    ['배송비', shippingFee === 0 ? '₩0  (무료배송)' : wonCompact(shippingFee)],
    ...(discount > 0 ? ([['쿠폰 할인', '−' + wonCompact(discount)]] as Array<[string, string]>) : []),
    ['최종 결제', wonCompact(order.finalAmount), true],
  ]

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', width: 'min(960px, 100%)', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>ORDER DETAIL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 17, fontWeight: 500, color: '#3a2552' }}>{order.orderNo}</span>
              <StatusChip status={deriveOrderDisplayStatus(order)} />
              <StatusChip status={deriveOrderShippingDisplay(order)} />
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', marginTop: 6 }}>{order.orderDate} · {order.customerName} · {paymentGroupLabel(order.paymentType)}</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ad-ink)', flexShrink: 0 }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr' }}>
          <div style={{ padding: 26, borderRight: '1px solid var(--ad-line)' }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 12, textTransform: 'uppercase' }}>주문 상품 ({order.itemCount})</div>
            {items.map((it, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--ad-line-soft)' }}>
                <ProductThumb line={it.line} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{it.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--ad-muted)', letterSpacing: '0.06em', marginTop: 2 }}>{it.sku}</div>
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 12, whiteSpace: 'nowrap' }}>{it.qty}개</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, width: 100, textAlign: 'right', whiteSpace: 'nowrap' }}>{wonCompact(it.price * it.qty)}</div>
              </div>
            ))}
            <div style={{ paddingTop: 14, marginTop: 6 }}>
              {summaryRows.map(([k, v, em], i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: em ? 14 : 12.5, fontWeight: em ? 600 : 400, borderTop: em ? '1px solid var(--ad-line)' : 'none', marginTop: em ? 8 : 0, paddingTop: em ? 12 : 6 }}>
                  <span style={{ color: em ? 'var(--ad-ink)' : 'var(--ad-muted)' }}>{k}</span>
                  <span style={{ fontFamily: 'var(--mono)', whiteSpace: 'nowrap' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: 26 }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 12, textTransform: 'uppercase' }}>배송 · 결제</div>
            <KV label="수령인" value={`${order.customerName} (010-${String(1000 + seed).slice(0, 4)}-${String(2000 + seed).slice(0, 4)})`} />
            <KV label="주소" value="서울특별시 성동구 성수이로 89, 미코즈빌딩 4층 (성수동2가)" />
            <KV label="우편번호" value="04781" mono />
            <KV label="배송 메모" value="부재 시 경비실 보관 부탁드립니다" />
            <KV label="결제수단" value={paymentGroupLabel(order.paymentType) + ' — 신한 1234-****-****-' + String(5000 + seed).slice(0, 4)} />
            <KV label="승인번호" value={'A-' + order.orderNo.replace(/-/g, '') + '-' + (1000 + seed)} mono />

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--ad-line)' }}>
              <AdminBtn variant="primary">배송 시작</AdminBtn>
              <AdminBtn>송장 출력</AdminBtn>
              <AdminBtn variant="danger">주문 취소</AdminBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', padding: '6px 0', fontSize: 12.5 }}>
      <span style={{ width: 90, color: 'var(--ad-muted)', flexShrink: 0 }}>{label}</span>
      <span style={{ flex: 1, fontFamily: mono ? 'var(--mono)' : 'var(--sans)', lineHeight: 1.5 }}>{value}</span>
    </div>
  )
}

// 원본 정적 날짜 범위 칩 보존
function DateRangeField() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#fff', border: '1px solid var(--ad-line-strong)', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--ad-ink)', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      <span style={{ whiteSpace: 'nowrap' }}>2026-05-13</span>
      <span style={{ color: 'var(--ad-muted)' }}>→</span>
      <span style={{ whiteSpace: 'nowrap' }}>2026-05-20</span>
    </div>
  )
}
