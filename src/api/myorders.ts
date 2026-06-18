// 내 주문 목록/상세(My Orders) API — 출처 계약: docs/micoz_api.md §7.3·§7.4 + Swagger 교차확인. 인증 필요.
// 어댑터: OrderListItem/OrderDetailResponse → 뷰모델. 상태 라벨은 lib/data enums 재사용(deriveOrderDisplayStatus 포함).
//   payment 는 PAID 인 것만 노출(null 가능). 대표 비주얼 grad 는 productSeq(상세)/orderSeq(목록) 팔레트로 파생.
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGet } from './client'
import { productPalette } from './catalog'
import {
  ORDER_STATUS_LABEL, SHIPPING_STATUS_LABEL, PAYMENT_TYPE_LABEL, PAYMENT_STATUS_LABEL,
  deriveOrderDisplayStatus,
  type OrderStatus, type ShippingStatus, type PaymentType, type PaymentStatus,
} from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface OrderListItemDto {
  orderSeq: number
  orderNo: string
  orderStatus: string
  orderDate: string
  finalAmount: number
  firstItemName: string
  totalItemCount: number
  mainImageUrl?: string
}
export interface OrderItemSnapshotDto {
  itemSeq: number
  productSeq: number
  optionSeq?: number
  productCode: string
  productName: string
  optionName?: string
  unitPrice: number
  quantity: number
  itemAmount: number
  mainImageUrl?: string
}
export interface OrderShippingDto {
  recipientName: string
  recipientPhone: string
  zipCode: string
  address: string
  addressDetail?: string
  shippingMemo?: string
  trackingNo?: string
  shippingStatus: string
  shippedDate?: string
  deliveredDate?: string
}
export interface OrderPaymentDto {
  paymentType: string
  paymentStatus: string
  paidAmount: number
  cardCompany?: string
  cardNoMasked?: string
  installment?: number
  approvalNo?: string
  paidDate?: string
}
export interface OrderDetailDto {
  orderSeq: number
  orderNo: string
  orderStatus: string
  orderDate: string
  itemsTotal: number
  totalDiscount: number
  couponDiscount: number
  pointUsed: number
  shippingFee: number
  finalAmount: number
  pointToEarn: number
  items: OrderItemSnapshotDto[]
  shipping?: OrderShippingDto
  payment?: OrderPaymentDto | null
}
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/* ─── 라벨 헬퍼 (미지의 코드는 원문 폴백) ────────────────── */
const orderStatusLabel = (s: string) => ORDER_STATUS_LABEL[s as OrderStatus] ?? s
const shippingStatusLabel = (s: string) => SHIPPING_STATUS_LABEL[s as ShippingStatus] ?? s
const paymentTypeLabel = (t: string) => PAYMENT_TYPE_LABEL[t as PaymentType] ?? t
const paymentStatusLabel = (s: string) => PAYMENT_STATUS_LABEL[s as PaymentStatus] ?? s

// ISO-8601 → 'YYYY.MM.DD' / 'YYYY.MM.DD HH:mm'
const fmtDate = (iso?: string) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : '')
const fmtDateTime = (iso?: string) => (iso ? `${iso.slice(0, 10).replace(/-/g, '.')} ${iso.slice(11, 16)}`.trim() : '')

/* ─── 뷰모델 ──────────────────────────────────────────── */
export interface OrderListVM {
  orderSeq: number
  orderNo: string
  statusLabel: string
  orderDate: string
  finalAmount: number
  firstItemName: string
  totalItemCount: number
  grad: string
}
export interface OrderItemVM {
  itemSeq: number
  productSeq: number
  productName: string
  optionName: string
  unitPrice: number
  quantity: number
  itemAmount: number
  grad: string
}
export interface OrderShippingVM {
  recipientName: string
  recipientPhone: string
  zipCode: string
  address: string
  addressDetail?: string
  shippingMemo?: string
  trackingNo?: string
  statusLabel: string
  shippedDate?: string
  deliveredDate?: string
}
export interface OrderPaymentVM {
  typeLabel: string
  statusLabel: string
  paidAmount: number
  cardCompany?: string
  cardNoMasked?: string
  installment?: number
  approvalNo?: string
  paidDate?: string
}
export interface OrderDetailVM {
  orderSeq: number
  orderNo: string
  orderStatus: string // raw — 반품/리뷰 신청 자격 판정용
  statusLabel: string
  orderDate: string
  itemsTotal: number
  totalDiscount: number
  shippingFee: number
  finalAmount: number
  pointToEarn: number
  items: OrderItemVM[]
  shipping?: OrderShippingVM
  payment?: OrderPaymentVM
}
export interface OrdersPageVM {
  items: OrderListVM[]
  page: number
  totalElements: number
  totalPages: number
}

