// 쇼핑몰 주문서 작성 — 출처: 원본 shop/screens-desktop2.jsx CheckoutPage
// Phase 4b: 서버 2단계 결제(POST /orders → POST pay). 클라 buildOrder/generateOrderNo 폐기, orderNo 서버 발급.
//   배송지=4a 저장 배송지 선택 or 신규 입력. 결제수단 CARD/KAKAO/NAVER. clientAmount=sub+ship(쿠폰/포인트는 Phase 5).
import { useState, useMemo, type ReactNode, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { won } from '../../../lib/format'
import { useCart } from '../../../contexts/CartContext'
import { useAuth } from '../../../auth/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { useAddresses } from '../../../api/addresses'
import { orderErrorMessage, type PaymentType } from '../../../api/orders'
import { useIsMobile } from '../../../lib/useIsMobile'
import MobileCheckout from '../mobile/MobileCheckout'
import { Icon } from '../../../components/shop/icons'
import { useCheckout, type ShippingTarget } from './useCheckout'

const SELECT_ARROW =
  "url(\"data:image/svg+xml,%3Csvg width='12' height='8' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b5d72' fill='none' stroke-width='1.4'/%3E%3C/svg%3E\")"

const PAY_METHODS: [PaymentType, string][] = [
  ['CARD', '신용카드'],
  ['KAKAO', '카카오페이'],
  ['NAVER', '네이버페이'],
]

// 뷰포트 분기 — 한쪽 트리만 렌더
export default function CheckoutPage() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileCheckout /> : <DesktopCheckout />
}

type NewAddr = { recipientName: string; recipientPhone: string; zipCode: string; address: string; addressDetail: string }

