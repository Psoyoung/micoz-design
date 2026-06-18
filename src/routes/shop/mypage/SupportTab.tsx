// 마이페이지 · 1:1 문의 — Phase 5c: mock → 실 API. 목록(GET /me/inquiries) → 상세(답변 포함) + 작성(POST).
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useMyInquiries, useMyInquiry, useCreateInquiry, inquiryErrorMessage, type InquiryDetailVM } from '../../../api/inquiries'
import { INQUIRY_TYPE_LABEL, type InquiryType } from '../../../lib/data'
import { ErrorState, EmptyState } from '../../../components/shop/states'
import { Icon } from '../../../components/shop/icons'
import { MpField, MpInput, ModalClose, useModalDismiss, mypagePrimaryBtn, mypageGhostBtn, mypageSelect, mypageBackdrop, mypageModal, mypageModalHead, mypageModalKicker, mypageModalTitle, mypageModalFoot } from './mypage-ui'

export default function SupportTab() {
  const [selected, setSelected] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: 0, color: 'var(--plum-800)' }}>1:1 문의</h3>
        {selected == null && <button onClick={() => setOpen(true)} style={mypagePrimaryBtn}>새 문의 작성</button>}
      </div>

      {selected != null ? <InquiryDetail inquirySeq={selected} onBack={() => setSelected(null)} /> : <InquiryList onSelect={setSelected} />}

      {open && <InquiryFormModal onClose={() => setOpen(false)} />}
    </div>
  )
}

function statusStyle(label: string) {
  const done = label === '답변완료'
  return { fontSize: 11, padding: '3px 10px', background: done ? 'var(--plum-100)' : 'transparent', border: done ? 'none' : '1px solid var(--line-strong)', color: done ? 'var(--plum-700)' : 'var(--muted)', letterSpacing: '0.06em' }
}

function InquiryList({ onSelect }: { onSelect: (seq: number) => void }) {
  const { user } = useAuth()
  const q = useMyInquiries(!!user)

  if (q.isPending) return <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>문의 내역을 불러오는 중…</div>
  if (q.isError) return <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
  if (!q.data || q.data.items.length === 0) return <EmptyState message="접수된 문의가 없습니다." />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {q.data.items.map((iq) => (
        <button key={iq.inquirySeq} onClick={() => onSelect(iq.inquirySeq)} style={{ all: 'unset', cursor: 'pointer', display: 'block', padding: '20px 24px', background: 'var(--paper)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--serif-en)', fontSize: 12, color: 'var(--plum-700)', letterSpacing: '0.06em' }}>{iq.inquiryNo}</span>
            <span style={statusStyle(iq.statusLabel)}>{iq.statusLabel}</span>
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 16.5, color: 'var(--plum-800)', fontWeight: 500 }}>{iq.title}</div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 14 }}>
            <span>{iq.typeLabel}</span>
            <span style={{ fontFamily: 'var(--serif-en)', letterSpacing: '0.04em' }}>{iq.createdDate}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

function InquiryDetail({ inquirySeq, onBack }: { inquirySeq: number; onBack: () => void }) {
  const q = useMyInquiry(inquirySeq)
  return (
    <div>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', padding: 0, marginBottom: 20 }}>
        <span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}>{Icon.arrow(14)}</span> 문의 목록
      </button>
      {q.isPending ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>문의 상세를 불러오는 중…</div>
      ) : q.isError ? (
        <ErrorState message={catalogErrorMessage(q.error)} onRetry={() => q.refetch()} />
      ) : !q.data ? (
        <EmptyState message="문의를 찾을 수 없습니다." />
      ) : (
        <IDetail iq={q.data} />
      )}
    </div>
  )
}

function IDetail({ iq }: { iq: InquiryDetailVM }) {
  return (
    <div>
      <div style={{ paddingBottom: 16, borderBottom: '2px solid var(--plum-800)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 11, padding: '3px 10px', background: 'var(--plum-100)', color: 'var(--plum-700)' }}>{iq.typeLabel}</span>
          <span style={{ fontFamily: 'var(--serif-en)', fontSize: 12, color: 'var(--plum-700)' }}>{iq.inquiryNo}</span>
          <span style={{ marginLeft: 'auto', ...statusStyle(iq.statusLabel) }}>{iq.statusLabel}</span>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--plum-800)', fontWeight: 500 }}>{iq.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{iq.createdDate}</div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.28em', color: 'var(--muted)', marginBottom: 10 }}>QUESTION</div>
        <div style={{ padding: 20, background: '#faf7fc', border: '1px solid var(--line)', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>{iq.content}</div>
      </div>

      {iq.replies.length > 0 ? (
        iq.replies.map((r) => (
          <div key={r.replySeq} style={{ marginTop: 22 }}>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.28em', color: 'var(--plum-700)', marginBottom: 10 }}>ANSWER · MICOZ</div>
            <div style={{ padding: 20, background: 'var(--paper)', border: '1px solid var(--plum-200)', fontSize: 14, lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--ink)' }}>
              {r.content}
              <div style={{ marginTop: 12, fontSize: 11.5, color: 'var(--muted)' }}>{r.createdDate}</div>
            </div>
          </div>
        ))
      ) : (
        <div style={{ marginTop: 22, padding: 18, border: '1px dashed var(--line-strong)', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>답변 대기 중입니다. 영업일 기준 24시간 이내에 답변드립니다.</div>
      )}
    </div>
  )
}

function InquiryFormModal({ onClose }: { onClose: () => void }) {
  const { show } = useToast()
  const createM = useCreateInquiry()
  const [type, setType] = useState<InquiryType>('PRODUCT')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  useModalDismiss(onClose)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      show('제목과 내용을 입력해주세요.')
      return
    }
    try {
      await createM.mutateAsync({ inquiryType: type, title: title.trim(), content: content.trim() })
      show('문의가 접수되었습니다.')
      onClose()
    } catch (err) {
      show(inquiryErrorMessage(err))
    }
  }

  return (
    <div onClick={onClose} style={mypageBackdrop}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...mypageModal, width: 'min(620px, 100%)' }}>
        <div style={mypageModalHead}>
          <div>
            <div style={mypageModalKicker}>NEW INQUIRY</div>
            <div style={mypageModalTitle}>새 문의 작성</div>
          </div>
          <ModalClose onClose={onClose} />
        </div>
        <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MpField label="문의 유형">
            <select value={type} onChange={(e) => setType(e.target.value as InquiryType)} style={mypageSelect}>
              {(Object.keys(INQUIRY_TYPE_LABEL) as InquiryType[]).map((t) => (
                <option key={t} value={t}>{INQUIRY_TYPE_LABEL[t]}</option>
              ))}
            </select>
          </MpField>
          <MpField label="제목"><MpInput value={title} onChange={setTitle} placeholder="예: 환불 처리 진행 상황 문의" /></MpField>
          <MpField label="내용">
            <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="문의 내용을 상세히 입력해주세요" style={{ width: '100%', minHeight: 160, padding: '12px 14px', border: '1px solid var(--line-strong)', background: 'var(--paper)', fontFamily: 'var(--sans)', fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)', outline: 'none', resize: 'vertical' }} />
          </MpField>
        </div>
        <div style={mypageModalFoot}>
          <button type="button" onClick={onClose} style={mypageGhostBtn}>취소</button>
          <button type="submit" style={{ ...mypagePrimaryBtn, opacity: createM.isPending ? 0.6 : 1 }} disabled={createM.isPending}>{createM.isPending ? '접수 중…' : '접수하기'}</button>
        </div>
      </form>
    </div>
  )
}
