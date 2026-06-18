// 마이페이지 · 회원 정보 — 출처: 원본 shop/screens-desktop2.jsx ProfileTab/ProfileRow/PasswordModal
// Phase 5a: CURRENT_USER 목업 → GET /me(AuthContext) 표시 + PATCH /me 수정 + PUT /me/password 변경.
import { useState, type ReactNode, type FormEvent } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { useUpdateProfile, useChangePassword, profileErrorMessage } from '../../../api/profile'
import { MpField, MpInput, ModalClose, useModalDismiss, mypagePrimaryBtn, mypageGhostBtn, mypageBackdrop, mypageModal, mypageModalHead, mypageModalKicker, mypageModalTitle, mypageModalFoot } from './mypage-ui'

type EditForm = { userName: string; email: string; phone: string }

export default function ProfileTab() {
  const { user, applyUserInfo } = useAuth()
  const { show } = useToast()
  const updateM = useUpdateProfile()
  const [edit, setEdit] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [form, setForm] = useState<EditForm>({ userName: '', email: '', phone: '' })
  const setField = (k: keyof EditForm, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  if (!user) {
    return <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>회원 정보를 불러오는 중…</div>
  }

  const startEdit = () => {
    setForm({ userName: user.name, email: user.email ?? '', phone: user.phone ?? '' })
    setEdit(true)
  }

  const save = async () => {
    if (!form.userName.trim()) {
      show('이름을 입력해주세요.')
      return
    }
    try {
      const dto = await updateM.mutateAsync({ userName: form.userName.trim(), email: form.email.trim() || undefined, phone: form.phone.trim() || undefined })
      applyUserInfo(dto) // 헤더/마이페이지 즉시 반영
      show('회원 정보가 수정되었습니다.')
      setEdit(false)
    } catch (e) {
      show(profileErrorMessage(e))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: 0, color: 'var(--plum-800)' }}>회원 정보</h3>
        {!edit ? (
          <button onClick={startEdit} style={mypagePrimaryBtn}>정보 수정</button>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setEdit(false)} style={mypageGhostBtn} disabled={updateM.isPending}>취소</button>
            <button onClick={save} style={{ ...mypagePrimaryBtn, opacity: updateM.isPending ? 0.6 : 1 }} disabled={updateM.isPending}>{updateM.isPending ? '저장 중…' : '변경 저장'}</button>
          </div>
        )}
      </div>

      <div style={{ background: 'var(--paper)', border: '1px solid var(--line)' }}>
        <ProfileRow label="아이디" value={user.userId} mono />
        <ProfileRow label="이름" value={edit ? form.userName : user.name} editing={edit} onChange={(v) => setField('userName', v)} />
        <ProfileRow label="이메일" value={edit ? form.email : user.email ?? '—'} mono editing={edit} onChange={(v) => setField('email', v)} />
        <ProfileRow label="휴대전화" value={edit ? form.phone : user.phone ?? '—'} mono editing={edit} onChange={(v) => setField('phone', v)} />
        <ProfileRow label="회원 등급" value={user.gradeName ?? user.gradeCode ?? '—'} />
        <ProfileRow label="포인트 잔액" value={`${user.pointBalance.toLocaleString('ko-KR')} P`} mono />
        <ProfileRow label="비밀번호" value="••••••••" mono action={<button onClick={() => setPwOpen(true)} style={mypageGhostBtn}>비밀번호 변경</button>} />
      </div>

      <div style={{ marginTop: 32, paddingTop: 28, borderTop: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ color: 'var(--muted)', lineHeight: 1.6, maxWidth: 520, fontSize: 12 }}>
            회원 탈퇴 시 보유하신 포인트와 적립 혜택은 모두 소멸되며, 동일 이메일로 30일간 재가입이 제한됩니다.
          </div>
          <button style={{ ...mypageGhostBtn, color: '#a8322c', borderColor: '#d8b0aa', whiteSpace: 'nowrap' }}>회원 탈퇴</button>
        </div>
      </div>

      {pwOpen && <PasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  )
}

function ProfileRow({ label, value, mono, editing, onChange, action }: { label: string; value: ReactNode; mono?: boolean; editing?: boolean; onChange?: (v: string) => void; action?: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 24, alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ fontFamily: 'var(--serif-en)', fontSize: 10.5, letterSpacing: '0.24em', color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 14, fontFamily: mono ? 'var(--serif-en)' : 'var(--sans)', color: 'var(--ink)', letterSpacing: mono ? '0.04em' : 0 }}>
        {editing && onChange ? <MpInput mono={mono} value={typeof value === 'string' ? value : ''} onChange={onChange} /> : value}
      </div>
      <div>{action}</div>
    </div>
  )
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const { logout } = useAuth()
  const { show } = useToast()
  const changeM = useChangePassword()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  useModalDismiss(onClose)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!current || !next) {
      show('현재 비밀번호와 새 비밀번호를 입력해주세요.')
      return
    }
    if (next.length < 8 || next.length > 64) {
      show('새 비밀번호는 8~64자로 입력해주세요.')
      return
    }
    if (next !== confirm) {
      show('새 비밀번호가 일치하지 않습니다.')
      return
    }
    try {
      await changeM.mutateAsync({ currentPassword: current, newPassword: next })
      // 성공 시 서버가 전체 refresh revoke → 현 세션 정리 후 재로그인 유도.
      onClose()
      show('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
      void logout() // 토큰 clear + /login 이동
    } catch (err) {
      show(profileErrorMessage(err)) // AUTH_INVALID_CREDENTIALS → 현재 비번 불일치
    }
  }

  return (
    <div onClick={onClose} style={mypageBackdrop}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={{ ...mypageModal, width: 'min(480px, 100%)' }}>
        <div style={mypageModalHead}>
          <div>
            <div style={mypageModalKicker}>PASSWORD</div>
            <div style={mypageModalTitle}>비밀번호 변경</div>
          </div>
          <ModalClose onClose={onClose} />
        </div>
        <div style={{ padding: 26, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <MpField label="현재 비밀번호"><MpInput mono type="password" value={current} onChange={setCurrent} placeholder="••••••••" /></MpField>
          <MpField label="새 비밀번호 (8~64자)"><MpInput mono type="password" value={next} onChange={setNext} placeholder="••••••••" /></MpField>
          <MpField label="새 비밀번호 확인"><MpInput mono type="password" value={confirm} onChange={setConfirm} placeholder="••••••••" /></MpField>
        </div>
        <div style={mypageModalFoot}>
          <button type="button" onClick={onClose} style={mypageGhostBtn}>취소</button>
          <button type="submit" style={{ ...mypagePrimaryBtn, opacity: changeM.isPending ? 0.6 : 1 }} disabled={changeM.isPending}>{changeM.isPending ? '변경 중…' : '변경하기'}</button>
        </div>
      </form>
    </div>
  )
}
