// MICOZ 도메인 enum (코드성 값 → TS 유니언) + 한글 라벨맵 + 파생 헬퍼
// 출처: docs/micoz_schema.sql 의 COLUMN COMMENT 를 진실의 원천으로 삼는다.
// 화면 표시는 원본 목업의 한글값을 라벨맵으로 복원한다.

/* ─── 사용자 / 권한 ─────────────────────────────────────── */
export type UserRole = 'CUSTOMER' | 'ADMIN'

// mst_user.user_status — 스키마: ACTIVE/DORMANT/WITHDRAWN
// WITHDRAW_REQUESTED 는 목업 '탈퇴신청' 보존을 위해 추가 (스키마 보강 후보)
export type UserStatus = 'ACTIVE' | 'DORMANT' | 'WITHDRAW_REQUESTED' | 'WITHDRAWN'
export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  DORMANT: '휴면',
  WITHDRAW_REQUESTED: '탈퇴신청',
  WITHDRAWN: '탈퇴',
}

/* ─── 상품 ─────────────────────────────────────────────── */
export type ProductStatus = 'ON_SALE' | 'LOW_STOCK' | 'SOLD_OUT' | 'STOPPED'
export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  ON_SALE: '판매중',
  LOW_STOCK: '재고부족',
  SOLD_OUT: '품절',
  STOPPED: '판매중지',
}

export type ImageType = 'MAIN' | 'SUB' | 'DETAIL'

/* ─── 주문 / 결제 / 배송 ────────────────────────────────── */
export type OrderStatus =
  | 'PENDING' | 'PAID' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELED' | 'RETURNED'
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '입금대기',
  PAID: '결제완료',
  PREPARING: '준비중',
  SHIPPING: '배송중',
  DELIVERED: '배송완료',
  CANCELED: '취소',
  RETURNED: '반품',
}

export type OrderItemStatus =
  | 'NORMAL' | 'CANCEL_REQUESTED' | 'CANCELED' | 'RETURN_REQUESTED' | 'RETURNED' | 'EXCHANGED'

export type PaymentType =
  | 'CARD' | 'VBANK' | 'BANK' | 'PHONE'
  | 'KAKAOPAY' | 'NAVERPAY' | 'TOSS' | 'SAMSUNGPAY' | 'PAYCO' | 'POINT'
// 스키마 정렬 — 현재 미사용(주문관리 표시는 paymentGroupLabel). API/후속 화면용 보존.
export const PAYMENT_TYPE_LABEL: Record<PaymentType, string> = {
  CARD: '카드',
  VBANK: '가상계좌',
  BANK: '계좌이체',
  PHONE: '휴대폰결제',
  KAKAOPAY: '카카오페이',
  NAVERPAY: '네이버페이',
  TOSS: '토스',
  SAMSUNGPAY: '삼성페이',
  PAYCO: '페이코',
  POINT: '포인트',
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELED' | 'REFUNDED'
// 스키마 정렬 — 현재 미사용(표시는 deriveOrderDisplayStatus). API/후속 화면용 보존.
export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: '대기',
  PAID: '결제완료',
  CANCELED: '취소',
  REFUNDED: '환불',
}

export type ShippingStatus = 'READY' | 'SHIPPED' | 'IN_TRANSIT' | 'DELIVERED'
export const SHIPPING_STATUS_LABEL: Record<ShippingStatus, string> = {
  READY: '준비중',
  SHIPPED: '출고',
  IN_TRANSIT: '배송중',
  DELIVERED: '배송완료',
}

/* ─── 취소 / 교환 / 반품 ────────────────────────────────── */
export type ReturnType = 'CANCEL' | 'EXCHANGE' | 'RETURN'
export const RETURN_TYPE_LABEL: Record<ReturnType, string> = {
  CANCEL: '취소',
  EXCHANGE: '교환',
  RETURN: '반품',
}

export type ReturnStatus =
  | 'REQUESTED' | 'APPROVED' | 'PICKUP' | 'INSPECTING' | 'COMPLETED' | 'REJECTED'
export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: '신청',
  APPROVED: '승인',
  PICKUP: '회수중',
  INSPECTING: '검수중',
  COMPLETED: '완료',
  REJECTED: '반려',
}

export type ReturnReasonType = 'CHANGE_MIND' | 'DEFECT' | 'WRONG_DELIVERY' | 'OTHER'
export const RETURN_REASON_LABEL: Record<ReturnReasonType, string> = {
  CHANGE_MIND: '단순변심',
  DEFECT: '불량',
  WRONG_DELIVERY: '오배송',
  OTHER: '기타',
}

