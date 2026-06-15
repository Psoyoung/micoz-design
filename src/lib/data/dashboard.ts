// 관리자 대시보드 집계 — 출처: 원본 admin/admin-data.jsx (값 보존). 스키마 외 리포팅 전용.
// SALES_30D 는 원본의 결정적 생성식(Math.sin/cos, 난수 아님)을 그대로 보존 → 동일 값 재현.
// ch→channel, t→time, msg→message 로만 camelCase 정규화.

import type { DailySales, TopProduct, AdminProfile } from './types'

export const ADMIN_USER: AdminProfile = {
  name: '김지은',
  role: '슈퍼관리자',
  email: 'jieun.kim@micoz.kr',
  lastLogin: '2026-05-20 09:14',
}

// 30일치 일매출 (원본 구성식 보존)
export const SALES_30D: DailySales[] = [
  18, 22, 19, 28, 31, 24, 17,
  20, 26, 33, 29, 36, 41, 34,
  27, 32, 38, 35, 42, 48, 39,
  31, 36, 44, 51, 47, 52, 58, 61, 64,
].map((v, i) => ({
  day: i + 1,
  amount: v * 100000 + Math.round(Math.sin(i) * 80000),
  orders: Math.round(v * 1.4 + Math.cos(i) * 3),
}))

export const TOP_PRODUCTS_30D: TopProduct[] = [
  { name: '여원 클렌저 180ml', units: 528, amount: 30624000 },
  { name: '단아 토너 150ml', units: 412, amount: 32136000 },
  { name: '소단 마스크 5팩', units: 318, amount: 12084000 },
  { name: '비온 에센스 50ml', units: 286, amount: 39468000 },
  { name: '청아 미스트 80ml', units: 276, amount: 13248000 },
]
