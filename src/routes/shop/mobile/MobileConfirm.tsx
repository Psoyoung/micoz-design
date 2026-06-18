// 모바일 주문 완료 — 출처: 원본 shop/screens-mobile.jsx MobileConfirm
// Phase 4b: 결제 응답(CheckoutResult) router state 표시. 직접 진입 시 홈 폴백.
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { won } from '../../../lib/format'
import { useCart } from '../../../contexts/CartContext'
import MobileHeader from '../../../components/shop/MobileHeader'
import type { CheckoutResult } from '../checkout/useCheckout'

const PAY_LABEL: Record<string, string> = { CARD: '신용카드', KAKAO: '카카오페이', NAVER: '네이버페이' }

export default function MobileConfirm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { items, openDrawer } = useCart()
  const result = (location.state as { result?: CheckoutResult } | null)?.result

  useEffect(() => {
    if (!result) navigate('/', { replace: true })
  }, [result, navigate])
  if (!result) return null

  return (
    <div style={{ background: 'var(--cream)', minHeight: '100%' }}>
      <MobileHeader title="주문완료" onBack={() => navigate('/')} cart={items} onCart={openDrawer} />
      <div style={{ padding: '48px 24px 80px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--plum-700)', color: 'var(--cream)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
          </div>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 12 }}>ORDER CONFIRMED</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 28, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>주문이 완료되었습니다.</h1>
        </div>

        {/* 결제 영수증 */}
        <div style={{ marginTop: 32, padding: 20, background: '#fff', border: '1px solid var(--line)' }}>
          <Row label="주문번호" value={result.orderNo} mono />
          <Row label="결제 수단" value={PAY_LABEL[result.paymentType] ?? result.paymentType} />
          {result.cardNoMasked && <Row label="카드 번호" value={result.cardNoMasked} mono />}
          <Row label="승인 번호" value={result.approvalNo} mono />
          <Row label="적립 예정" value={`${result.pointToEarn.toLocaleString('ko-KR')} P`} />
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--plum-800)' }}>결제 금액</span>
            <span style={{ fontFamily: 'var(--serif-en)', fontSize: 20, color: 'var(--plum-800)', fontWeight: 600 }}>{won(result.paidAmount)}</span>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => navigate('/mypage')} style={{ padding: '14px 0', background: 'var(--plum-800)', color: 'var(--cream)', border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 500 }}>주문 내역 보기</button>
          <button onClick={() => navigate('/')} style={{ padding: '14px 0', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--line-strong)', cursor: 'pointer', fontSize: 13.5 }}>홈으로 돌아가기</button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: 13 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--serif-en)' : 'var(--sans)', color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}
