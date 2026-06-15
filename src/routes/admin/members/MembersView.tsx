// 관리자 회원관리 — 출처: 원본 admin/admin-views-1.jsx MembersView/AddMemberModal
// lib/data MEMBERS(MemberListRow). 상태는 enums USER_STATUS_LABEL 로 한글 표기.
// (원본엔 행 상세 보기 수단이 없어 테이블 + 회원추가 모달만 — 원본 충실.)
import { useState, type CSSProperties } from 'react'
import { MEMBERS, USER_STATUS_LABEL, type MemberListRow, type UserStatus } from '../../../lib/data'
import { wonCompact } from '../../../lib/format'
import Card from '../../../components/admin/Card'
import { FilterBar } from '../../../components/admin/filters'
import AdminDropdown from '../../../components/admin/AdminDropdown'
import AdminBtn from '../../../components/admin/AdminBtn'
import DataTable, { type Column } from '../../../components/admin/DataTable'
import Pagination from '../../../components/admin/Pagination'
import { GradeChip, StatusChip } from '../../../components/admin/chips'
import { AIcon } from '../../../components/admin/icons'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }

const GRADE_OPTS = [
  { k: 'all', l: '전체 직급' },
  { k: '전무', l: '전무' },
  { k: '상무', l: '상무' },
  { k: '마스터', l: '마스터' },
  { k: '셀러', l: '셀러' },
  { k: '회원', l: '회원' },
]
const STATUS_OPTS = [
  { k: 'all', l: '전체 상태' },
  { k: 'ACTIVE', l: '활성' },
  { k: 'DORMANT', l: '휴면' },
  { k: 'WITHDRAW_REQUESTED', l: '탈퇴신청' },
]

const columns: Column<MemberListRow>[] = [
  { key: 'code', label: '회원ID', mono: true, nowrap: true, render: (v) => <span style={{ color: '#3a2552', fontWeight: 500 }}>{v as string}</span> },
  { key: 'name', label: '이름', render: (v) => <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{v as string}</span> },
  { key: 'gradeName', label: '직급', render: (v) => <GradeChip grade={v as string} /> },
  { key: 'email', label: '이메일', muted: true, mono: true },
  { key: 'phone', label: '전화', mono: true, muted: true, nowrap: true },
  { key: 'joinedDate', label: '가입일', mono: true, muted: true, nowrap: true },
  { key: 'orderCount', label: '주문', align: 'right', mono: true, render: (v) => (v as number) + '건' },
  { key: 'totalSpend', label: '누적 구매액', align: 'right', mono: true, nowrap: true, render: (v) => wonCompact(v as number) },
  { key: 'lastBuyDate', label: '최근 주문', mono: true, muted: true, nowrap: true },
  { key: 'status', label: '상태', render: (v) => <StatusChip status={USER_STATUS_LABEL[v as UserStatus]} /> },
]

export default function MembersView() {
  const [grade, setGrade] = useState('all')
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)

  const filtered = MEMBERS.filter((m) => {
    if (grade !== 'all' && m.gradeName !== grade) return false
    if (status !== 'all' && m.status !== status) return false
    const q = query.trim().toLowerCase()
    if (!q) return true
    return m.code.toLowerCase().includes(q) || m.name.toLowerCase().includes(q)
  })

  return (
    <div style={pageWrap}>
      <Card padding={0}>
        <FilterBar
          action={
            <>
              <AdminBtn icon={AIcon.download(13)} size="sm">내보내기</AdminBtn>
              <AdminBtn icon={AIcon.plus(13)} size="sm" variant="primary" onClick={() => setAddOpen(true)}>회원 추가</AdminBtn>
            </>
          }
        >
          <AdminDropdown value={grade} onChange={setGrade} options={GRADE_OPTS} width={170} />
          <AdminDropdown value={status} onChange={setStatus} options={STATUS_OPTS} width={170} />
          <span style={{ width: 1, height: 22, background: 'var(--ad-line)', margin: '0 4px' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#fff', border: '1px solid var(--ad-line-strong)', width: 280 }}>
            <span style={{ color: 'var(--ad-muted)', display: 'flex' }}>{AIcon.search(14)}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="회원 ID · 이름 검색"
              style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent', fontFamily: 'var(--sans)', fontSize: 12.5, color: 'var(--ad-ink)', minWidth: 0 }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ad-muted)', display: 'flex', padding: 0 }} title="검색어 지우기">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            )}
          </div>
        </FilterBar>

        <DataTable columns={columns} rows={filtered} rowKey="code" />
        <Pagination page={1} total={query ? filtered.length : 2971} pageSize={20} onChange={() => {}} />
      </Card>

      <AddMemberModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

// ─── 회원 추가 모달 — 출처 원본 AddMemberModal (자체 백드롭 + useModalDismiss) ───
const fieldStyle: CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--ad-line-strong)', background: '#fff', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ad-ink)', outline: 'none' }
const labelStyle: CSSProperties = { display: 'block', fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }
const GRADES = ['전무', '상무', '마스터', '셀러', '회원']

function AddMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [grade, setGrade] = useState('회원')
  const [marketing, setMarketing] = useState(true)
  useModalDismiss(onClose, open)
  if (!open) return null

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onClose() }} style={{ background: '#fff', width: 'min(560px, 100%)', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>NEW MEMBER</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ad-ink)' }}>회원 추가</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ad-ink)', flexShrink: 0 }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div style={{ padding: 26, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 18px' }}>
          <div>
            <div style={labelStyle}>아이디 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="micoz_id" autoComplete="off" required />
          </div>
          <div>
            <div style={labelStyle}>비밀번호 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input type="password" style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="••••••••" autoComplete="new-password" required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>이름 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input style={fieldStyle} placeholder="홍길동" required />
          </div>
          <div>
            <div style={labelStyle}>이메일 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input type="email" style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="name@example.com" required />
          </div>
          <div>
            <div style={labelStyle}>전화번호</div>
            <input style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="010-0000-0000" />
          </div>
          <div>
            <div style={labelStyle}>생년월일</div>
            <input style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="1990-01-01" />
          </div>
          <div>
            <div style={labelStyle}>직급</div>
            <select style={fieldStyle} value={grade} onChange={(e) => setGrade(e.target.value)}>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>주소</div>
            <input style={fieldStyle} placeholder="서울특별시 성동구 ..." />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>메모</div>
            <textarea style={{ ...fieldStyle, minHeight: 72, resize: 'vertical', fontFamily: 'var(--sans)' }} placeholder="고객 응대 시 참고할 내용" />
          </div>
          <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--ad-ink)', cursor: 'pointer' }}>
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            마케팅 정보 수신에 동의 (이메일 · SMS)
          </label>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 26px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
          <AdminBtn onClick={onClose}>취소</AdminBtn>
          <button type="submit" style={{ padding: '8px 18px', background: '#3a2552', color: '#f5f1ea', border: '1px solid #3a2552', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em' }}>회원 추가</button>
        </div>
      </form>
    </div>
  )
}
