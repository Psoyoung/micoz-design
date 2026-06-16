// 관리자 1:1 문의 — 출처: 원본 admin/admin-views-2.jsx InquiriesView/InquiryDetailModal(:2340)
// 인라인 INQUIRIES 데이터를 colocate(단일 사용). lib/data 타입 Inquiry/InquiryReply 사용.
// 카테고리/상태는 코드로 저장하고 INQUIRY_TYPE_LABEL/INQUIRY_STATUS_LABEL 로 표기.
// 주의(원본 대비): 원본 INQUIRIES 는 작성자/이메일/접수일시를 함께 가졌으나 normalized Inquiry 타입엔
//   해당 필드가 없어(사용자 조인·i_date) 표시용 join 필드(author/authorId/email/receivedDate)를 더해 colocate.
//   원본 모델엔 없던 isPrivate 는 false, replies 는 [](InquiryReply[]) 로 둠. 답변 작성은 원본대로 목업.
import { useState, useEffect, type CSSProperties } from 'react'
import {
  INQUIRY_TYPE_LABEL,
  INQUIRY_STATUS_LABEL,
  type Inquiry,
  type InquiryType,
  type InquiryStatus,
} from '../../../lib/data'
import Card from '../../../components/admin/Card'
import Stat from '../../../components/admin/Stat'
import { FilterBar } from '../../../components/admin/filters'
import AdminDropdown from '../../../components/admin/AdminDropdown'
import AdminBtn from '../../../components/admin/AdminBtn'
import DataTable, { type Column } from '../../../components/admin/DataTable'
import Pagination from '../../../components/admin/Pagination'
import { StatusChip } from '../../../components/admin/chips'
import KVCol from '../../../components/admin/KVCol'
import { AIcon } from '../../../components/admin/icons'
import { useModalDismiss } from '../../../lib/useModalDismiss'

const pageWrap: CSSProperties = { padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }

// 목록 행 = normalized Inquiry + 표시용 join 필드
type InquiryRow = Inquiry & { author: string; authorId: string; email: string; receivedDate: string }

const INQUIRIES: InquiryRow[] = [
  { inquiryNo: 'Q-2641', inquiryType: 'PRODUCT', title: '비온 에센스 100ml 재입고 일정 문의', author: '박서영', authorId: 'M-24831', email: 'seoyoung.p@gmail.com', receivedDate: '2026-05-20 14:21', status: 'WAITING', isPrivate: false, replies: [], content: '안녕하세요, 비온 에센스 100ml이 품절 표시되어 있는데 다음 입고 일정이 언제쯤일지 알 수 있을까요? 알림 신청은 해두었습니다. 감사합니다.' },
  { inquiryNo: 'Q-2640', inquiryType: 'DELIVERY', title: '주문 O-58422 배송지 변경 가능한가요?', author: '이하늘', authorId: 'M-24830', email: 'haneul.lee@naver.com', receivedDate: '2026-05-20 11:48', status: 'IN_PROGRESS', isPrivate: false, replies: [], content: '아직 발송 전이라 가능하다면 배송지를 서울 → 부산으로 변경 부탁드립니다.' },
  { inquiryNo: 'Q-2639', inquiryType: 'RETURN', title: '환불 처리가 며칠째 안 되고 있어요', author: '문서아', authorId: 'M-24821', email: 'seoa.moon@gmail.com', receivedDate: '2026-05-19 22:03', status: 'IN_PROGRESS', isPrivate: false, replies: [], content: '5/15에 환불 요청을 했는데 아직 처리가 안 되어 문의드립니다. 카드사 연동 문제일까요?' },
  { inquiryNo: 'Q-2638', inquiryType: 'PRODUCT', title: '제린 세럼 사용 후 따끔거림이 있어요', author: '정유나', authorId: 'M-24828', email: 'yuna.j@daum.net', receivedDate: '2026-05-19 16:30', status: 'ANSWERED', isPrivate: false, replies: [], content: '세럼을 바른 직후 살짝 따끔거리는 느낌이 있는데 정상 반응인지 궁금합니다.' },
  { inquiryNo: 'Q-2637', inquiryType: 'ETC', title: '회원 등급 혜택을 잘 모르겠어요', author: '최민지', authorId: 'M-24829', email: 'minji.choi@kakao.com', receivedDate: '2026-05-19 10:15', status: 'ANSWERED', isPrivate: false, replies: [], content: '마스터 등급인데 받을 수 있는 혜택을 정리해서 알려주시면 감사하겠습니다.' },
  { inquiryNo: 'Q-2636', inquiryType: 'ORDER', title: '쿠폰 코드가 적용이 안 됩니다', author: '신예진', authorId: 'M-24823', email: 'yejin.shin@gmail.com', receivedDate: '2026-05-18 19:42', status: 'WAITING', isPrivate: false, replies: [], content: '"MAY-SPECIAL-15" 쿠폰을 입력하면 사용할 수 없는 쿠폰이라고 뜹니다.' },
  { inquiryNo: 'Q-2635', inquiryType: 'ETC', title: '회원 탈퇴 후 재가입은 어떻게 하나요', author: '백수민', authorId: 'M-24820', email: 'sumin.baek@naver.com', receivedDate: '2026-05-18 14:01', status: 'WAITING', isPrivate: false, replies: [], content: '예전 계정 정보로 다시 가입이 가능한지 궁금합니다.' },
]

