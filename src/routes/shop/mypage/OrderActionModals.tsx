// 주문 상세에서 여는 리뷰 작성 / 반품·취소·교환 신청 모달 — Phase 5b.
// 둘 다 주문 아이템(itemSeq) 파생: 리뷰는 DELIVERED 아이템, 반품은 상태별(취소=PAID/PREPARING, 반품·교환=DELIVERED).
import { useState, type FormEvent } from 'react'
import { useToast } from '../../../contexts/ToastContext'
import { won } from '../../../lib/format'
import { RETURN_TYPE_LABEL, RETURN_REASON_LABEL, type ReturnType, type ReturnReasonType } from '../../../lib/data'
import { useProduct } from '../../../api/catalog'
import { useCreateReview, reviewErrorMessage } from '../../../api/reviews'
import { useCreateReturn, returnErrorMessage, type ReturnItemInput } from '../../../api/returns'
import type { OrderDetailVM } from '../../../api/myorders'
import { MpField, MpInput, ModalClose, useModalDismiss, mypagePrimaryBtn, mypageGhostBtn, mypageBackdrop, mypageModal, mypageModalHead, mypageModalKicker, mypageModalTitle, mypageModalFoot } from './mypage-ui'

/* ═══ 리뷰 작성 ═══════════════════════════════════════════ */
export function ReviewModal({ itemSeq, productName, onClose }: { itemSeq: number; productName: string; onClose: () => void }) {
  const { show } = useToast()
  const createM = useCreateReview()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  useModalDismiss(onClose)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      show('리뷰 내용을 입력해주세요.')
      return
    }
    try {
      await createM.mutateAsync({ itemSeq, rating, title: title.trim() || undefined, content: content.trim() })
      show('리뷰가 등록되었습니다.')
      onClose()
    } catch (err) {
      show(reviewErrorMessage(err))
    }
  }

  return (
    <div onClick={onClose} style={mypageBackdrop}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...mypageModal, width: 'min(520px, 100%)' }}>
        <div style={mypageModalHead}>
          <div>
            <div style={mypageModalKicker}>REVIEW</div>
            <div style={mypageModalTitle}>리뷰 작성</div>
          </div>
          <ModalClose onClose={onClose} />
        </div>
        <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--plum-800)' }}>{productName}</div>
          <div>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>평점</div>
            <div style={{ display: 'flex', gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} type="button" onClick={() => setRating(s)} aria-label={`${s}점`} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 26, lineHeight: 1, color: s <= rating ? 'var(--plum-600)' : 'var(--line-strong)', padding: 0 }}>★</button>
              ))}
            </div>
          </div>
          <MpField label="제목 (선택)"><MpInput value={title} onChange={setTitle} placeholder="한 줄 요약" /></MpField>
          <label style={{ display: 'block' }}>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>내용</div>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} maxLength={500} rows={4} placeholder="사용 경험을 알려주세요 (최대 500자)" style={{ width: '100%', padding: '10px 12px', background: 'var(--paper)', border: '1px solid var(--line-strong)', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)', outline: 'none', resize: 'vertical' }} />
          </label>
        </div>
        <div style={mypageModalFoot}>
          <button type="button" onClick={onClose} style={mypageGhostBtn}>취소</button>
          <button type="submit" style={{ ...mypagePrimaryBtn, opacity: createM.isPending ? 0.6 : 1 }} disabled={createM.isPending}>{createM.isPending ? '등록 중…' : '리뷰 등록'}</button>
        </div>
      </form>
    </div>
  )
}

/* ═══ 반품/취소/교환 신청 ═════════════════════════════════ */
type ItemSel = { checked: boolean; quantity: number; exchangeOptionSeq?: number }

