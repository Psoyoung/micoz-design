// 배송지(Addresses) API — 출처 계약: docs/micoz_api.md §3 + Swagger 교차확인. 모든 엔드포인트 인증 필요.
// 어댑터: AddressResponse(defaultYn 'Y'/'N') → 기존 UserAddress 뷰모델(addressSeq→id, defaultYn→isDefault).
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiPut, apiDelete } from './client'
import type { UserAddress } from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface AddressDto {
  addressSeq: number
  addressName?: string
  recipientName: string
  recipientPhone: string
  zipCode: string
  address: string
  addressDetail?: string
  defaultYn: string // "Y"/"N"
}
export interface CreateAddressRequest {
  addressName?: string
  recipientName: string
  recipientPhone: string
  zipCode: string
  address: string
  addressDetail?: string
  isDefault?: boolean
}
// 부분 업데이트 — 모두 optional (PATCH).
export type UpdateAddressRequest = Partial<Omit<CreateAddressRequest, 'isDefault'>>

/* ─── 매퍼 ────────────────────────────────────────────── */
export function toUserAddress(d: AddressDto): UserAddress {
  return {
    id: d.addressSeq,
    addressName: d.addressName,
    recipientName: d.recipientName,
    recipientPhone: d.recipientPhone,
    zipCode: d.zipCode,
    address: d.address,
    addressDetail: d.addressDetail,
    isDefault: d.defaultYn === 'Y',
  }
}

/* ─── API 함수 ────────────────────────────────────────── */
function getAddressesApi(): Promise<AddressDto[]> {
  return apiGet<AddressDto[]>('/me/addresses')
}
function createAddressApi(body: CreateAddressRequest): Promise<AddressDto> {
  return apiPost<AddressDto>('/me/addresses', body)
}
function updateAddressApi(seq: number, body: UpdateAddressRequest): Promise<AddressDto> {
  return apiPatch<AddressDto>(`/me/addresses/${seq}`, body)
}
function deleteAddressApi(seq: number): Promise<void> {
  return apiDelete<void>(`/me/addresses/${seq}`)
}
function setDefaultAddressApi(seq: number): Promise<AddressDto> {
  return apiPut<AddressDto>(`/me/addresses/${seq}/default`, undefined)
}

/* ─── React Query 훅 ──────────────────────────────────── */
const ADDRESSES_KEY = ['addresses'] as const

export function useAddresses(enabled: boolean) {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: getAddressesApi,
    enabled,
    select: (d): UserAddress[] => d.map(toUserAddress), // 서버 정렬: 기본배송지 첫 행
  })
}

export function useCreateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAddressRequest) => createAddressApi(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useUpdateAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { seq: number; body: UpdateAddressRequest }) => updateAddressApi(v.seq, v.body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useDeleteAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (seq: number) => deleteAddressApi(seq),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}

export function useSetDefaultAddress() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (seq: number) => setDefaultAddressApi(seq),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ADDRESSES_KEY }),
  })
}