const STATUS_OPTS = [
  { k: 'all', l: '전체 상태' },
  { k: 'WAITING', l: '대기' },
  { k: 'IN_PROGRESS', l: '진행중' },
  { k: 'ANSWERED', l: '답변완료' },
]
// 원본 카테고리 필터 순서 보존(ETC 미포함 — 원본 CATEGORIES 에 없었음)
const CAT_OPTS = [
  { k: 'all', l: '전체 카테고리' },
  ...(['PRODUCT', 'ORDER', 'DELIVERY', 'RETURN', 'ETC'] as InquiryType[]).map((t) => ({ k: t, l: INQUIRY_TYPE_LABEL[t] })),
]

const columns: Column<InquiryRow>[] = [
  { key: 'inquiryNo', label: '문의번호', mono: true, nowrap: true, render: (v) => <span style={{ color: '#3a2552', fontWeight: 500 }}>{v as string}</span> },
  { key: 'title', label: '제목', render: (v, r) => <span style={{ fontWeight: r.status === 'WAITING' ? 500 : 400, color: 'var(--ad-ink)' }}>{v as string}</span> },
  { key: 'inquiryType', label: '카테고리', render: (v) => <span style={{ padding: '3px 10px', background: '#f1edf7', color: '#4d3470', fontSize: 11.5, fontFamily: 'var(--sans)', letterSpacing: '0.02em', borderRadius: 6, whiteSpace: 'nowrap' }}>{INQUIRY_TYPE_LABEL[v as InquiryType]}</span> },
  { key: 'author', label: '작성자', render: (v, r) => (
    <div>
      <div style={{ fontSize: 12.5 }}>{v as string}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.04em', marginTop: 2 }}>{r.authorId}</div>
    </div>
  ) },
  { key: 'receivedDate', label: '접수일시', mono: true, muted: true, nowrap: true },
  { key: 'status', label: '상태', render: (v) => <StatusChip status={INQUIRY_STATUS_LABEL[v as InquiryStatus]} /> },
]

export default function InquiriesView() {
  const [status, setStatus] = useState('all')
  const [cat, setCat] = useState('all')
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = INQUIRIES.filter((q) => {
    if (status !== 'all' && q.status !== status) return false
    if (cat !== 'all' && q.inquiryType !== cat) return false
    const s = query.trim().toLowerCase()
    if (!s) return true
    return q.inquiryNo.toLowerCase().includes(s) || q.title.toLowerCase().includes(s) || q.author.toLowerCase().includes(s) || q.content.toLowerCase().includes(s)
  })

  const counts = {
    pending: INQUIRIES.filter((q) => q.status === 'WAITING').length,
    progress: INQUIRIES.filter((q) => q.status === 'IN_PROGRESS').length,
    done: INQUIRIES.filter((q) => q.status === 'ANSWERED').length,
  }

  const openInquiry = INQUIRIES.find((q) => q.inquiryNo === openId) || null

  return (
    <div style={pageWrap}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <Stat label="대기" value={counts.pending + '건'} sub="신규 접수 후 미답변" accent="#a85050" />
        <Stat label="진행중" value={counts.progress + '건'} sub="담당자 배정 · 처리중" accent="#b89968" />
        <Stat label="답변완료" value={counts.done + '건'} sub="이번 주 누적" accent="#3a2552" />
      </div>

      <Card padding={0}>
        <FilterBar action={<AdminBtn icon={AIcon.download(13)} size="sm">CSV</AdminBtn>}>
          <AdminDropdown value={status} onChange={setStatus} options={STATUS_OPTS} width={170} />
          <AdminDropdown value={cat} onChange={setCat} options={CAT_OPTS} width={200} />
          <span style={{ width: 1, height: 22, background: 'var(--ad-line)', margin: '0 4px' }} />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: '#fff', border: '1px solid var(--ad-line-strong)', width: 280 }}>
            <span style={{ color: 'var(--ad-muted)', display: 'flex' }}>{AIcon.search(14)}</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제목 · 회원명 · 본문 검색"
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

        <DataTable columns={columns} rows={filtered} rowKey="inquiryNo" onRowClick={(r) => setOpenId(r.inquiryNo)} />
        <Pagination page={1} total={filtered.length} pageSize={20} onChange={() => {}} />
      </Card>

      <InquiryDetailModal inquiry={openInquiry} onClose={() => setOpenId(null)} />
    </div>
  )
}

