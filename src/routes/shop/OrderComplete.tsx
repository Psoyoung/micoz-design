// 쇼핑몰 주문 완료 — 출처: 원본 shop/screens-desktop2.jsx OrderConfirm
// Phase 4b: 결제 응답(CheckoutResult)을 router state 로 받아 서버 orderNo·결제금액·승인번호·카드마스킹·적립 표시.
// 직접 진입(state 없음) 시 홈으로 폴백.
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { won } from '../../lib/format'
import { useIsMobile } from '../../lib/useIsMobile'
import MobileConfirm from './mobile/MobileConfirm'
import { Icon } from '../../components/shop/icons'
import PrimaryBtn from '../../components/shop/PrimaryBtn'
import type { CheckoutResult } from './checkout/useCheckout'

const PAY_LABEL: Record<string, string> = { CARD: '신용카드', KAKAO: '카카오페이', NAVER: '네이버페이' }

// 뷰포트 분기 — 한쪽 트리만 렌더
export default function OrderComplete() {
  const isMobile = useIsMobile()
  return isMobile ? <MobileConfirm /> : <DesktopOrderComplete />
}

function DesktopOrderComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = (location.state as { result?: CheckoutResult } | null)?.result

  useEffect(() => {
    if (!result) navigate('/', { replace: true }) // 직접 진입 폴백
  }, [result, navigate])
  if (!result) return null

  return (
    <main style={{ background: 'var(--cream)', minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 56px' }}>
      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--plum-100)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
          {Icon.check(28, 'var(--plum-700)')}
        </div>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 14 }}>ORDER COMPLETED</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 44, color: 'var(--plum-800)', margin: 0, letterSpacing: '-0.01em' }}>주문이 완료되었어요.</h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: 16, lineHeight: 1.9, color: 'var(--muted)', marginTop: 20, fontWeight: 300 }}>
          소중한 의식이 시작되는 순간까지, 정성껏 준비해 보내드릴게요.
        </p>

        {/* 결제 영수증 */}
        <div style={{ marginTop: 36, padding: 28, background: 'var(--paper)', border: '1px solid var(--line)', textAlign: 'left' }}>
          <ReceiptRow label="주문번호" value={result.orderNo} mono />
          <ReceiptRow label="결제 수단" value={PAY_LABEL[result.paymentType] ?? result.paymentType} />
          {result.cardNoMasked && <ReceiptRow label="카드 번호" value={result.cardNoMasked} mono />}
          <ReceiptRow label="승인 번호" value={result.approvalNo} mono />
          <ReceiptRow label="적립 예정" value={`${result.pointToEarn.toLocaleString('ko-KR')} P`} />
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: 15, color: 'var(--plum-800)', fontWeight: 500 }}>결제 금액</span>
            <span style={{ fontFamily: 'var(--serif-en)', fontSize: 24, color: 'var(--plum-800)', fontWeight: 600 }}>{won(result.paidAmount)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 36 }}>
          <PrimaryBtn dark={false} onClick={() => navigate('/mypage')}>주문 내역 보기</PrimaryBtn>
          <PrimaryBtn onClick={() => navigate('/')}>쇼핑 계속하기</PrimaryBtn>
        </div>
      </div>
    </main>
  )
}

function ReceiptRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', fontSize: 13.5 }}>
      <span style={{ color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--serif-en)' : 'var(--sans)', color: 'var(--ink)' }}>{value}</span>
    </div>
  )
}
