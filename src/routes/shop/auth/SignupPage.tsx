// 회원가입 — 출처: 원본 shop/screens-auth-cart.jsx SignupPage. 제출은 목업(네비만). 실제 인증은 API 단계.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryBtn from '../../../components/shop/PrimaryBtn'
import { AuthShell, FieldRow, CheckRow } from './auth-ui'

type Agree = { all: boolean; terms: boolean; privacy: boolean; marketing: boolean }

export default function SignupPage() {
  const navigate = useNavigate()
  const [agree, setAgree] = useState<Agree>({ all: false, terms: false, privacy: false, marketing: false })

  const toggleAll = () => {
    const v = !agree.all
    setAgree({ all: v, terms: v, privacy: v, marketing: v })
  }
  const toggle = (k: 'terms' | 'privacy' | 'marketing') => {
    const next = { ...agree, [k]: !agree[k] }
    next.all = next.terms && next.privacy && next.marketing
    setAgree(next)
  }

  return (
    <AuthShell>
      <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 14 }}>CREATE ACCOUNT</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 40, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>회원가입</h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 14, lineHeight: 1.7 }}>
        이미 회원이신가요?{' '}
        <button
          onClick={() => navigate('/login')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--plum-700)', textDecoration: 'underline', textUnderlineOffset: 3, fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          로그인
        </button>
      </p>

      <form style={{ marginTop: 36 }} onSubmit={(e) => { e.preventDefault(); navigate('/') }}>
        <FieldRow label="이름" placeholder="홍길동" />
        <FieldRow label="이메일" placeholder="name@email.com" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, alignItems: 'end' }}>
          <FieldRow label="휴대폰 번호" placeholder="010-0000-0000" />
          <button
            type="button"
            style={{ padding: '14px 18px', background: 'transparent', border: '1px solid var(--plum-700)', color: 'var(--plum-700)', cursor: 'pointer', fontSize: 12, letterSpacing: '0.18em', whiteSpace: 'nowrap', marginBottom: 20, height: 46 }}
          >
            인증번호 전송
          </button>
        </div>
        <FieldRow label="비밀번호" type="password" placeholder="영문 + 숫자 8자 이상" />
        <FieldRow label="비밀번호 확인" type="password" placeholder="••••••••" />

        {/* 약관 */}
        <div style={{ marginTop: 12, padding: 20, background: 'var(--paper)', border: '1px solid var(--line)' }}>
          <CheckRow checked={agree.all} onClick={toggleAll} bold>
            전체 동의
          </CheckRow>
          <div style={{ height: 1, background: 'var(--line)', margin: '12px 0' }} />
          <CheckRow checked={agree.terms} onClick={() => toggle('terms')}>
            이용약관 동의 (필수)
          </CheckRow>
          <CheckRow checked={agree.privacy} onClick={() => toggle('privacy')}>
            개인정보 수집 및 이용 동의 (필수)
          </CheckRow>
          <CheckRow checked={agree.marketing} onClick={() => toggle('marketing')}>
            마케팅 수신 동의 (선택)
          </CheckRow>
        </div>

        <div style={{ marginTop: 32 }}>
          <PrimaryBtn full size="lg">가입 완료</PrimaryBtn>
        </div>
      </form>
    </AuthShell>
  )
}
