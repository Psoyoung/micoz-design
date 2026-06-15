// 관리자 계정 관리 — 출처: 원본 admin/admin-views-2.jsx SettingsTeam/AddAdminModal(:2034)
// 인라인 team 데이터(:2036)를 colocate(단일 사용). 관리자 계정엔 별도 lib/data 타입이 없어 로컬 타입 정의.
// 등록 모달은 원본대로 목업(제출 시 닫기). 인라인 style·마크업 보존.
import { useState, type CSSProperties } from 'react'
import Card from '../../../components/admin/Card'
import AdminBtn from '../../../components/admin/AdminBtn'
import { AIcon } from '../../../components/admin/icons'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }
const thStyle2: CSSProperties = { padding: '12px 14px', textAlign: 'left', fontWeight: 500, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ad-muted)', fontFamily: 'var(--mono)' }
const tdStyle2: CSSProperties = { padding: '14px 14px', color: 'var(--ad-ink)' }

type TeamMember = { name: string; email: string; role: string; last: string; status: string }

const TEAM: TeamMember[] = [
  { name: '김지은', email: 'jieun.kim@micoz.kr', role: '슈퍼관리자', last: '지금 접속중', status: '활성' },
  { name: '이수영', email: 'sooyoung.lee@micoz.kr', role: '운영', last: '5분 전', status: '활성' },
  { name: '박재훈', email: 'jaehoon.park@micoz.kr', role: 'MD', last: '2시간 전', status: '활성' },
  { name: '정민아', email: 'mina.jung@micoz.kr', role: 'CS', last: '어제', status: '활성' },
  { name: '서지원', email: 'jiwon.seo@micoz.kr', role: '디자인', last: '3일 전', status: '활성' },
  { name: '한재석', email: 'jaeseok.han@micoz.kr', role: '뷰어', last: '2주 전', status: '비활성' },
]

export default function TeamView() {
  const [addOpen, setAddOpen] = useState(false)
  return (
    <div style={pageWrap}>
      <Card title="관리자 · 권한" subtitle="TEAM · 6명" padding={0} action={<AdminBtn variant="primary" icon={AIcon.plus(13)} size="sm" onClick={() => setAddOpen(true)}>관리자 등록</AdminBtn>}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--ad-paper-2)', borderBottom: '1px solid var(--ad-line)' }}>
              <th style={{ ...thStyle2, paddingLeft: 22 }}>이름</th>
              <th style={thStyle2}>이메일</th>
              <th style={thStyle2}>상태</th>
              <th style={{ ...thStyle2, paddingRight: 22 }}></th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map((m, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--ad-line-soft)' }}>
                <td style={{ ...tdStyle2, paddingLeft: 22 }}>
                  <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{m.name}</span>
                </td>
                <td style={{ ...tdStyle2, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', fontSize: 11.5 }}>{m.email}</td>
                <td style={tdStyle2}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: m.status === '활성' ? '#3a8a5a' : 'var(--ad-muted)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.status === '활성' ? '#3a8a5a' : '#bbb' }} />
                    {m.status}
                  </span>
                </td>
                <td style={{ ...tdStyle2, paddingRight: 22, textAlign: 'right' }}>
                  <AdminBtn size="sm" icon={AIcon.edit(12)}>편집</AdminBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <AddAdminModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}

// ─── 관리자 등록 모달 ───
const fieldStyle: CSSProperties = { width: '100%', padding: '10px 12px', border: '1px solid var(--ad-line-strong)', background: '#fff', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ad-ink)', outline: 'none' }
const labelStyle: CSSProperties = { display: 'block', fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 6, textTransform: 'uppercase' }
const ROLES = ['슈퍼관리자', '운영', 'MD', 'CS', '디자인', '뷰어']

function AddAdminModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [role, setRole] = useState('운영')
  const [active, setActive] = useState(true)
  useModalDismiss(onClose, open)
  if (!open) return null

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onClose() }} style={{ background: '#fff', width: 'min(540px, 100%)', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>NEW ADMIN</div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, color: 'var(--ad-ink)' }}>관리자 등록</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ad-ink)' }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 26, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 18px' }}>
          <div>
            <div style={labelStyle}>아이디 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="micoz_admin" autoComplete="off" required />
          </div>
          <div>
            <div style={labelStyle}>비밀번호 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input type="password" style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="••••••••" autoComplete="new-password" required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>이름 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input style={fieldStyle} placeholder="홍길동" required />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>이메일 <span style={{ color: '#a05a5a' }}>*</span></div>
            <input type="email" style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="name@micoz.kr" required />
          </div>
          <div>
            <div style={labelStyle}>전화번호</div>
            <input style={{ ...fieldStyle, fontFamily: 'var(--mono)' }} placeholder="010-0000-0000" />
          </div>
          <div>
            <div style={labelStyle}>역할</div>
            <select style={fieldStyle} value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div style={labelStyle}>메모</div>
            <textarea style={{ ...fieldStyle, minHeight: 64, resize: 'vertical' }} placeholder="담당 업무, 입사일 등" />
          </div>
          <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--ad-ink)', cursor: 'pointer' }}>
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            등록 즉시 활성화
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '16px 26px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
          <AdminBtn onClick={onClose}>취소</AdminBtn>
          <button type="submit" style={{ padding: '8px 18px', background: '#3a2552', color: '#f5f1ea', border: '1px solid #3a2552', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em' }}>관리자 등록</button>
        </div>
      </form>
    </div>
  )
}
