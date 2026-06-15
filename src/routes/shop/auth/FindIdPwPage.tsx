// 아이디·비밀번호 찾기 — 출처: 원본 shop/screens-auth-cart.jsx FindIdPwPage. 제출은 목업(네비만).
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PrimaryBtn from '../../../components/shop/PrimaryBtn'
import { AuthShell, FindFieldRow } from './auth-ui'

export default function FindIdPwPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('id') // id | pw
  const [method, setMethod] = useState('email') // email | phone | phoneAuth

  return (
    <AuthShell>
      <div style={{ marginBottom: 36, textAlign: 'left' }}>
        <div style={{ fontFamily: 'var(--serif-en)', fontSize: 11, letterSpacing: '0.4em', color: 'var(--plum-500)', marginBottom: 14 }}>FIND ID · PASSWORD</div>
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 36, margin: 0, color: 'var(--plum-800)', letterSpacing: '-0.01em' }}>아이디 · 비밀번호 찾기</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
        {(
          [
            ['id', '아이디 찾기'],
            ['pw', '비밀번호 찾기'],
          ] as [string, string][]
        ).map(([k, l]) => {
          const active = tab === k
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: '14px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: `2px solid ${active ? 'var(--plum-700)' : 'transparent'}`,
                marginBottom: -1,
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                fontSize: 13.5,
                fontWeight: active ? 500 : 400,
                letterSpacing: '0.04em',
                color: active ? 'var(--plum-700)' : 'var(--muted)',
              }}
            >
              {l}
            </button>
          )
        })}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); navigate('/login') }}>
        {/* 인증방법 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10, letterSpacing: '0.25em', color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase' }}>인증방법</div>
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap' }}>
            {(
              [
                ['email', '이메일'],
                ['phone', '휴대폰번호'],
                ['phoneAuth', '휴대폰인증'],
              ] as [string, string][]
            ).map(([k, l]) => {
              const sel = method === k
              return (
                <label key={k} onClick={() => setMethod(k)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, color: 'var(--ink)' }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${sel ? 'var(--plum-700)' : 'var(--line-strong)'}`, background: '#ffffff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--plum-700)' }} />}
                  </span>
                  {l}
                </label>
              )
            })}
          </div>
        </div>

        {/* Fields */}
        <FindFieldRow label={tab === 'id' ? '이름' : '아이디'} placeholder={tab === 'id' ? '홍길동' : 'name@email.com'} />
        {method === 'email' && <FindFieldRow label="이메일" placeholder="name@email.com" type="email" />}
        {(method === 'phone' || method === 'phoneAuth') && <FindFieldRow label="휴대폰번호" placeholder="010-0000-0000" type="tel" />}

        <div style={{ marginTop: 28 }}>
          <PrimaryBtn full size="lg">확인</PrimaryBtn>
        </div>

        <p style={{ marginTop: 28, padding: '0 4px', fontSize: 12, color: 'var(--muted)', lineHeight: 1.75, textAlign: 'center', display: 'flex', alignItems: 'flex-start', gap: 6, justifyContent: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--muted)', fontSize: 9, color: 'var(--muted)', flexShrink: 0, marginTop: 2, fontFamily: 'var(--serif-en)' }}>i</span>
          <span>
            SNS 계정으로 가입 후 별도의 휴대폰 인증을 하지 않은 경우
            <br />
            [휴대폰인증]으로 진행 시 아이디가 노출되지 않을 수 있습니다.
          </span>
        </p>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13 }}>
          <button type="button" onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3 }}>
            로그인으로 돌아가기
          </button>
        </div>
      </form>
    </AuthShell>
  )
}