/* ─── 쿠폰 / 포인트 ─────────────────────────────────────── */
// 스키마 정렬 — 미이식 도메인(쿠폰·포인트 화면 없음). API/후속 화면용 보존.
export type CouponType = 'AMOUNT' | 'RATE'
export const COUPON_TYPE_LABEL: Record<CouponType, string> = {
  AMOUNT: '정액',
  RATE: '정률',
}

export type CouponStatus = 'AVAILABLE' | 'USED' | 'EXPIRED'
export const COUPON_STATUS_LABEL: Record<CouponStatus, string> = {
  AVAILABLE: '사용가능',
  USED: '사용완료',
  EXPIRED: '만료',
}

export type PointType = 'EARN' | 'USE' | 'EXPIRE' | 'CANCEL'
export const POINT_TYPE_LABEL: Record<PointType, string> = {
  EARN: '적립',
  USE: '사용',
  EXPIRE: '소멸',
  CANCEL: '취소환원',
}

/* ─── 1:1 문의 ─────────────────────────────────────────── */
// 스키마: WAITING/ANSWERED/CLOSED. IN_PROGRESS 는 목업 '진행중' 보존을 위해 추가 (스키마 보강 후보)
export type InquiryStatus = 'WAITING' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED'
export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  WAITING: '대기',
  IN_PROGRESS: '진행중',
  ANSWERED: '답변완료',
  CLOSED: '종료',
}

// 목업(admin/shop)의 7종 분류를 코드화 — 이 코드를 스키마 기준값으로 간주 (D-7)
export type InquiryType =
  | 'SHIPPING' | 'REFUND_EXCHANGE' | 'RESTOCK' | 'PRODUCT' | 'COUPON_PROMO' | 'MEMBER_GRADE' | 'ETC'
export const INQUIRY_TYPE_LABEL: Record<InquiryType, string> = {
  SHIPPING: '주문 · 배송',
  REFUND_EXCHANGE: '환불 · 교환',
  RESTOCK: '재입고',
  PRODUCT: '제품 · 사용법',
  COUPON_PROMO: '쿠폰 · 프로모션',
  MEMBER_GRADE: '회원 · 직급',
  ETC: '기타',
}

/* ─── 배너 ─────────────────────────────────────────────── */
// 스키마 정렬 — 미이식(배너 타입 라벨 미표시, BannerView 는 항상 HERO). API/후속 화면용 보존.
export type BannerType = 'HERO' | 'CATEGORY' | 'PROMO'
export const BANNER_TYPE_LABEL: Record<BannerType, string> = {
  HERO: '메인',
  CATEGORY: '카테고리',
  PROMO: '프로모션',
}

/* ─── 파생 헬퍼 ─────────────────────────────────────────── */

// D-6: 구체 payment_type 을 그룹 라벨(카드/계좌이체/무통장입금/간편결제/…)로 묶어 표시
// 원본 주문관리 표시 문자열 보존: CARD='카드', BANK='계좌이체', KAKAOPAY 등 간편결제군='간편결제'.
// BANK(실시간 계좌이체)와 VBANK(가상계좌·무통장입금)는 서로 다른 결제수단이므로 분리한다.
export function paymentGroupLabel(type: PaymentType): string {
  switch (type) {
    case 'CARD':
      return '카드'
    case 'BANK':
      return '계좌이체'
    case 'VBANK':
      return '무통장입금'
    case 'KAKAOPAY':
    case 'NAVERPAY':
    case 'TOSS':
    case 'SAMSUNGPAY':
    case 'PAYCO':
      return '간편결제'
    case 'PHONE':
      return '휴대폰결제'
    case 'POINT':
      return '포인트'
  }
}

// D-6: OrderStatus 에 REFUNDED 를 추가하지 않고, order_status + payment_status 조합으로 '환불' 표시 파생
export function deriveOrderDisplayStatus(order: {
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
}): string {
  if (order.orderStatus === 'RETURNED' && order.paymentStatus === 'REFUNDED') return '환불'
  return ORDER_STATUS_LABEL[order.orderStatus]
}

// 배송 컬럼 표시: 취소/반품 주문은 배송 상태가 N/A(null) 이므로 주문 상태에서 파생
// 원본 보존: 입금대기(PENDING) 주문은 출고 전이라 배송 '대기' 로 표시,
//   결제완료 주문의 READY 는 '준비중'. (데이터단계가 두 경우를 모두 READY 로 인코딩하므로 표시단에서 분기.)
export function deriveOrderShippingDisplay(order: {
  orderStatus: OrderStatus
  shippingStatus: ShippingStatus | null
}): string {
  if (order.shippingStatus === null) {
    if (order.orderStatus === 'CANCELED') return '취소'
    if (order.orderStatus === 'RETURNED') return '반품완료'
    return '-'
  }
  if (order.orderStatus === 'PENDING' && order.shippingStatus === 'READY') return '대기'
  return SHIPPING_STATUS_LABEL[order.shippingStatus]
}
