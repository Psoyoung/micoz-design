// 모바일 주문서 — 출처: 원본 shop/screens-mobile.jsx MobileCheckout/MSection
// Phase 4b: 서버 2단계 결제(공유 useCheckout). 배송지=저장 선택 or 신규 입력, 결제수단 CARD/KAKAO/NAVER.
import { useState, type ReactNode, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { won } from '../../../lib/format'
import { useCart } from '../../../contexts/CartContext'
import { useToast } from '../../../contexts/ToastContext'
import { useAddresses } from '../../../api/addresses'
import { orderErrorMessage, type PaymentType } from '../../../api/orders'
import MobileHeader from '../../../components/shop/MobileHeader'
import { Icon } from '../../../components/shop/icons'
import { useCheckout, type ShippingTarget } from '../checkout/useCheckout'

const PAY_METHODS: [PaymentType, string][] = [
  ['CARD', '신용카드'],
  ['KAKAO', '카카오페이'],
  ['NAVER', '네이버페이'],
]
const inputStyle: CSSProperties = { width: '100%', padding: '11px 13px', background: '#fff', border: '1px solid var(--line-strong)', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink)', outline: 'none', borderRadius: 0 }
type NewAddr = { recipientName: string; recipientPhone: string; zipCode: string; address: string; addressDetail: string }

export default function MobileCheckout() {
  const navigate = useNavigate()
  const { show } = useToast()
  const { items: cart, mode, isLoading: cartLoading } = useCart()
  const addressesQ = useAddresses(true)
  const { submit, submitting } = useCheckout()

  const [pay, setPay] = useState<PaymentType>('CARD')
  const [cardNo, setCardNo] = useState('')
  const [memo, setMemo] = useState('default')
  const [agree, setAgree] = useState(false)

  const addresses = addressesQ.data ?? []
  const [addrMode, setAddrMode] = useState<'saved' | 'new'>('saved')
  const [selectedSeq, setSelectedSeq] = useState<number | null>(null)
  const [newAddr, setNewAddr] = useState<NewAddr>({ recipientName: '', recipientPhone: '', zipCode: '', address: '', addressDetail: '' })
  const effectiveMode: 'saved' | 'new' = addresses.length === 0 ? 'new' : addrMode
  const selectedAddrSeq = selectedSeq ?? addresses[0]?.id ?? null

  const sub = cart.reduce((s, i) => s + i.option.price * i.quantity, 0)
  const ship = sub >= 50000 ? 0 : 3000
  const total = sub + ship

  const placeOrder = async () => {
    let shipping: ShippingTarget
    if (effectiveMode === 'saved') {
      if (selectedAddrSeq == null) { show('배송지를 선택해주세요.'); return }
      shipping = { addressSeq: selectedAddrSeq }
    } else {
      const n = newAddr
      if (!n.recipientName.trim() || !n.recipientPhone.trim() || !n.zipCode.trim() || !n.address.trim()) { show('배송지를 입력해주세요.'); return }
      shipping = { recipientName: n.recipientName, recipientPhone: n.recipientPhone, zipCode: n.zipCode, address: n.address, addressDetail: n.addressDetail || undefined }
    }
    if (pay === 'CARD' && !cardNo.trim()) { show('카드 번호를 입력해주세요.'); return }
    try {
      const result = await submit({
        cartSeqs: cart.map((i) => Number(i.cartId)),
        clientAmount: total,
        shipping,
        shippingMemo: memo !== 'default' ? memo : undefined,
        payment: { paymentType: pay, cardNo: pay === 'CARD' ? cardNo.trim() : undefined },
      })
      navigate('/order/complete', { state: { result } })
    } catch (e) {
      show(orderErrorMessage(e))
    }
  }

  if (mode === 'server' && cartLoading) {
    return <div style={{ background: 'var(--cream)', minHeight: '100%', padding: '80px 24px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>주문 정보를 불러오는 중…</div>
  }
  if (cart.length === 0) {
    return (
      <div style={{ background: 'var(--cream)', minHeight: '100%', padding: '100px 24px', textAlign: 'center' }}>
        <MobileHeader title="주문서" onBack={() => navigate('/cart')} cart={cart} onCart={() => navigate('/cart')} />
        <div style={{ marginTop: 60, fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--plum-800)', fontWeight: 300 }}>주문할 상품이 없습니다.</div>
        <button onClick={() => navigate('/products')} style={{ marginTop: 24, padding: '13px 24px', background: 'var(--plum-700)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: 13 }}>제품 둘러보기 →</button>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100%', paddingBottom: 180 }}>
      <MobileHeader title="주문서" onBack={() => navigate('/cart')} cart={cart} onCart={() => navigate('/cart')} />

      {/* 배송지 */}
      <MSection title="배송지 정보">
        {addressesQ.isPending ? (
          <div style={{ padding: '16px 0', color: 'var(--muted)', fontSize: 13 }}>배송지를 불러오는 중…</div>
        ) : effectiveMode === 'saved' ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {addresses.map((a) => {
                const sel = selectedAddrSeq === a.id
                return (
                  <button key={a.id} onClick={() => setSelectedSeq(a.id)} style={{ textAlign: 'left', padding: 14, background: '#fff', border: `1.5px solid ${sel ? 'var(--plum-700)' : 'var(--line-strong)'}`, cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{a.recipientName} · {a.recipientPhone}</span>
                      {a.isDefault && <span style={{ padding: '2px 8px', background: 'var(--plum-700)', color: 'var(--cream)', fontSize: 10, letterSpacing: '0.12em' }}>기본</span>}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.5 }}>({a.zipCode}) {a.address} {a.addressDetail}</div>
                  </button>
                )
              })}
            </div>
            <button onClick={() => setAddrMode('new')} style={{ marginTop: 10, padding: '8px 14px', background: 'transparent', border: '1px solid var(--line-strong)', cursor: 'pointer', fontSize: 12, color: 'var(--ink)' }}>직접 입력</button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input style={inputStyle} value={newAddr.recipientName} onChange={(e) => setNewAddr((p) => ({ ...p, recipientName: e.target.value }))} placeholder="수령인" />
            <input style={inputStyle} value={newAddr.recipientPhone} onChange={(e) => setNewAddr((p) => ({ ...p, recipientPhone: e.target.value }))} placeholder="연락처 010-0000-0000" />
            <input style={inputStyle} value={newAddr.zipCode} onChange={(e) => setNewAddr((p) => ({ ...p, zipCode: e.target.value }))} placeholder="우편번호" />
            <input style={inputStyle} value={newAddr.address} onChange={(e) => setNewAddr((p) => ({ ...p, address: e.target.value }))} placeholder="주소" />
            <input style={inputStyle} value={newAddr.addressDetail} onChange={(e) => setNewAddr((p) => ({ ...p, addressDetail: e.target.value }))} placeholder="상세 주소" />
            {addresses.length > 0 && <button onClick={() => setAddrMode('saved')} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid var(--line-strong)', cursor: 'pointer', fontSize: 12, color: 'var(--ink)', alignSelf: 'flex-start' }}>저장 배송지 선택</button>}
          </div>
        )}
        <select value={memo} onChange={(e) => setMemo(e.target.value)} style={{ ...inputStyle, marginTop: 10, cursor: 'pointer' }}>
          <option value="default">배송 시 요청사항을 선택하세요</option>
          <option>문 앞에 놓아주세요</option>
          <option>경비실에 맡겨주세요</option>
          <option>직접 받겠습니다</option>
        </select>
      </MSection>

      {/* 주문 상품 */}
      <MSection title={`주문 상품 (${cart.length})`}>
        <div style={{ background: '#ffffff' }}>
          {cart.map((it, i) => (
            <div key={it.cartId} style={{ display: 'flex', gap: 12, padding: '14px 16px', borderBottom: i < cart.length - 1 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ width: 60, height: 74, background: it.product.grad, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--plum-800)', fontWeight: 500, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{it.product.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{it.option.name} · {it.quantity}개</div>
                <div style={{ marginTop: 6, fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--ink)' }}>{won(it.option.price * it.quantity)}</div>
              </div>
            </div>
          ))}
        </div>
      </MSection>

      {/* 결제 수단 */}
      <MSection title="결제 수단">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {PAY_METHODS.map(([k, l]) => {
            const sel = pay === k
            return (
              <button key={k} onClick={() => setPay(k)} style={{ padding: '14px 4px', background: sel ? 'var(--plum-700)' : '#ffffff', color: sel ? 'var(--cream)' : 'var(--ink)', border: `1px solid ${sel ? 'var(--plum-700)' : 'var(--line-strong)'}`, cursor: 'pointer', fontSize: 12.5, fontWeight: 500 }}>{l}</button>
            )
          })}
        </div>
        {pay === 'CARD' && (
          <div style={{ marginTop: 10 }}>
            <input style={{ ...inputStyle, fontFamily: 'var(--serif-en)' }} value={cardNo} onChange={(e) => setCardNo(e.target.value)} placeholder="카드번호 0000-0000-0000-0000" />
            <div style={{ marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>※ 모의 결제 — 거절 테스트: 4000-0000-0000-0002</div>
          </div>
        )}
      </MSection>

      {/* 결제 금액 */}
      <MSection title="결제 금액">
        <div style={{ background: '#ffffff', padding: '16px 18px' }}>
          {([['상품 금액', won(sub)], ['배송비', ship === 0 ? '무료' : won(ship)]] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13.5 }}>
              <span style={{ color: 'var(--muted)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--serif-en)' }}>{v}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 15, fontWeight: 500 }}>최종 결제</span>
            <span style={{ fontFamily: 'var(--serif-en)', fontSize: 22, color: 'var(--plum-800)' }}>{won(total)}</span>
          </div>
        </div>
      </MSection>

      {/* 약관 동의 */}
      <div style={{ padding: '16px 20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--ink)', cursor: 'pointer' }}>
          <span style={{ width: 18, height: 18, background: agree ? 'var(--plum-700)' : 'transparent', border: `1.5px solid ${agree ? 'var(--plum-700)' : 'var(--line-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setAgree(!agree)}>
            {agree && Icon.check(12, 'var(--cream)')}
          </span>
          개인정보 수집 · 이용 및 결제 진행에 동의합니다.
        </label>
      </div>

      {/* sticky pay button */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--cream)', borderTop: '1px solid var(--line)', padding: '14px 20px 28px', zIndex: 30 }}>
        <button
          onClick={agree && !submitting ? placeOrder : undefined}
          style={{ width: '100%', padding: '16px 0', background: agree && !submitting ? 'var(--plum-800)' : 'var(--line-strong)', color: 'var(--cream)', border: 'none', cursor: agree && !submitting ? 'pointer' : 'not-allowed', fontFamily: 'var(--sans)', fontSize: 14.5, fontWeight: 500, letterSpacing: '0.04em' }}
        >
          {submitting ? '결제 처리 중…' : `${won(total)} 결제하기`}
        </button>
      </div>
    </div>
  )
}

function MSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ padding: '12px 20px 4px' }}>
      <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 10, textTransform: 'uppercase' }}>{title}</div>
      <div style={{ marginBottom: 16 }}>{children}</div>
    </div>
  )
}
