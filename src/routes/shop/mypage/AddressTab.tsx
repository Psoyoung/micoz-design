// 마이페이지 · 배송지 관리 — 출처: 원본 shop/screens-desktop2.jsx AddressTab/AddressFormModal
// Phase 4a: mock·로컬 폼 → 실 API(GET/POST/PATCH/DELETE/PUT default). 데스크탑/모바일 공용.
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../../auth/AuthContext'
import { useToast } from '../../../contexts/ToastContext'
import { catalogErrorMessage } from '../../../api/catalog'
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '../../../api/addresses'
import type { UserAddress } from '../../../lib/data'
import { ErrorState, EmptyState } from '../../../components/shop/states'
import { MpField, MpInput, ModalClose, useModalDismiss, mypagePrimaryBtn, mypageGhostBtn, mypageBackdrop, mypageModal, mypageModalHead, mypageModalKicker, mypageModalTitle, mypageModalFoot } from './mypage-ui'

// 폼 데이터 — 명세 필드명 그대로(매퍼와 일관). addressName/addressDetail 은 optional 이나 폼에선 문자열로 보유.
type AddressFormData = {
  addressName: string
  recipientName: string
  recipientPhone: string
  zipCode: string
  address: string
  addressDetail: string
}

export default function AddressTab() {
  const { user } = useAuth()
  const { show } = useToast()
  const addressesQ = useAddresses(!!user)
  const createM = useCreateAddress()
  const updateM = useUpdateAddress()
  const deleteM = useDeleteAddress()
  const defaultM = useSetDefaultAddress()
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const addresses = addressesQ.data ?? []
  const saving = createM.isPending || updateM.isPending

  const remove = (id: number) => deleteM.mutate(id, { onError: (e) => show(catalogErrorMessage(e)) })
  const setDefault = (id: number) => defaultM.mutate(id, { onError: (e) => show(catalogErrorMessage(e)) })

  const handleSubmit = async (form: AddressFormData) => {
    try {
      if (editing === 'new') await createM.mutateAsync(form)
      else if (typeof editing === 'number') await updateM.mutateAsync({ seq: editing, body: form })
      setEditing(null)
    } catch (e) {
      show(catalogErrorMessage(e))
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 28 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 26, margin: 0, color: 'var(--plum-800)' }}>배송지 관리</h3>
        <button onClick={() => setEditing('new')} style={mypagePrimaryBtn}>새 배송지 추가</button>
      </div>

      {addressesQ.isPending ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>배송지를 불러오는 중…</div>
      ) : addressesQ.isError ? (
        <ErrorState message={catalogErrorMessage(addressesQ.error)} onRetry={() => addressesQ.refetch()} />
      ) : addresses.length === 0 ? (
        <EmptyState message="등록된 배송지가 없습니다. 새 배송지를 추가해주세요." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {addresses.map((a) => (
            <div key={a.id} style={{ padding: 24, background: a.isDefault ? '#faf6fc' : 'var(--paper)', border: '1px solid ' + (a.isDefault ? 'var(--plum-700)' : 'var(--line)') }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ padding: '3px 10px', background: a.isDefault ? 'var(--plum-700)' : 'transparent', color: a.isDefault ? 'var(--cream)' : 'var(--plum-700)', border: a.isDefault ? 'none' : '1px solid var(--plum-200)', fontSize: 11, letterSpacing: '0.08em' }}>{a.addressName || '배송지'}</span>
                {a.isDefault && <span style={{ fontSize: 11, color: 'var(--plum-700)', fontFamily: 'var(--serif-en)', letterSpacing: '0.2em' }}>DEFAULT</span>}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--plum-800)', marginBottom: 4 }}>{a.recipientName}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'var(--serif-en)', letterSpacing: '0.04em' }}>{a.recipientPhone}</div>
              <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.6, color: 'var(--ink)' }}>
                ({a.zipCode}) {a.address}
                {a.addressDetail && (
                  <>
                    <br />
                    {a.addressDetail}
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                <button onClick={() => setEditing(a.id)} style={mypageGhostBtn}>편집</button>
                {!a.isDefault && <button onClick={() => setDefault(a.id)} style={mypageGhostBtn}>기본 배송지로</button>}
                {!a.isDefault && <button onClick={() => remove(a.id)} style={mypageGhostBtn}>삭제</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <AddressFormModal
          onClose={() => setEditing(null)}
          initial={editing === 'new' ? null : addresses.find((a) => a.id === editing) ?? null}
          defaultName={user?.name ?? ''}
          saving={saving}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

function AddressFormModal({
  onClose,
  initial,
  defaultName,
  saving,
  onSubmit,
}: {
  onClose: () => void
  initial: UserAddress | null
  defaultName: string
  saving: boolean
  onSubmit: (data: AddressFormData) => void
}) {
  const { show } = useToast()
  const [form, setForm] = useState<AddressFormData>(
    initial
      ? {
          addressName: initial.addressName ?? '',
          recipientName: initial.recipientName,
          recipientPhone: initial.recipientPhone,
          zipCode: initial.zipCode,
          address: initial.address,
          addressDetail: initial.addressDetail ?? '',
        }
      : { addressName: '집', recipientName: defaultName, recipientPhone: '', zipCode: '', address: '', addressDetail: '' },
  )
  useModalDismiss(onClose)
  const setField = (k: keyof AddressFormData, v: string) => setForm((prev) => ({ ...prev, [k]: v }))

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.recipientName.trim() || !form.recipientPhone.trim() || !form.zipCode.trim() || !form.address.trim()) {
      show('수령인·연락처·우편번호·주소는 필수 항목입니다.')
      return
    }
    onSubmit(form)
  }

  return (
    <div onClick={onClose} style={mypageBackdrop}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={submit} style={mypageModal}>
        <div style={mypageModalHead}>
          <div>
            <div style={mypageModalKicker}>{initial ? 'EDIT ADDRESS' : 'NEW ADDRESS'}</div>
            <div style={mypageModalTitle}>{initial ? '배송지 편집' : '새 배송지'}</div>
          </div>
          <ModalClose onClose={onClose} />
        </div>
        <div style={{ padding: 26, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 16px' }}>
          <MpField label="배송지 라벨"><MpInput value={form.addressName} onChange={(v) => setField('addressName', v)} placeholder="집, 회사 등" /></MpField>
          <MpField label="수령인"><MpInput value={form.recipientName} onChange={(v) => setField('recipientName', v)} placeholder="이름" /></MpField>
          <MpField label="휴대전화"><MpInput mono value={form.recipientPhone} onChange={(v) => setField('recipientPhone', v)} placeholder="010-0000-0000" /></MpField>
          <MpField label="우편번호"><MpInput mono value={form.zipCode} onChange={(v) => setField('zipCode', v)} placeholder="04781" /></MpField>
          <MpField label="주소" full><MpInput value={form.address} onChange={(v) => setField('address', v)} placeholder="기본 주소" /></MpField>
          <MpField label="상세 주소" full><MpInput value={form.addressDetail} onChange={(v) => setField('addressDetail', v)} placeholder="동/호수, 상세 주소" /></MpField>
        </div>
        <div style={mypageModalFoot}>
          <button type="button" onClick={onClose} style={mypageGhostBtn}>취소</button>
          <button type="submit" disabled={saving} style={{ ...mypagePrimaryBtn, opacity: saving ? 0.6 : 1, cursor: saving ? 'default' : 'pointer' }}>
            {saving ? '저장 중…' : initial ? '변경 저장' : '추가하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
