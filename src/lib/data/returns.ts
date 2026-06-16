// 관리자 반품·교환 — 출처: 원본 admin/admin-data.jsx RETURNS (값 보존)
// type: 반품→RETURN/교환→EXCHANGE/취소→CANCEL
// status: 신청→REQUESTED/승인→APPROVED/회수중→COLLECTED/검수중→INSPECTED/완료→COMPLETED/반려→REJECTED
// reasonType: 단순변심→CHANGE_OF_MIND/불량→DEFECT/오배송→WRONG_DELIVERY
// 상품은 목업이 단일로 평면화되어 productName/optionName/quantity 로 직접 보유 (dat_return_item 정규화는 이식 단계).

import type { ReturnRequest } from './types'

export const RETURNS: ReturnRequest[] = [
  {
    returnNo: 'R-260520-0012', orderNo: 'O-260519-0413', customerName: '백수민',
    type: 'RETURN', status: 'INSPECTED', reasonType: 'CHANGE_OF_MIND',
    reason: '향이 생각했던 것과 달라 반품 신청합니다.',
    productName: '소단 마스크 120ml', optionName: '120ml', quantity: 1,
    refundAmount: 88000, returnShippingFee: 6000,
    pickupZipCode: '06236', pickupAddress: '서울 강남구 테헤란로 152', pickupPhone: '010-1198-7700',
    requestedDate: '2026-05-20 09:41', completedDate: null,
  },
  {
    returnNo: 'R-260519-0011', orderNo: 'O-260518-0419', customerName: '박서영',
    type: 'EXCHANGE', status: 'COLLECTED', reasonType: 'DEFECT',
    reason: '펌프 용기가 눌리지 않습니다. 동일 옵션으로 교환 원합니다.',
    productName: '비온 에센스 50ml', optionName: '50ml', quantity: 1,
    refundAmount: 0, returnShippingFee: 0,
    pickupZipCode: '04524', pickupAddress: '서울 중구 세종대로 110', pickupPhone: '010-2841-9921',
    requestedDate: '2026-05-19 18:02', completedDate: null,
  },
  {
    returnNo: 'R-260519-0010', orderNo: 'O-260519-0415', customerName: '윤소희',
    type: 'CANCEL', status: 'COMPLETED', reasonType: 'CHANGE_OF_MIND',
    reason: '주문 실수로 취소합니다.',
    productName: '단아 토너 150ml', optionName: '150ml', quantity: 2,
    refundAmount: 156000, returnShippingFee: 0,
    pickupZipCode: '', pickupAddress: '', pickupPhone: '010-8841-2230',
    requestedDate: '2026-05-19 17:10', completedDate: '2026-05-19 17:40',
  },
  {
    returnNo: 'R-260518-0009', orderNo: 'O-260517-0388', customerName: '임채린',
    type: 'RETURN', status: 'REQUESTED', reasonType: 'WRONG_DELIVERY',
    reason: '주문하지 않은 제품이 배송되었습니다.',
    productName: '루안 크림 50ml', optionName: '50ml', quantity: 1,
    refundAmount: 198000, returnShippingFee: 0,
    pickupZipCode: '03187', pickupAddress: '서울 종로구 종로 1', pickupPhone: '010-2204-7711',
    requestedDate: '2026-05-18 13:25', completedDate: null,
  },
  {
    returnNo: 'R-260517-0008', orderNo: 'O-260515-0301', customerName: '한지원',
    type: 'RETURN', status: 'APPROVED', reasonType: 'CHANGE_OF_MIND',
    reason: '피부에 맞지 않아 반품합니다.',
    productName: '제린 세럼 30ml', optionName: '30ml', quantity: 1,
    refundAmount: 168000, returnShippingFee: 6000,
    pickupZipCode: '13529', pickupAddress: '경기 성남시 분당구 판교역로 235', pickupPhone: '010-5512-7700',
    requestedDate: '2026-05-17 10:48', completedDate: null,
  },
  {
    returnNo: 'R-260516-0007', orderNo: 'O-260514-0276', customerName: '오나래',
    type: 'EXCHANGE', status: 'REJECTED', reasonType: 'CHANGE_OF_MIND',
    reason: '색상 교환 요청 — 한정판으로 교환 불가 안내.',
    productName: '소단 마스크 5팩 세트', optionName: '5팩 세트', quantity: 1,
    refundAmount: 0, returnShippingFee: 0,
    pickupZipCode: '', pickupAddress: '', pickupPhone: '010-3380-1199',
    requestedDate: '2026-05-16 20:14', completedDate: '2026-05-17 09:02',
  },
]
