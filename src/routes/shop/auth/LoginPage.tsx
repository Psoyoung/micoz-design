// 로그인 — 출처: 원본 shop/screens-auth-cart.jsx LoginPage. 제출은 목업(네비만). 실제 인증은 API 단계.
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../../../components/shop/icons'
import PrimaryBtn from '../../../components/shop/PrimaryBtn'
import { AuthShell, FieldRow } from './auth-ui'

export default function LoginPage() {
  const navigate = useNavigate()
  const [keep, setKeep] = useState(true)
  return (
    <AuthShell>
      <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 14 }}>SIGN IN</div>
      <h2 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 40, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>로그인</h2>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 14, lineHeight: 1.7 }}>
        아직 회원이 아니신가요?{' '}
        <button
          onClick={() => navigate('/signup')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--plum-700)', textDecoration: 'underline', textUnderlineOffset: 3, fontFamily: 'inherit', fontSize: 'inherit' }}
        >
          회원가입
        </button>
      </p>

      <form style={{ marginTop: 40 }} onSubmit={(e) => { e.preventDefault(); navigate('/') }}>
        <FieldRow label="이메일" placeholder="name@email.com" />
        <FieldRow label="비밀번호" type="password" placeholder="••••••••" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 28 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--ink)' }}>
            <span
              style={{ width: 16, height: 16, background: keep ? 'var(--plum-700)' : 'transparent', border: `1.5px solid ${keep ? 'var(--plum-700)' : 'var(--line-strong)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => setKeep(!keep)}
            >
              {keep && Icon.check(11, 'var(--cream)')}
            </span>
            로그인 유지
          </label>
          <button
            type="button"
            onClick={() => navigate('/find')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >
            아이디 / 비밀번호 찾기
          </button>
        </div>

        <PrimaryBtn full size="lg">로그인</PrimaryBtn>
      </form>
    </AuthShell>
  )
}