function DesktopCheckout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { show } = useToast()
  const { items: cart, mode, isLoading: cartLoading } = useCart()
  const addressesQ = useAddresses(true)
  const { submit, submitting } = useCheckout()

  const [pay, setPay] = useState<PaymentType>('CARD')
  const [cardNo, setCardNo] = useState('')
  const [installment, setInstallment] = useState(0)
  const [shipMemo, setShipMemo] = useState('default')
  const [agree1, setAgree1] = useState(false)
  const [agree2, setAgree2] = useState(false)
  const [agreeAll, setAgreeAll] = useState(false)

  // 배송지 선택 — 저장 배송지(기본 우선) or 신규 입력
  const addresses = addressesQ.data ?? []
  const [addrMode, setAddrMode] = useState<'saved' | 'new'>('saved')
  const [selectedSeq, setSelectedSeq] = useState<number | null>(null)
  const [newAddr, setNewAddr] = useState<NewAddr>({ recipientName: '', recipientPhone: '', zipCode: '', address: '', addressDetail: '' })
  // 저장 배송지가 로드되면 기본 배송지(첫 행) 선택. 없으면 신규 입력 모드.
  const effectiveMode: 'saved' | 'new' = addresses.length === 0 ? 'new' : addrMode
  const selectedAddrSeq = selectedSeq ?? addresses[0]?.id ?? null

  const sub = cart.reduce((s, i) => s + i.option.price * i.quantity, 0)
  const ship = sub >= 50000 ? 0 : 3000
  const total = sub + ship // = clientAmount(서버 재계산값과 일치). 쿠폰/포인트 미적용(Phase 5).
  const earn = useMemo(() => Math.floor(sub * 0.05), [sub]) // 프론트 추정치(서버 적립은 결제 응답값)

  const toggleAll = () => {
    const v = !agreeAll
    setAgreeAll(v)
    setAgree1(v)
    setAgree2(v)
  }

  const placeOrder = async () => {
    // 배송지 타깃 구성
    let shipping: ShippingTarget
    if (effectiveMode === 'saved') {
      if (selectedAddrSeq == null) {
        show('배송지를 선택해주세요.')
        return
      }
      shipping = { addressSeq: selectedAddrSeq }
    } else {
      const n = newAddr
      if (!n.recipientName.trim() || !n.recipientPhone.trim() || !n.zipCode.trim() || !n.address.trim()) {
        show('배송지(수령인·연락처·우편번호·주소)를 입력해주세요.')
        return
      }
      shipping = { recipientName: n.recipientName, recipientPhone: n.recipientPhone, zipCode: n.zipCode, address: n.address, addressDetail: n.addressDetail || undefined }
    }
    if (pay === 'CARD' && !cardNo.trim()) {
      show('카드 번호를 입력해주세요.')
      return
    }
    try {
      const result = await submit({
        cartSeqs: cart.map((i) => Number(i.cartId)),
        clientAmount: total,
        shipping,
        shippingMemo: shipMemo !== 'default' ? shipMemo : undefined,
        payment: {
          paymentType: pay,
          cardNo: pay === 'CARD' ? cardNo.trim() : undefined,
          installment: pay === 'CARD' && installment > 0 ? installment : undefined,
        },
      })
      navigate('/order/complete', { state: { result } })
    } catch (e) {
      show(orderErrorMessage(e)) // 결제 거절 시 주문 PENDING 유지 → 카드 수정 후 재시도 가능
    }
  }

  // 로딩/빈 카트
  if (mode === 'server' && cartLoading) {
    return <main style={{ background: 'var(--cream)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 14 }}>주문 정보를 불러오는 중…</main>
  }
  if (cart.length === 0) {
    return (
      <main style={{ background: 'var(--cream)', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: '120px 56px' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 22, color: 'var(--plum-800)', fontWeight: 300 }}>주문할 상품이 없습니다.</div>
        <button onClick={() => navigate('/products')} style={{ padding: '14px 28px', background: 'var(--plum-700)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.04em' }}>제품 둘러보기 →</button>
      </main>
    )
  }

  return (
    <main style={{ background: 'var(--cream)', minHeight: '100vh' }}>
      <section style={{ padding: '60px 56px 0', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 36, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>주문서 작성</h1>
        </div>
      </section>

      <section style={{ padding: '60px 56px 120px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* LEFT — form sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {/* 주문자 정보 — 현재 사용자(표시용) */}
            <FormSection title="주문자 정보">
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 14, columnGap: 24, fontSize: 14, alignItems: 'center' }}>
                <FormLabel>이름</FormLabel>
                <CKInput defaultValue={user?.name ?? ''} />
                <FormLabel>휴대폰</FormLabel>
                <CKInput defaultValue={user?.phone ?? ''} placeholder="010-0000-0000" />
                <FormLabel>이메일</FormLabel>
                <CKInput defaultValue={user?.email ?? ''} placeholder="email@micoz.com" />
              </div>
            </FormSection>

            {/* 배송지 정보 — 저장 배송지 선택 or 신규 입력 */}
            <FormSection title="배송지 정보" action={addresses.length > 0 ? (effectiveMode === 'saved' ? '직접 입력' : '저장 배송지') : undefined} onAction={() => setAddrMode((m) => (m === 'saved' ? 'new' : 'saved'))}>
              {addressesQ.isPending ? (
                <div style={{ padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>배송지를 불러오는 중…</div>
              ) : effectiveMode === 'saved' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {addresses.map((a) => {
                    const sel = selectedAddrSeq === a.id
                    return (
                      <button
                        key={a.id}
                        onClick={() => setSelectedSeq(a.id)}
                        style={{ textAlign: 'left', padding: 20, border: `1.5px solid ${sel ? 'var(--plum-700)' : 'var(--line-strong)'}`, background: sel ? 'var(--paper)' : '#fff', cursor: 'pointer' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          {a.isDefault && <span style={{ padding: '3px 10px', background: 'var(--plum-700)', color: 'var(--cream)', fontSize: 11, letterSpacing: '0.12em' }}>기본 배송지</span>}
                          <span style={{ fontFamily: 'var(--serif)', fontSize: 15, fontWeight: 500, color: 'var(--plum-800)' }}>{a.recipientName}</span>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>· {a.recipientPhone}</span>
                          {sel && <span style={{ marginLeft: 'auto' }}>{Icon.check(16, 'var(--plum-700)')}</span>}
                        </div>
                        <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6 }}>({a.zipCode}) {a.address} {a.addressDetail}</div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
                  <CKField label="수령인"><CKInput value={newAddr.recipientName} onChange={(v) => setNewAddr((p) => ({ ...p, recipientName: v }))} placeholder="이름" /></CKField>
                  <CKField label="연락처"><CKInput value={newAddr.recipientPhone} onChange={(v) => setNewAddr((p) => ({ ...p, recipientPhone: v }))} placeholder="010-0000-0000" /></CKField>
                  <CKField label="우편번호"><CKInput value={newAddr.zipCode} onChange={(v) => setNewAddr((p) => ({ ...p, zipCode: v }))} placeholder="04781" /></CKField>
                  <div />
                  <CKField label="주소" full><CKInput value={newAddr.address} onChange={(v) => setNewAddr((p) => ({ ...p, address: v }))} placeholder="기본 주소" /></CKField>
                  <CKField label="상세 주소" full><CKInput value={newAddr.addressDetail} onChange={(v) => setNewAddr((p) => ({ ...p, addressDetail: v }))} placeholder="동/호수, 상세 주소" /></CKField>
                </div>
              )}
            </FormSection>

            {/* 배송 요청 사항 */}
            <FormSection title="배송 요청 사항">
              <select
                value={shipMemo}
                onChange={(e) => setShipMemo(e.target.value)}
                style={{ width: '100%', padding: '14px 16px', background: 'var(--paper)', border: '1px solid var(--line-strong)', fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink)', outline: 'none', borderRadius: 0, cursor: 'pointer', appearance: 'none', backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 18px center' }}
              >
                <option value="default">배송 요청 사항 선택</option>
                <option>문 앞에 놓아주세요</option>
                <option>경비실에 맡겨주세요</option>
                <option>택배함에 넣어주세요</option>
                <option>배송 전 연락 바랍니다</option>
                <option>직접 받겠습니다 (부재 시 재방문)</option>
              </select>
            </FormSection>

            {/* 주문 상품 */}
            <FormSection title={`주문 상품 (${cart.length})`}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 140px', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--line-strong)', fontFamily: 'var(--serif-en)', fontSize: 11, color: 'var(--muted)', letterSpacing: '0.2em' }}>
                <span>상품 정보</span>
                <span></span>
                <span style={{ textAlign: 'center' }}>수량</span>
                <span style={{ textAlign: 'right' }}>판매 금액</span>
              </div>
              {cart.map((it) => {
                const lineTotal = it.option.price * it.quantity
                return (
                  <div key={it.cartId} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 80px 140px', gap: 16, padding: '24px 0', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ width: 100, height: 124, background: it.product.grad }} />
                    <div>
                      <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 6 }}>{(it.product.line ?? '').toUpperCase()}</div>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400, color: 'var(--plum-800)', marginBottom: 4 }}>{it.product.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{it.option.name}</div>
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--ink)' }}>{it.quantity}</div>
                    <div style={{ textAlign: 'right', fontFamily: 'var(--serif-en)', fontSize: 16, color: 'var(--plum-800)', fontWeight: 500 }}>{won(lineTotal)}</div>
                  </div>
                )
              })}
            </FormSection>

            {/* 결제 수단 — CARD / KAKAO / NAVER */}
            <FormSection title="결제 수단">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {PAY_METHODS.map(([k, l]) => {
                  const sel = pay === k
                  return (
                    <button
                      key={k}
                      onClick={() => setPay(k)}
                      style={{ padding: '18px 12px', background: sel ? 'var(--plum-700)' : 'var(--paper)', color: sel ? 'var(--cream)' : 'var(--ink)', border: `1px solid ${sel ? 'var(--plum-700)' : 'var(--line-strong)'}`, cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 13, fontWeight: sel ? 600 : 400, transition: 'all .2s' }}
                    >
                      {l}
                    </button>
                  )
                })}
              </div>

              {pay === 'CARD' && (
                <div style={{ marginTop: 20, padding: 24, background: 'var(--paper)', border: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 14, columnGap: 24, alignItems: 'center' }}>
                  <FormLabel>카드 번호</FormLabel>
                  <CKInput value={cardNo} onChange={setCardNo} placeholder="0000-0000-0000-0000" mono />
                  <FormLabel>할부 개월</FormLabel>
                  <select
                    value={installment}
                    onChange={(e) => setInstallment(Number(e.target.value))}
                    style={{ padding: '12px 16px', background: '#fff', border: '1px solid var(--line-strong)', fontSize: 13, fontFamily: 'var(--sans)', outline: 'none', borderRadius: 0, appearance: 'none', cursor: 'pointer', backgroundImage: SELECT_ARROW, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center' }}
                  >
                    <option value={0}>일시불</option>
                    <option value={2}>2개월</option>
                    <option value={3}>3개월</option>
                    <option value={6}>6개월</option>
                    <option value={12}>12개월</option>
                  </select>
                  <div style={{ gridColumn: '1 / -1', fontSize: 12, color: 'var(--muted)' }}>※ 모의 결제 — 거절 테스트 카드: 4000-0000-0000-0002</div>
                </div>
              )}
            </FormSection>

            {/* 안내 */}
            <div style={{ padding: 24, background: 'rgba(245, 237, 247, 0.6)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.9 }}>
              <div style={{ marginBottom: 10, color: 'var(--plum-800)', fontWeight: 500, fontSize: 13 }}>· 구매 전 꼭 확인해 주세요.</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                <li>주문 완료 후, 자동 발송되는 결제 정보 메일을 꼭 확인해 주세요.</li>
                <li>제품 색상은 디바이스 환경에 따라 실제와 다르게 보일 수 있어요.</li>
                <li>배송 완료 후 30일 이내 미개봉 제품은 무료 반품이 가능해요.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT — sticky summary */}
          <aside style={{ position: 'sticky', top: 100, border: '1.5px solid var(--plum-800)', background: 'var(--paper)' }}>
            <div style={{ padding: '20px 28px', background: '#352a50', color: 'var(--cream)', fontFamily: 'var(--serif-en)', fontSize: 12, letterSpacing: '0.3em' }}>PAYMENT</div>
            <div style={{ padding: 28 }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--plum-800)', marginBottom: 20 }}>결제 정보</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
                <SummaryRow label="주문 금액" value={won(sub)} />
                <SummaryRow label="배송비" value={ship === 0 ? '무료' : `+ ${won(ship)}`} />
              </div>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--plum-800)', fontWeight: 500 }}>총 결제 금액</span>
                <span style={{ fontFamily: 'var(--serif-en)', fontSize: 28, color: '#c14b3a', fontWeight: 600 }}>{won(total)}</span>
              </div>
              <div style={{ marginTop: 16, padding: '12px 14px', background: 'rgba(42, 26, 62, 0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>적립 예정 포인트</span>
                <span style={{ fontFamily: 'var(--serif-en)', fontSize: 14, color: 'var(--plum-700)', fontWeight: 500 }}>+ {earn.toLocaleString('ko-KR')} P</span>
              </div>

              {/* 약관 동의 */}
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.3em', color: 'var(--muted)', marginBottom: 14 }}>TERMS</div>
                <CKCheck checked={agreeAll} onClick={toggleAll} bold>
                  구매 이용약관 동의 <span style={{ color: 'var(--muted)', fontSize: 12 }}>모두 동의</span>
                </CKCheck>
                <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
                <CKCheck checked={agree1} onClick={() => { setAgree1(!agree1); setAgreeAll(!agree1 && agree2) }}>
                  개인정보 수집 및 이용 동의 <span style={{ color: '#c14b3a' }}>(필수)</span>
                </CKCheck>
                <CKCheck checked={agree2} onClick={() => { setAgree2(!agree2); setAgreeAll(agree1 && !agree2) }}>
                  개인정보 제3자 제공 동의 <span style={{ color: '#c14b3a' }}>(필수)</span>
                </CKCheck>
              </div>

              <button
                onClick={placeOrder}
                disabled={!agree1 || !agree2 || submitting}
                style={{ width: '100%', marginTop: 24, padding: '18px 0', background: agree1 && agree2 && !submitting ? 'var(--plum-800)' : 'var(--line-strong)', color: 'var(--cream)', border: 'none', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, letterSpacing: '0.2em', cursor: agree1 && agree2 && !submitting ? 'pointer' : 'not-allowed', transition: 'background .2s' }}
              >
                {submitting ? '결제 처리 중…' : `${won(total)} 결제하기`}
              </button>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

// ─── Checkout helpers (colocate) ──────────────────────────
function FormSection({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 16, marginBottom: 24, borderBottom: '2px solid var(--plum-800)' }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 500, fontSize: 19, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.005em' }}>{title}</h3>
        {action && (
          <button onClick={onAction} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 12, color: '#c14b3a', textDecoration: 'underline', textUnderlineOffset: 3, fontFamily: 'var(--sans)' }}>
            {action} ›
          </button>
        )}
      </div>
      {children}
    </section>
  )
}

function FormLabel({ children }: { children: ReactNode }) {
  return <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{children}</span>
}

function CKField({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label style={{ display: 'block', gridColumn: full ? '1 / -1' : 'auto' }}>
      <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.2em', color: 'var(--muted)', marginBottom: 6, textTransform: 'uppercase' }}>{label}</div>
      {children}
    </label>
  )
}

function CKInput({ defaultValue, value, onChange, placeholder, mono }: { defaultValue?: string; value?: string; onChange?: (v: string) => void; placeholder?: string; mono?: boolean }) {
  const controlled = value !== undefined
  return (
    <input
      className="ck-input"
      {...(controlled ? { value, onChange: (e) => onChange?.(e.target.value) } : { defaultValue })}
      placeholder={placeholder}
      style={{ width: '100%', padding: '12px 16px', background: 'var(--paper)', border: '1px solid var(--line-strong)', fontFamily: mono ? 'var(--serif-en)' : 'var(--sans)', fontSize: 14, color: 'var(--ink)', outline: 'none', borderRadius: 0 }}
    />
  )
}

function CKCheck({ children, checked, onClick, bold }: { children: ReactNode; checked: boolean; onClick: () => void; bold?: boolean }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', cursor: 'pointer', fontSize: bold ? 14 : 13, color: 'var(--ink)', fontWeight: bold ? 600 : 400 }}>
      <span style={{ width: 18, height: 18, flex: '0 0 18px', background: checked ? 'var(--plum-700)' : 'transparent', border: `1.5px solid ${checked ? 'var(--plum-700)' : 'var(--line-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && Icon.check(11, 'var(--cream)')}
      </span>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--serif-en)', color: accent ? '#c14b3a' : 'var(--ink)', fontWeight: accent ? 500 : 400 } as CSSProperties}>{value}</span>
    </div>
  )
}
