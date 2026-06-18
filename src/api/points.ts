// 포인트(Points) API — 출처 계약: docs/micoz_api.md §10 + Swagger 교차확인. 인증 필요. 조회 전용.
// 어댑터: MyPointResponse{balance, history: PageResponse<PointHistoryItem>} → 뷰모델. 유형 라벨은 lib/data enums 재사용.
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGet } from './client'
import { POINT_TYPE_LABEL, type PointType } from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
export interface PointHistoryItemDto {
  pointSeq: number
  pointType: string
  pointAmount: number
  balanceAfter: number
  reason?: string
  orderSeq?: number
  expireDate?: string
  createdDate: string
}
export interface MyPointDto {
  balance: number
  history: PageDto<PointHistoryItemDto>
}

const pointTypeLabel = (t: string) => POINT_TYPE_LABEL[t as PointType] ?? t
const fmtDate = (iso?: string) => (iso ? `${iso.slice(0, 10).replace(/-/g, '.')} ${iso.slice(11, 16)}`.trim() : '')

/* ─── 뷰모델 ──────────────────────────────────────────── */
export interface PointHistoryVM {
  pointSeq: number
  pointType: string
  typeLabel: string
  pointAmount: number
  balanceAfter: number
  reason: string
  createdDate: string
  expireDate: string
}
export interface MyPointVM {
  balance: number
  history: PointHistoryVM[]
  page: number
  totalElements: number
  totalPages: number
}

function toMyPointVM(d: MyPointDto): MyPointVM {
  return {
    balance: d.balance,
    history: d.history.content.map((h) => ({
      pointSeq: h.pointSeq,
      pointType: h.pointType,
      typeLabel: pointTypeLabel(h.pointType),
      pointAmount: h.pointAmount,
      balanceAfter: h.balanceAfter,
      reason: h.reason ?? '',
      createdDate: fmtDate(h.createdDate),
      expireDate: fmtDate(h.expireDate),
    })),
    page: d.history.page,
    totalElements: d.history.totalElements,
    totalPages: d.history.totalPages,
  }
}

/* ─── API + 훅 ────────────────────────────────────────── */
function getMyPointsApi(page: number, size: number): Promise<MyPointDto> {
  return apiGet<MyPointDto>('/me/points', { params: { page, size, sort: 'pointSeq,desc' } })
}
export function useMyPoints(enabled: boolean, page = 0, size = 20) {
  return useQuery({
    queryKey: ['my-points', page, size],
    queryFn: () => getMyPointsApi(page, size),
    enabled,
    placeholderData: keepPreviousData,
    select: toMyPointVM,
  })
}
