// 체크아웃 2단계(주문 생성 → 결제) 공용 훅 — 데스크탑/모바일 공유.
// POST /orders(PENDING) → POST /orders/{seq}/pay. 결제 거절(PAY_APPROVAL_FAILED) 시 주문은 PENDING 유지 →
//   orderSeq 보존하여 재시도 시 주문 재생성 없이 결제만 재호출. 결제 성공 시 서버가 카트 정리 → ['cart'] invalidate.
import { useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateOrder, usePayOrder, type CreateOrderRequest, type PayOrderRequest, type PaymentType } from '../../../api/orders'

// 주문 완료 화면이 받는 뷰모델(PayOrderResponse 기반).
export interface CheckoutResult {
  orderNo: string
  paidAmount: number
  approvalNo: string
  cardCompany: string
  cardNoMasked: string
  pointToEarn: number
  paymentType: PaymentType
}

// 배송지: 저장 배송지(seq) 또는 신규 입력 필드.
export type ShippingTarget =
  | { addressSeq: number }
  | { recipientName: string; recipientPhone: string; zipCode: string; address: string; addressDetail?: string }

export interface SubmitParams {
  cartSeqs: number[]
  clientAmount: number
  shipping: ShippingTarget
  shippingMemo?: string
  isRemote?: boolean
  payment: PayOrderRequest
}

export function useCheckout() {
  const qc = useQueryClient()
  const createM = useCreateOrder()
  const payM = usePayOrder()
  // 결제 거절 후 재시도용 — 생성된 PENDING 주문 seq 보존(재시도 시 결제만 재호출).
  const pendingOrderSeq = useRef<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (params: SubmitParams): Promise<CheckoutResult> => {
    setSubmitting(true)
    try {
      let orderSeq = pendingOrderSeq.current
      if (orderSeq == null) {
        const body: CreateOrderRequest = {
          cartSeqs: params.cartSeqs,
          clientAmount: params.clientAmount,
          shippingMemo: params.shippingMemo,
          isRemote: params.isRemote,
          ...params.shipping,
        }
        const created = await createM.mutateAsync(body)
        orderSeq = created.orderSeq
        pendingOrderSeq.current = orderSeq // 결제 실패 시 재시도 위해 보존
      }
      const paid = await payM.mutateAsync({ orderSeq, body: params.payment })
      pendingOrderSeq.current = null // 결제 성공 → 보존 해제
      void qc.invalidateQueries({ queryKey: ['cart'] }) // 서버가 카트 정리함
      return {
        orderNo: paid.orderNo,
        paidAmount: paid.paidAmount,
        approvalNo: paid.approvalNo,
        cardCompany: paid.cardCompany,
        cardNoMasked: paid.cardNoMasked,
        pointToEarn: paid.pointToEarn,
        paymentType: params.payment.paymentType,
      }
    } finally {
      setSubmitting(false)
    }
  }

  // 카트/배송지 변경 등으로 보존된 PENDING 주문을 버려야 할 때.
  const resetPending = () => {
    pendingOrderSeq.current = null
  }

  return { submit, submitting, resetPending, hasPending: () => pendingOrderSeq.current != null }
}

export type { PaymentType }