// ─── 문의 상세 / 답변 모달 ───
function InquiryDetailModal({ inquiry, onClose }: { inquiry: InquiryRow | null; onClose: () => void }) {
  const [reply, setReply] = useState('')
  useModalDismiss(onClose, !!inquiry)
  useEffect(() => {
    if (inquiry) setReply('') // 원본대로 모달 열릴 때 답변 초기화
  }, [inquiry])
  if (!inquiry) return null

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 10, 28, 0.55)', backdropFilter: 'blur(2px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, animation: 'modalIn .18s ease' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', width: 'min(820px, 100%)', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(15, 10, 28, 0.35)', border: '1px solid var(--ad-line-strong)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 26px', borderBottom: '1px solid var(--ad-line)' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.18em', marginBottom: 4 }}>INQUIRY DETAIL</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: '#3a2552', fontWeight: 500 }}>{inquiry.inquiryNo}</span>
              <StatusChip status={INQUIRY_STATUS_LABEL[inquiry.status]} />
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, marginTop: 10, fontWeight: 500 }}>{inquiry.title}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 32, height: 32, background: 'transparent', border: '1px solid var(--ad-line-strong)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="닫기 (Esc)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div style={{ padding: 26, overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, padding: '12px 0 18px', borderBottom: '1px solid var(--ad-line)', fontSize: 12 }}>
            <KVCol label="작성자" value={`${inquiry.author} (${inquiry.authorId})`} />
            <KVCol label="이메일" value={inquiry.email} mono />
            <KVCol label="카테고리" value={INQUIRY_TYPE_LABEL[inquiry.inquiryType]} />
            <KVCol label="접수일시" value={inquiry.receivedDate} mono />
          </div>

          <div style={{ marginTop: 20, padding: 18, background: 'var(--ad-paper-2)', border: '1px solid var(--ad-line)', fontSize: 13.5, lineHeight: 1.7, color: 'var(--ad-ink)', whiteSpace: 'pre-wrap' }}>{inquiry.content}</div>

          <div style={{ marginTop: 24, fontSize: 11, color: 'var(--ad-muted)', fontFamily: 'var(--mono)', letterSpacing: '0.14em', marginBottom: 10, textTransform: 'uppercase' }}>답변 작성</div>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="고객에게 보낼 답변을 작성하세요"
            style={{ width: '100%', minHeight: 140, padding: '12px 14px', border: '1px solid var(--ad-line-strong)', background: '#fff', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ad-ink)', lineHeight: 1.6, outline: 'none', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '14px 26px', borderTop: '1px solid var(--ad-line)', background: 'var(--ad-paper-2)' }}>
          <AdminBtn>임시저장</AdminBtn>
          <div style={{ display: 'flex', gap: 8 }}>
            <AdminBtn onClick={onClose}>닫기</AdminBtn>
            <button type="button" onClick={onClose} style={{ padding: '8px 18px', background: '#3a2552', color: '#f5f1ea', border: '1px solid #3a2552', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12.5, letterSpacing: '0.02em' }}>답변 전송</button>
          </div>
        </div>
      </div>
    </div>
  )
}
