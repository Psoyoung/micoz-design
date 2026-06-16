// 관리자 주문목록 — 출처: 원본 admin/admin-data.jsx ORDERS (값 보존)
// payment 한글 → PaymentType (카드→CARD, 계좌이체→BANK, 간편결제→KAKAO 대표값, D-6).
// status 한글 → (orderStatus, paymentStatus): 결제완료=(PAID,PAID) / 입금대기=(PENDING,PENDING)
//   / 취소=(CANCELED,CANCELED) / 환불=(RETURNED,REFUNDED). '환불' 표시는 deriveOrderDisplayStatus.
// shipping 한글 → ShippingStatus, 단 취소/반품완료는 null (deriveOrderShippingDisplay 로 표시 파생).

import type { OrderListRow } from './types'

// 주문번호 생성 규칙 — 데이터단계 ORDERS 의 'O-YYMMDD-NNNN' 형식과 일관.
// (스키마 COMMENT 예시는 'MZ-...' 이나 lib/data ORDERS 가 'O-' 형식이므로 그에 맞춤.)
// 클라이언트 목업용 — 실제 시퀀스는 API 단계에서 서버가 발급.
export function generateOrderNo(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const seq = String(date.getHours() * 100 + date.getMinutes()).padStart(4, '0')
  return `O-${yy}${mm}${dd}-${seq}`
}

export const ORDERS: OrderListRow[] = [
  { orderNo: 'O-260520-0421', orderDate: '2026-05-20 14:22', customerName: '문서아', itemCount: 3, finalAmount: 484000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'READY' },
  { orderNo: 'O-260520-0420', orderDate: '2026-05-20 13:48', customerName: '강주아', itemCount: 2, finalAmount: 296000, paymentType: 'BANK', orderStatus: 'PENDING', paymentStatus: 'PENDING', shippingStatus: 'READY' },
  { orderNo: 'O-260520-0419', orderDate: '2026-05-20 12:31', customerName: '박서영', itemCount: 5, finalAmount: 812000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'IN_TRANSIT' },
  { orderNo: 'O-260520-0418', orderDate: '2026-05-20 11:09', customerName: '한지원', itemCount: 1, finalAmount: 138000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'READY' },
  { orderNo: 'O-260520-0417', orderDate: '2026-05-20 10:54', customerName: '임채린', itemCount: 2, finalAmount: 326000, paymentType: 'KAKAO', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'READY' },
  { orderNo: 'O-260520-0416', orderDate: '2026-05-20 09:32', customerName: '신예진', itemCount: 1, finalAmount: 78000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'DELIVERED' },
  { orderNo: 'O-260519-0418', orderDate: '2026-05-19 22:15', customerName: '이하늘', itemCount: 4, finalAmount: 538000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'IN_TRANSIT' },
  { orderNo: 'O-260519-0417', orderDate: '2026-05-19 20:41', customerName: '최민지', itemCount: 2, finalAmount: 246000, paymentType: 'KAKAO', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'IN_TRANSIT' },
  { orderNo: 'O-260519-0416', orderDate: '2026-05-19 18:22', customerName: '정유나', itemCount: 1, finalAmount: 198000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'DELIVERED' },
  { orderNo: 'O-260519-0415', orderDate: '2026-05-19 17:58', customerName: '윤소희', itemCount: 3, finalAmount: 264000, paymentType: 'CARD', orderStatus: 'CANCELED', paymentStatus: 'CANCELED', shippingStatus: null },
  { orderNo: 'O-260519-0414', orderDate: '2026-05-19 16:11', customerName: '문서아', itemCount: 2, finalAmount: 416000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'DELIVERED' },
  { orderNo: 'O-260519-0413', orderDate: '2026-05-19 14:02', customerName: '백수민', itemCount: 1, finalAmount: 88000, paymentType: 'CARD', orderStatus: 'RETURNED', paymentStatus: 'REFUNDED', shippingStatus: null },
  { orderNo: 'O-260519-0412', orderDate: '2026-05-19 11:39', customerName: '한지원', itemCount: 2, finalAmount: 196000, paymentType: 'KAKAO', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'DELIVERED' },
  { orderNo: 'O-260518-0419', orderDate: '2026-05-18 21:48', customerName: '박서영', itemCount: 6, finalAmount: 924000, paymentType: 'CARD', orderStatus: 'PAID', paymentStatus: 'PAID', shippingStatus: 'DELIVERED' },
]
