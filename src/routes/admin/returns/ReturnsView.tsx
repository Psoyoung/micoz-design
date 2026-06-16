// 관리자 반품·교환 관리 — 출처: 원본 admin/admin-views-2.jsx ReturnsView/ReturnDetailModal/KVCol/nextReturnStep
// lib/data RETURNS(ReturnRequest). type/status/reasonType 는 enums 라벨맵으로 표기.
// 상태 전이(신청→승인→회수중→검수중→완료 / 반려)는 로컬 목업 변이(실제 PATCH 는 API 단계).
import { useState, type CSSProperties } from 'react'
import {
  RETURNS,
  RETURN_TYPE_LABEL,
  RETURN_STATUS_LABEL,
  RETURN_REASON_LABEL,
  type ReturnRequest,
  type ReturnStatus,
  type ReturnType,
} from '../../../lib/data'
import { wonCompact } from '../../../lib/format'
import Card from '../../../components/admin/Card'
import Stat from '../../../components/admin/Stat'
import { FilterBar } from '../../../components/admin/filters'
import AdminDropdown from '../../../components/admin/AdminDropdown'
import AdminBtn from '../../../components/admin/AdminBtn'
import DataTable, { type Column } from '../../../components/admin/DataTable'
import { StatusChip } from '../../../components/admin/chips'
import KVCol from '../../../components/admin/KVCol'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }

// 유형별 색 — 원본 typeColor (코드 키로 보존)
const TYPE_COLOR: Record<ReturnType, string> = { CANCEL: '#a85050', EXCHANGE: '#6b4d8f', RETURN: '#c08a3a' }

// 현재 상태에서 진행 가능한 다음 단계 (원본 nextReturnStep — 코드 기반)
function nextReturnStep(status: ReturnStatus): { label: string; next: ReturnStatus } | null {
  switch (status) {
    case 'REQUESTED':
      return { label: '신청 승인', next: 'APPROVED' }
    case 'APPROVED':
      return { label: '회수 시작', next: 'COLLECTED' }
    case 'COLLECTED':
      return { label: '검수 시작', next: 'INSPECTED' }
    case 'INSPECTED':
      return { label: '환불·교환 완료', next: 'COMPLETED' }
    default:
      return null // 완료 / 반려 = 종료
  }
}

const STATUS_OPTS = [
  { k: 'all', l: '전체' },
  { k: 'REQUESTED', l: '신청' },
  { k: 'APPROVED', l: '승인' },
  { k: 'COLLECTED', l: '회수중' },
  { k: 'INSPECTED', l: '검수중' },
  { k: 'COMPLETED', l: '완료' },
  { k: 'REJECTED', l: '반려' },
]
const TYPE_OPTS = [
  { k: 'all', l: '전체' },
  { k: 'CANCEL', l: '취소' },
  { k: 'EXCHANGE', l: '교환' },
  { k: 'RETURN', l: '반품' },
]

export default function ReturnsView() {
  const [rows, setRows] = useState<ReturnRequest[]>(RETURNS.map((r) => ({ ...r })))
  const [statusF, setStatusF] = useState('all')
  const [typeF, setTypeF] = useState('all')
  const [openNo, setOpenNo] = useState<string | null>(null)

  const filtered = rows.filter((r) => {
    if (statusF !== 'all' && r.status !== statusF) return false
    if (typeF !== 'all' && r.type !== typeF) return false
    return true
  })

  const counts = {
    req: rows.filter((r) => r.status === 'REQUESTED').length,
    proc: rows.filter((r) => (['APPROVED', 'COLLECTED', 'INSPECTED'] as ReturnStatus[]).includes(r.status)).length,
    done: rows.filter((r) => r.status === 'COMPLETED').length,
    rej: rows.filter((r) => r.status === 'REJECTED').length,
  }

  // 상태 전이 (목업) — 완료/반려 시 완료일 확정
  const applyStatus = (returnNo: string, next: ReturnStatus) => {
    setRows((prev) =>
      prev.map((r) =>
        r.returnNo === returnNo
          ? { ...r, status: next, completedDate: next === 'COMPLETED' || next === 'REJECTED' ? r.completedDate || '방금 전' : r.completedDate }
          : r,
      ),
    )
  }

  const openRow = rows.find((r) => r.returnNo === openNo) || null

  const columns: Column<ReturnRequest>[] = [
    { key: 'returnNo', label: '신청번호', mono: true, nowrap: true, render: (v) => <span style={{ color: '#3a2552', fontWeight: 500 }}>{v as string}</span> },
    { key: 'orderNo', label: '주문번호', mono: true, muted: true, nowrap: true },
    { key: 'customerName', label: '고객' },
    { key: 'type', label: '유형', render: (v) => <span style={{ fontSize: 11.5, fontWeight: 500, color: TYPE_COLOR[v as ReturnType] || 'var(--ad-ink)', whiteSpace: 'nowrap' }}>{RETURN_TYPE_LABEL[v as ReturnType]}</span> },
    { key: 'reasonType', label: '사유', nowrap: true, render: (v) => RETURN_REASON_LABEL[v as keyof typeof RETURN_REASON_LABEL] },
    { key: 'refundAmount', label: '환불 예정', align: 'right', mono: true, nowrap: true, render: (v) => ((v as number) > 0 ? wonCompact(v as number) : '—') },
    { key: 'requestedDate', label: '신청일시', mono: true, muted: true, nowrap: true },
    { key: 'status', label: '상태', render: (v) => <StatusChip status={RETURN_STATUS_LABEL[v as ReturnStatus]} /> },
  ]

  return (
    <div style={pageWrap}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
        <Stat label="신규 신청" value={counts.req + '건'} sub="확인 대기" accent="#c08a3a" />
        <Stat label="처리중" value={counts.proc + '건'} sub="승인·회수·검수" accent="#6b4d8f" />
        <Stat label="완료" value={counts.done + '건'} sub="환불·교환 완료" accent="#3a8a5a" />
        <Stat label="반려" value={counts.rej + '건'} sub="처리 불가 안내" accent="#a85050" />
      </div>

      <Card title="반품 · 교환 신청" subtitle="RETURNS & EXCHANGES" padding={0}>
        <FilterBar>
          <AdminDropdown value={statusF} onChange={setStatusF} options={STATUS_OPTS} width={150} />
          <AdminDropdown value={typeF} onChange={setTypeF} options={TYPE_OPTS} width={130} />
        </FilterBar>
        <DataTable columns={columns} rows={filtered} rowKey="returnNo" onRowClick={(r) => setOpenNo(r.returnNo)} />
      </Card>

      <ReturnDetailModal item={openRow} onClose={() => setOpenNo(null)} onSetStatus={applyStatus} />
    </div>
  )
}