export function ReturnRequestModal({ order, onClose }: { order: OrderDetailVM; onClose: () => void }) {
  const { show } = useToast()
  const createM = useCreateReturn()
  // 상태별 허용 유형: 취소=PAID/PREPARING, 반품·교환=DELIVERED
  const allowedTypes: ReturnType[] = order.orderStatus === 'DELIVERED' ? ['RETURN', 'EXCHANGE'] : ['CANCEL']
  const [type, setType] = useState<ReturnType>(allowedTypes[0])
  const [reasonType, setReasonType] = useState<ReturnReasonType>('CHANGE_OF_MIND')
  const [reason, setReason] = useState('')
  const [sel, setSel] = useState<Record<number, ItemSel>>(() =>
    Object.fromEntries(order.items.map((it) => [it.itemSeq, { checked: false, quantity: 1 }])),
  )
  // 회수지 기본값 = 주문 배송지
  const ship = order.shipping
  const [pickup, setPickup] = useState({ zipCode: ship?.zipCode ?? '', address: ship?.address ?? '', addressDetail: ship?.addressDetail ?? '', phone: ship?.recipientPhone ?? '' })
  useModalDismiss(onClose)

  const setItem = (itemSeq: number, patch: Partial<ItemSel>) => setSel((p) => ({ ...p, [itemSeq]: { ...p[itemSeq], ...patch } }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const chosen = order.items.filter((it) => sel[it.itemSeq]?.checked)
    if (chosen.length === 0) {
      show('신청할 상품을 선택해주세요.')
      return
    }
    if (type === 'EXCHANGE' && chosen.some((it) => !sel[it.itemSeq]?.exchangeOptionSeq)) {
      show('교환할 옵션을 선택해주세요.')
      return
    }
    const items: ReturnItemInput[] = chosen.map((it) => ({
      itemSeq: it.itemSeq,
      quantity: sel[it.itemSeq].quantity,
      exchangeOptionSeq: type === 'EXCHANGE' ? sel[it.itemSeq].exchangeOptionSeq : undefined,
    }))
    try {
      await createM.mutateAsync({
        orderSeq: order.orderSeq,
        body: {
          returnType: type,
          returnReasonType: reasonType,
          returnReason: reason.trim() || undefined,
          items,
          pickupZipCode: pickup.zipCode || undefined,
          pickupAddress: pickup.address || undefined,
          pickupAddressDetail: pickup.addressDetail || undefined,
          pickupPhone: pickup.phone || undefined,
        },
      })
      show(`${RETURN_TYPE_LABEL[type]} 신청이 접수되었습니다.`)
      onClose()
    } catch (err) {
      show(returnErrorMessage(err))
    }
  }

  return (
    <div onClick={onClose} style={mypageBackdrop}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...mypageModal, width: 'min(560px, 100%)', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={mypageModalHead}>
          <div>
            <div style={mypageModalKicker}>RETURN</div>
            <div style={mypageModalTitle}>취소 · 반품 · 교환 신청</div>
          </div>
          <ModalClose onClose={onClose} />
        </div>
        <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* 유형 */}
          <div>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>유형</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {allowedTypes.map((t) => (
                <button key={t} type="button" onClick={() => setType(t)} style={{ padding: '8px 18px', background: type === t ? 'var(--plum-700)' : 'transparent', color: type === t ? 'var(--cream)' : 'var(--ink)', border: `1px solid ${type === t ? 'var(--plum-700)' : 'var(--line-strong)'}`, cursor: 'pointer', fontSize: 13 }}>{RETURN_TYPE_LABEL[t]}</button>
              ))}
            </div>
          </div>

          {/* 상품 선택 */}
          <div>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>상품 선택</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((it) => {
                const s = sel[it.itemSeq]
                return (
                  <div key={it.itemSeq} style={{ border: '1px solid var(--line)', padding: 12 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input type="checkbox" checked={s.checked} onChange={(e) => setItem(it.itemSeq, { checked: e.target.checked })} />
                      <span style={{ flex: 1, fontSize: 13.5, color: 'var(--plum-800)' }}>{it.productName} <span style={{ color: 'var(--muted)' }}>{it.optionName}</span></span>
                      <span style={{ fontFamily: 'var(--serif-en)', fontSize: 13, color: 'var(--muted)' }}>{won(it.unitPrice)}</span>
                    </label>
                    {s.checked && (
                      <div style={{ marginTop: 10, paddingLeft: 28, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                        <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          수량
                          <select value={s.quantity} onChange={(e) => setItem(it.itemSeq, { quantity: Number(e.target.value) })} style={selectStyle}>
                            {Array.from({ length: it.quantity }, (_, i) => i + 1).map((q) => <option key={q} value={q}>{q}</option>)}
                          </select>
                        </label>
                        {type === 'EXCHANGE' && (
                          <ExchangeOptionField productSeq={it.productSeq} value={s.exchangeOptionSeq} onChange={(v) => setItem(it.itemSeq, { exchangeOptionSeq: v })} />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* 사유 */}
          <div>
            <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase' }}>사유</div>
            <select value={reasonType} onChange={(e) => setReasonType(e.target.value as ReturnReasonType)} style={{ ...selectStyle, width: '100%', padding: '10px 12px' }}>
              {(Object.keys(RETURN_REASON_LABEL) as ReturnReasonType[]).map((r) => <option key={r} value={r}>{RETURN_REASON_LABEL[r]}</option>)}
            </select>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="상세 사유 (선택)" style={{ width: '100%', marginTop: 8, padding: '10px 12px', background: 'var(--paper)', border: '1px solid var(--line-strong)', fontFamily: 'var(--sans)', fontSize: 13.5, color: 'var(--ink)', outline: 'none', resize: 'vertical' }} />
          </div>

          {/* 회수지 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 12px' }}>
            <MpField label="회수 우편번호"><MpInput mono value={pickup.zipCode} onChange={(v) => setPickup((p) => ({ ...p, zipCode: v }))} /></MpField>
            <MpField label="회수 연락처"><MpInput mono value={pickup.phone} onChange={(v) => setPickup((p) => ({ ...p, phone: v }))} /></MpField>
            <MpField label="회수 주소" full><MpInput value={pickup.address} onChange={(v) => setPickup((p) => ({ ...p, address: v }))} /></MpField>
            <MpField label="회수 상세 주소" full><MpInput value={pickup.addressDetail} onChange={(v) => setPickup((p) => ({ ...p, addressDetail: v }))} /></MpField>
          </div>
        </div>
        <div style={mypageModalFoot}>
          <button type="button" onClick={onClose} style={mypageGhostBtn}>취소</button>
          <button type="submit" style={{ ...mypagePrimaryBtn, opacity: createM.isPending ? 0.6 : 1 }} disabled={createM.isPending}>{createM.isPending ? '접수 중…' : '신청하기'}</button>
        </div>
      </form>
    </div>
  )
}

const selectStyle = { padding: '6px 10px', background: '#fff', border: '1px solid var(--line-strong)', fontSize: 12.5, fontFamily: 'var(--sans)', outline: 'none', borderRadius: 0, cursor: 'pointer' } as const

// 교환 대체 옵션 — 상품 옵션을 조회해 선택.
function ExchangeOptionField({ productSeq, value, onChange }: { productSeq: number; value?: number; onChange: (v: number) => void }) {
  const q = useProduct(productSeq)
  const options = q.data?.options ?? []
  return (
    <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
      교환 옵션
      <select value={value ?? ''} onChange={(e) => onChange(Number(e.target.value))} style={selectStyle} disabled={q.isPending}>
        <option value="" disabled>{q.isPending ? '불러오는 중…' : '선택'}</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
      </select>
    </label>
  )
}