/* ─── 매퍼 ────────────────────────────────────────────── */
function toOrderListVM(d: OrderListItemDto): OrderListVM {
  return {
    orderSeq: d.orderSeq,
    orderNo: d.orderNo,
    statusLabel: orderStatusLabel(d.orderStatus),
    orderDate: fmtDate(d.orderDate),
    finalAmount: d.finalAmount,
    firstItemName: d.firstItemName,
    totalItemCount: d.totalItemCount,
    grad: productPalette(d.orderSeq).grad,
  }
}
function toOrderItemVM(d: OrderItemSnapshotDto): OrderItemVM {
  return {
    itemSeq: d.itemSeq,
    productSeq: d.productSeq,
    productName: d.productName,
    optionName: d.optionName ?? '',
    unitPrice: d.unitPrice,
    quantity: d.quantity,
    itemAmount: d.itemAmount,
    grad: productPalette(d.productSeq).grad,
  }
}
function toOrderDetailVM(d: OrderDetailDto): OrderDetailVM {
  // payment 가 있으면 paymentStatus 와 조합해 '환불' 등 표시 파생.
  const statusLabel = d.payment
    ? deriveOrderDisplayStatus({ orderStatus: d.orderStatus as OrderStatus, paymentStatus: d.payment.paymentStatus as PaymentStatus })
    : orderStatusLabel(d.orderStatus)
  return {
    orderSeq: d.orderSeq,
    orderNo: d.orderNo,
    orderStatus: d.orderStatus,
    statusLabel,
    orderDate: fmtDateTime(d.orderDate),
    itemsTotal: d.itemsTotal,
    totalDiscount: d.totalDiscount,
    shippingFee: d.shippingFee,
    finalAmount: d.finalAmount,
    pointToEarn: d.pointToEarn,
    items: d.items.map(toOrderItemVM),
    shipping: d.shipping
      ? {
          recipientName: d.shipping.recipientName,
          recipientPhone: d.shipping.recipientPhone,
          zipCode: d.shipping.zipCode,
          address: d.shipping.address,
          addressDetail: d.shipping.addressDetail,
          shippingMemo: d.shipping.shippingMemo,
          trackingNo: d.shipping.trackingNo,
          statusLabel: shippingStatusLabel(d.shipping.shippingStatus),
          shippedDate: fmtDateTime(d.shipping.shippedDate),
          deliveredDate: fmtDateTime(d.shipping.deliveredDate),
        }
      : undefined,
    payment: d.payment
      ? {
          typeLabel: paymentTypeLabel(d.payment.paymentType),
          statusLabel: paymentStatusLabel(d.payment.paymentStatus),
          paidAmount: d.payment.paidAmount,
          cardCompany: d.payment.cardCompany,
          cardNoMasked: d.payment.cardNoMasked,
          installment: d.payment.installment,
          approvalNo: d.payment.approvalNo,
          paidDate: fmtDateTime(d.payment.paidDate),
        }
      : undefined,
  }
}

/* ─── API 함수 ────────────────────────────────────────── */
function getMyOrdersApi(page: number, size: number): Promise<PageDto<OrderListItemDto>> {
  return apiGet<PageDto<OrderListItemDto>>('/me/orders', { params: { page, size, sort: 'orderSeq,desc' } })
}
function getMyOrderApi(orderSeq: number): Promise<OrderDetailDto> {
  return apiGet<OrderDetailDto>(`/me/orders/${orderSeq}`)
}

/* ─── React Query 훅 ──────────────────────────────────── */
export function useMyOrders(enabled: boolean, page = 0, size = 10) {
  return useQuery({
    queryKey: ['my-orders', page, size],
    queryFn: () => getMyOrdersApi(page, size),
    enabled,
    placeholderData: keepPreviousData,
    select: (d): OrdersPageVM => ({
      items: d.content.map(toOrderListVM),
      page: d.page,
      totalElements: d.totalElements,
      totalPages: d.totalPages,
    }),
  })
}
export function useMyOrder(orderSeq: number | null) {
  return useQuery({
    queryKey: ['my-order', orderSeq],
    queryFn: () => getMyOrderApi(orderSeq!),
    enabled: orderSeq != null,
    select: toOrderDetailVM,
  })
}