// ─── 반품 상세 모달 ───
function ReturnDetailModal({ item, onClose, onSetStatus }: { item: ReturnRequest | null; onClose: () => void; onSetStatus: (returnNo: string, next: ReturnStatus) => void }) {
  useModalDismiss(onClose, !!item)
  if (!item) return null

  const step = nextReturnStep(item.status)
  const terminal = item.status === 'COMPLETED' || item.status === 'REJECTED'
  const act = (next: ReturnStatus) => {
    onSetStatus(item.returnNo, next)
    onClose()
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', width: 'min(760px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>RETURN DETAIL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: '#3a2552', fontWeight: 500 }}>{item.returnNo}</span>
              <StatusChip status={RETURN_STATUS_LABEL[item.status]} />
              <span style={{ fontSize: 11.5, fontWeight: 500, padding: '2px 10px', background: 'var(--ad-paper-2)', border: '1px solid var(--ad-line-strong)' }}>{RETURN_TYPE_LABEL[item.type]}</span>
            </div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 26, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, padding: '4px 0 18px', borderBottom: '1px solid var(--ad-line)' }}>
            <KVCol label="고객" value={item.customerName} />
            <KVCol label="원주문" value={item.orderNo} mono />
            <KVCol label="사유 유형" value={RETURN_REASON_LABEL[item.reasonType]} />
            <KVCol label="신청일시" value={item.requestedDate} mono />
            <KVCol label="완료일시" value={item.completedDate || '—'} mono />
            <KVCol label="반품 배송비" value={item.returnShippingFee > 0 ? wonCompact(item.returnShippingFee) : '—'} mono />
          </div>

          {/* 대상 상품 */}
          <div style={{ marginTop: 18, fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>대상 상품</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{item.productName}</div>
              <div style={{ fontSize: 11.5, color: 'var(--ad-muted)', marginTop: 3 }}>옵션 {item.optionName} · 수량 {item.quantity}개</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.12em' }}>환불 예정</div>
              <div style={{ fontFamily: 'var(--serif-en)', fontSize: 18, color: 'var(--ad-ink)', marginTop: 2 }}>{item.refundAmount > 0 ? wonCompact(item.refundAmount) : '—'}</div>
            </div>
          </div>

          {/* 사유 */}
          <div style={{ marginTop: 18, padding: 16, background: 'var(--ad-paper-2)', border: '1px solid var(--ad-line)', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{item.reason}</div>

          {/* 회수지 */}
          {item.pickupAddress ? (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>회수지</div>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                ({item.pickupZipCode}) {item.pickupAddress}
                <span style={{ color: 'var(--ad-muted)', fontFamily: 'var(--mono)', marginLeft: 8 }}>{item.pickupPhone}</span>
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '14px 26px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
          <div>{!terminal && <AdminBtn variant="danger" onClick={() => act('REJECTED')}>반려</AdminBtn>}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminBtn onClick={onClose}>닫기</AdminBtn>
            {step && (
              <button type="button" onClick={() => act(step.next)} style={{ padding: '8px 18px', background: '#3a2552', color: '#f5f1ea', border: '1px solid #3a2552', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em' }}>{step.label}</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// KVCol 은 components/admin/KVCol 로 승격(문의 상세에서도 사용).
