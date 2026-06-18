// 1:1 문의(Inquiries) API — 출처 계약: docs/micoz_api.md §12 + Swagger 교차확인. 인증 필요.
// 어댑터: InquiryListItem/InquiryDetailResponse → 뷰모델. 유형/상태 라벨은 lib/data enums 재사용. 답변(replies) 포함.
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { apiGet, apiPost, ApiError } from './client'
import { catalogErrorMessage } from './catalog'
import { INQUIRY_TYPE_LABEL, INQUIRY_STATUS_LABEL, type InquiryType, type InquiryStatus } from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
export interface CreateInquiryRequest {
  inquiryType: InquiryType
  title: string
  content: string
  privateYn?: 'Y' | 'N'
  productSeq?: number
  orderSeq?: number
}
export interface InquiryCreatedDto {
  inquirySeq: number
  inquiryNo: string
  inquiryStatus: string
  createdDate: string
}
export interface InquiryListItemDto {
  inquirySeq: number
  inquiryNo: string
  inquiryType: string
  title: string
  inquiryStatus: string
  privateYn?: string
  createdDate: string
  hasReply: boolean
}
export interface InquiryReplyDto {
  replySeq: number
  content: string
  createdDate: string
}
export interface InquiryDetailDto {
  inquirySeq: number
  inquiryNo: string
  inquiryType: string
  title: string
  content: string
  productSeq?: number
  orderSeq?: number
  inquiryStatus: string
  privateYn?: string
  createdDate: string
  answeredDate?: string
  replies: InquiryReplyDto[]
}

const inquiryTypeLabel = (t: string) => INQUIRY_TYPE_LABEL[t as InquiryType] ?? t
const inquiryStatusLabel = (s: string) => INQUIRY_STATUS_LABEL[s as InquiryStatus] ?? s
const fmtDate = (iso?: string) => (iso ? `${iso.slice(0, 10).replace(/-/g, '.')} ${iso.slice(11, 16)}`.trim() : '')

/* ─── 뷰모델 ──────────────────────────────────────────── */
export interface InquiryListVM {
  inquirySeq: number
  inquiryNo: string
  typeLabel: string
  title: string
  statusLabel: string
  hasReply: boolean
  createdDate: string
}
export interface InquiryDetailVM {
  inquirySeq: number
  inquiryNo: string
  typeLabel: string
  title: string
  content: string
  statusLabel: string
  createdDate: string
  answeredDate: string
  replies: { replySeq: number; content: string; createdDate: string }[]
}
export interface InquiriesPageVM {
  items: InquiryListVM[]
  page: number
  totalElements: number
  totalPages: number
}

function toInquiryListVM(d: InquiryListItemDto): InquiryListVM {
  return { inquirySeq: d.inquirySeq, inquiryNo: d.inquiryNo, typeLabel: inquiryTypeLabel(d.inquiryType), title: d.title, statusLabel: inquiryStatusLabel(d.inquiryStatus), hasReply: d.hasReply, createdDate: fmtDate(d.createdDate) }
}
function toInquiryDetailVM(d: InquiryDetailDto): InquiryDetailVM {
  return {
    inquirySeq: d.inquirySeq,
    inquiryNo: d.inquiryNo,
    typeLabel: inquiryTypeLabel(d.inquiryType),
    title: d.title,
    content: d.content,
    statusLabel: inquiryStatusLabel(d.inquiryStatus),
    createdDate: fmtDate(d.createdDate),
    answeredDate: fmtDate(d.answeredDate),
    replies: (d.replies ?? []).map((r) => ({ replySeq: r.replySeq, content: r.content, createdDate: fmtDate(r.createdDate) })),
  }
}

export function inquiryErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'INQUIRY_NOT_FOUND') return '문의를 찾을 수 없습니다.'
    if (err.code === 'COMMON_VALIDATION_ERROR') return err.message
  }
  return catalogErrorMessage(err)
}

/* ─── API + 훅 ────────────────────────────────────────── */
function getMyInquiriesApi(page: number, size: number): Promise<PageDto<InquiryListItemDto>> {
  return apiGet<PageDto<InquiryListItemDto>>('/me/inquiries', { params: { page, size, sort: 'inquirySeq,desc' } })
}
function getMyInquiryApi(seq: number): Promise<InquiryDetailDto> {
  return apiGet<InquiryDetailDto>(`/me/inquiries/${seq}`)
}
function createInquiryApi(body: CreateInquiryRequest): Promise<InquiryCreatedDto> {
  return apiPost<InquiryCreatedDto>('/me/inquiries', body)
}

export function useMyInquiries(enabled: boolean, page = 0, size = 10) {
  return useQuery({
    queryKey: ['my-inquiries', page, size],
    queryFn: () => getMyInquiriesApi(page, size),
    enabled,
    placeholderData: keepPreviousData,
    select: (d): InquiriesPageVM => ({ items: d.content.map(toInquiryListVM), page: d.page, totalElements: d.totalElements, totalPages: d.totalPages }),
  })
}
export function useMyInquiry(seq: number | null) {
  return useQuery({
    queryKey: ['my-inquiry', seq],
    queryFn: () => getMyInquiryApi(seq!),
    enabled: seq != null,
    select: toInquiryDetailVM,
  })
}
export function useCreateInquiry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateInquiryRequest) => createInquiryApi(body),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['my-inquiries'] }),
  })
}
