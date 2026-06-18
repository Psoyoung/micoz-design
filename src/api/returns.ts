// 반품(Returns) API — 출처 계약: docs/micoz_api.md §8 + Swagger 교차확인. 인증 필요.
// 어댑터: ReturnListItem/ReturnDetailResponse → 뷰모델. 유형/상태/사유 라벨은 lib/data enums 재사용(Phase 0 정렬값).
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { apiGet, apiPost, ApiError } from './client'
import { catalogErrorMessage } from './catalog'
import {
  RETURN_TYPE_LABEL, RETURN_STATUS_LABEL, RETURN_REASON_LABEL,
  type ReturnType, type ReturnStatus, type ReturnReasonType,
} from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface ReturnItemInput {
  itemSeq: number
  quantity: number
  exchangeOptionSeq?: number // EXCHANGE 시 필수
}
export interface CreateReturnRequest {
  returnType: ReturnType
  returnReasonType: ReturnReasonType
  returnReason?: string
  items: ReturnItemInput[]
  pickupZipCode?: string
  pickupAddress?: string
  pickupAddressDetail?: string
  pickupPhone?: string
}
export interface ReturnCreatedDto {
  returnSeq: number
  returnNo: string
  returnType: string
  returnStatus: string
  requestedDate: string
}
export interface ReturnListItemDto {
  returnSeq: number
  returnNo: string
  orderSeq: number
  orderNo: string
  returnType: string
  returnStatus: string
  returnReasonType: string
  requestedDate: string
  totalItemCount: number
}
export interface ReturnItemDto {
  returnItemSeq: number
  itemSeq: number
  productSeq: number
  productName: string
  optionName?: string
  unitPrice: number
  quantity: number
  exchangeOptionSeq?: number
  exchangeOptionName?: string
}
export interface ReturnDetailDto {
  returnSeq: number
  returnNo: string
  orderSeq: number
  orderNo: string
  returnType: string
  returnStatus: string
  returnReasonType: string
  returnReason?: string
  returnShippingFee: number
  refundAmount: number
  pickupZipCode?: string
  pickupAddress?: string
  pickupAddressDetail?: string
  pickupPhone?: string
  requestedDate: string
  completedDate?: string
  items: ReturnItemDto[]
}
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/* ─── 라벨 헬퍼 (미지 코드는 원문 폴백) ─────────────────── */
export const returnTypeLabel = (t: string) => RETURN_TYPE_LABEL[t as ReturnType] ?? t
export const returnStatusLabel = (s: string) => RETURN_STATUS_LABEL[s as ReturnStatus] ?? s
export const returnReasonLabel = (r: string) => RETURN_REASON_LABEL[r as ReturnReasonType] ?? r
const fmtDate = (iso?: string) => (iso ? `${iso.slice(0, 10).replace(/-/g, '.')} ${iso.slice(11, 16)}`.trim() : '')

/* ─── 뷰모델 ──────────────────────────────────────────── */
export interface ReturnListVM {
  returnSeq: number
  returnNo: string
  orderNo: string
  typeLabel: string
  statusLabel: string
  reasonLabel: string
  requestedDate: string
  totalItemCount: number
}
export interface ReturnDetailVM {
  returnSeq: number
  returnNo: string
  orderNo: string
  typeLabel: string
  statusLabel: string
  reasonLabel: string
  returnReason?: string
  returnShippingFee: number
  refundAmount: number
  pickupZipCode?: string
  pickupAddress?: string
  pickupAddressDetail?: string
  pickupPhone?: string
  requestedDate: string
  completedDate?: string
  items: { returnItemSeq: number; productName: string; optionName?: string; quantity: number; unitPrice: number; exchangeOptionName?: string }[]
}
export interface ReturnsPageVM {
  items: ReturnListVM[]
  page: number
  totalElements: number
  totalPages: number
}

