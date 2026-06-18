// 쿠폰(Coupons) API — 출처 계약: docs/micoz_api.md §11 + Swagger 교차확인. 인증 필요. 조회 전용(주문 적용 API 미지원).
// 어댑터: UserCouponItem → 뷰모델. 유형/상태 라벨·할인 표기는 lib/data enums + 매퍼.
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGet } from './client'
import { won } from '../lib/format'
import { COUPON_TYPE_LABEL, COUPON_STATUS_LABEL, type CouponType, type CouponStatus } from '../lib/data'

interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
export interface UserCouponItemDto {
  userCouponSeq: number
  couponSeq: number
  couponCode: string
  couponName: string
  couponType: string
  discountValue: number
  minOrderAmount?: number
  maxDiscount?: number
  description?: string
  couponStatus: string
  issuedDate?: string
  expireDate?: string
  usedDate?: string
  orderSeq?: number
}

const couponTypeLabel = (t: string) => COUPON_TYPE_LABEL[t as CouponType] ?? t
const couponStatusLabel = (s: string) => COUPON_STATUS_LABEL[s as CouponStatus] ?? s
const fmtDate = (iso?: string) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : '')

export interface CouponVM {
  userCouponSeq: number
  couponName: string
  couponCode: string
  typeLabel: string
  discountLabel: string // PERCENT → "10%", FIXED → "₩ 5,000"
  minOrderLabel: string
  maxDiscountLabel: string
  description: string
  status: string // raw: AVAILABLE/USED/EXPIRED
  statusLabel: string
  expireDate: string
  usedDate: string
}
export interface CouponsPageVM {
  items: CouponVM[]
  page: number
  totalElements: number
  totalPages: number
}

function toCouponVM(d: UserCouponItemDto): CouponVM {
  const isPercent = d.couponType === 'PERCENT'
  return {
    userCouponSeq: d.userCouponSeq,
    couponName: d.couponName,
    couponCode: d.couponCode,
    typeLabel: couponTypeLabel(d.couponType),
    discountLabel: isPercent ? `${d.discountValue}%` : won(d.discountValue),
    minOrderLabel: d.minOrderAmount ? `${won(d.minOrderAmount)} 이상` : '제한 없음',
    maxDiscountLabel: isPercent && d.maxDiscount ? `최대 ${won(d.maxDiscount)}` : '',
    description: d.description ?? '',
    status: d.couponStatus,
    statusLabel: couponStatusLabel(d.couponStatus),
    expireDate: fmtDate(d.expireDate),
    usedDate: fmtDate(d.usedDate),
  }
}

function getMyCouponsApi(page: number, size: number, status?: string): Promise<PageDto<UserCouponItemDto>> {
  const params: Record<string, string | number> = { page, size, sort: 'userCouponSeq,desc' }
  if (status) params.status = status
  return apiGet<PageDto<UserCouponItemDto>>('/me/coupons', { params })
}
export function useMyCoupons(enabled: boolean, page = 0, size = 20, status?: string) {
  return useQuery({
    queryKey: ['my-coupons', page, size, status ?? 'all'],
    queryFn: () => getMyCouponsApi(page, size, status),
    enabled,
    placeholderData: keepPreviousData,
    select: (d): CouponsPageVM => ({ items: d.content.map(toCouponVM), page: d.page, totalElements: d.totalElements, totalPages: d.totalPages }),
  })
}
