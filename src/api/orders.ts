// 주문/결제(Orders) API — 출처 계약: docs/micoz_api.md §7.1·§7.2 + Swagger 교차확인. 인증 필요.
// 핵심 계약(라이브 검증): clientAmount = finalAmount = itemsTotal + shippingFee - totalDiscount.
//   배송비 = itemsTotal ≥ 50,000 → 0, 그 외 3,000 (서버 규칙 = 프론트 규칙 일치). 쿠폰/포인트는 주문 DTO 에 없음(Phase 5).
//   orderNo 는 서버 발급(MZ-yyMMdd-NNNNN) — 클라 generateOrderNo 미사용.
import { useMutation } from '@tanstack/react-query'
import { apiPost, ApiError } from './client'
import { catalogErrorMessage } from './catalog'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface CreateOrderRequest {
  cartSeqs: number[]
  addressSeq?: number
  recipientName?: string
  recipientPhone?: string
  zipCode?: string
  address?: string
  addressDetail?: string
  shippingMemo?: string
  isRemote?: boolean
  clientAmount: number
}
export interface OrderCreatedDto {
  orderSeq: number
  orderNo: string
  orderStatus: string // "PENDING"
  itemsTotal: number
  totalDiscount: number
  shippingFee: number
  finalAmount: number
  pointToEarn: number
}
export type PaymentType = 'CARD' | 'KAKAO' | 'NAVER'
export interface PayOrderRequest {
  paymentType: PaymentType
  cardNo?: string
  installment?: number
}
export interface PayOrderDto {
  orderNo: string
  orderStatus: string // "PAID"
  paymentStatus: string // "PAID"
  paidAmount: number
  approvalNo: string
  cardCompany: string
  cardNoMasked: string
  pointToEarn: number
  paidDate: string
}

/* ─── 에러 문구 — 주문/결제 코드 → 한글 친화 메시지 ───────── */
const ORDER_ERROR_MESSAGES: Record<string, string> = {
  ORDER_AMOUNT_MISMATCH: '주문 금액이 변경되었습니다. 장바구니를 다시 확인해주세요.',
  PRODUCT_SOLD_OUT: '품절된 상품이 포함되어 있어 주문할 수 없습니다.',
  ADDRESS_REQUIRED: '배송지를 입력해주세요.',
  ADDRESS_NOT_FOUND: '선택한 배송지를 찾을 수 없습니다. 다시 선택해주세요.',
  ORDER_EMPTY_ITEMS: '주문할 상품이 없습니다.',
  CART_ITEM_NOT_FOUND: '장바구니 정보를 확인해주세요.',
  CART_OPTION_REQUIRED: '상품 옵션을 다시 선택해주세요.',
  PAY_APPROVAL_FAILED: '결제가 거절되었습니다. 카드 정보를 확인 후 다시 시도해주세요.',
  ORDER_INVALID_STATUS: '이미 처리된 주문입니다.',
  ORDER_NOT_FOUND: '주문을 찾을 수 없습니다.',
}
export function orderErrorMessage(err: unknown): string {
  if (err instanceof ApiError && ORDER_ERROR_MESSAGES[err.code]) return ORDER_ERROR_MESSAGES[err.code]
  return catalogErrorMessage(err)
}

/* ─── API 함수 ────────────────────────────────────────── */
function createOrderApi(body: CreateOrderRequest): Promise<OrderCreatedDto> {
  return apiPost<OrderCreatedDto>('/orders', body)
}
function payOrderApi(orderSeq: number, body: PayOrderRequest): Promise<PayOrderDto> {
  return apiPost<PayOrderDto>(`/orders/${orderSeq}/pay`, body)
}

/* ─── 뮤테이션 훅 ─────────────────────────────────────── */
export function useCreateOrder() {
  return useMutation({ mutationFn: (body: CreateOrderRequest) => createOrderApi(body) })
}
export function usePayOrder() {
  return useMutation({ mutationFn: (v: { orderSeq: number; body: PayOrderRequest }) => payOrderApi(v.orderSeq, v.body) })
}