/* ─── 매퍼 ────────────────────────────────────────────── */
function toReturnListVM(d: ReturnListItemDto): ReturnListVM {
  return {
    returnSeq: d.returnSeq,
    returnNo: d.returnNo,
    orderNo: d.orderNo,
    typeLabel: returnTypeLabel(d.returnType),
    statusLabel: returnStatusLabel(d.returnStatus),
    reasonLabel: returnReasonLabel(d.returnReasonType),
    requestedDate: fmtDate(d.requestedDate),
    totalItemCount: d.totalItemCount,
  }
}
function toReturnDetailVM(d: ReturnDetailDto): ReturnDetailVM {
  return {
    returnSeq: d.returnSeq,
    returnNo: d.returnNo,
    orderNo: d.orderNo,
    typeLabel: returnTypeLabel(d.returnType),
    statusLabel: returnStatusLabel(d.returnStatus),
    reasonLabel: returnReasonLabel(d.returnReasonType),
    returnReason: d.returnReason,
    returnShippingFee: d.returnShippingFee,
    refundAmount: d.refundAmount,
    pickupZipCode: d.pickupZipCode,
    pickupAddress: d.pickupAddress,
    pickupAddressDetail: d.pickupAddressDetail,
    pickupPhone: d.pickupPhone,
    requestedDate: fmtDate(d.requestedDate),
    completedDate: fmtDate(d.completedDate),
    items: d.items.map((it) => ({ returnItemSeq: it.returnItemSeq, productName: it.productName, optionName: it.optionName, quantity: it.quantity, unitPrice: it.unitPrice, exchangeOptionName: it.exchangeOptionName })),
  }
}

/* ─── 에러 문구 ───────────────────────────────────────── */
const RETURN_ERROR_MESSAGES: Record<string, string> = {
  ORDER_INVALID_STATUS: '해당 주문 상태에서는 신청할 수 없습니다. (취소는 결제완료/준비중, 반품·교환은 배송완료만 가능)',
  RETURN_PERIOD_EXPIRED: '반품 가능 기간(배송완료 후 7일)이 지났습니다.',
  RETURN_ITEM_INVALID: '주문에 포함되지 않은 상품입니다.',
  RETURN_QUANTITY_EXCEEDED: '신청 수량이 주문 수량을 초과합니다.',
  RETURN_EMPTY_ITEMS: '신청할 상품을 선택해주세요.',
  RETURN_NOT_FOUND: '반품 내역을 찾을 수 없습니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
}
export function returnErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (RETURN_ERROR_MESSAGES[err.code]) return RETURN_ERROR_MESSAGES[err.code]
    if (err.code === 'COMMON_VALIDATION_ERROR') return err.message
  }
  return catalogErrorMessage(err)
}

/* ─── API 함수 ────────────────────────────────────────── */
function getMyReturnsApi(page: number, size: number): Promise<PageDto<ReturnListItemDto>> {
  return apiGet<PageDto<ReturnListItemDto>>('/me/returns', { params: { page, size, sort: 'returnSeq,desc' } })
}
function getMyReturnApi(returnSeq: number): Promise<ReturnDetailDto> {
  return apiGet<ReturnDetailDto>(`/me/returns/${returnSeq}`)
}
function createReturnApi(orderSeq: number, body: CreateReturnRequest): Promise<ReturnCreatedDto> {
  return apiPost<ReturnCreatedDto>(`/me/orders/${orderSeq}/returns`, body)
}

/* ─── React Query 훅 ──────────────────────────────────── */
export function useMyReturns(enabled: boolean, page = 0, size = 10) {
  return useQuery({
    queryKey: ['my-returns', page, size],
    queryFn: () => getMyReturnsApi(page, size),
    enabled,
    placeholderData: keepPreviousData,
    select: (d): ReturnsPageVM => ({ items: d.content.map(toReturnListVM), page: d.page, totalElements: d.totalElements, totalPages: d.totalPages }),
  })
}
export function useMyReturn(returnSeq: number | null) {
  return useQuery({
    queryKey: ['my-return', returnSeq],
    queryFn: () => getMyReturnApi(returnSeq!),
    enabled: returnSeq != null,
    select: toReturnDetailVM,
  })
}
export function useCreateReturn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (v: { orderSeq: number; body: CreateReturnRequest }) => createReturnApi(v.orderSeq, v.body),
    onSuccess: (_d, v) => {
      void qc.invalidateQueries({ queryKey: ['my-returns'] })
      void qc.invalidateQueries({ queryKey: ['my-order', v.orderSeq] })
    },
  })
}
