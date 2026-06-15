// 관리자 상품목록 — 출처: 원본 admin/admin-data.jsx ADMIN_PRODUCTS (값 보존)
// status 한글 → ProductStatus (판매중/재고부족/품절/판매중지).
// line 은 presentational (스키마 외). updated → updatedDate (* u_date).

import type { AdminProductRow } from './types'

export const ADMIN_PRODUCTS: AdminProductRow[] = [
  {
    sku: 'BIE-ES-050', name: '비온 에센스 50ml', line: '비온', categoryName: '에센스',
    price: 138000, stockQty: 412, status: 'ON_SALE', updatedDate: '2026-05-12', sales30: 286,
    options: [
      { name: '50ml', price: 138000, stockQty: 412, sortOrder: 0 },
      { name: '100ml', price: 248000, stockQty: 188, sortOrder: 1 },
      { name: '리필 50ml', price: 118000, stockQty: 76, sortOrder: 2 },
    ],
  },
  { sku: 'BIE-ES-100', name: '비온 에센스 100ml', line: '비온', categoryName: '에센스', price: 248000, stockQty: 188, status: 'ON_SALE', updatedDate: '2026-05-12', sales30: 124 },
  { sku: 'BIE-RE-050', name: '비온 에센스 리필 50ml', line: '비온', categoryName: '에센스', price: 118000, stockQty: 76, status: 'LOW_STOCK', updatedDate: '2026-05-08', sales30: 92 },
  { sku: 'JER-SE-030', name: '제린 세럼 30ml', line: '제린', categoryName: '세럼', price: 168000, stockQty: 240, status: 'ON_SALE', updatedDate: '2026-05-15', sales30: 198 },
  { sku: 'JER-SE-050', name: '제린 세럼 50ml', line: '제린', categoryName: '세럼', price: 258000, stockQty: 122, status: 'ON_SALE', updatedDate: '2026-05-15', sales30: 84 },
  { sku: 'LUA-CR-050', name: '루안 크림 50ml', line: '루안', categoryName: '크림', price: 198000, stockQty: 308, status: 'ON_SALE', updatedDate: '2026-05-09', sales30: 156 },
  { sku: 'LUA-CR-075', name: '루안 크림 75ml', line: '루안', categoryName: '크림', price: 278000, stockQty: 44, status: 'LOW_STOCK', updatedDate: '2026-05-09', sales30: 62 },
  { sku: 'DAN-TO-150', name: '단아 토너 150ml', line: '단아', categoryName: '토너', price: 78000, stockQty: 522, status: 'ON_SALE', updatedDate: '2026-04-28', sales30: 412 },
  { sku: 'DAN-TO-300', name: '단아 토너 300ml', line: '단아', categoryName: '토너', price: 138000, stockQty: 218, status: 'ON_SALE', updatedDate: '2026-04-28', sales30: 168 },
  { sku: 'YEO-CL-180', name: '여원 클렌저 180ml', line: '여원', categoryName: '클렌징', price: 58000, stockQty: 612, status: 'ON_SALE', updatedDate: '2026-05-02', sales30: 528 },
  { sku: 'SOD-MS-120', name: '소단 마스크 120ml', line: '소단', categoryName: '마스크', price: 88000, stockQty: 0, status: 'SOLD_OUT', updatedDate: '2026-05-18', sales30: 244 },
  { sku: 'SOD-MS-PK5', name: '소단 마스크 5팩 세트', line: '소단', categoryName: '마스크', price: 38000, stockQty: 184, status: 'ON_SALE', updatedDate: '2026-05-18', sales30: 318 },
  { sku: 'CHE-MI-080', name: '청아 미스트 80ml', line: '청아', categoryName: '미스트', price: 48000, stockQty: 388, status: 'ON_SALE', updatedDate: '2026-04-22', sales30: 276 },
  { sku: 'ADA-EY-020', name: '아담 아이크림 20ml', line: '아담', categoryName: '아이케어', price: 128000, stockQty: 162, status: 'ON_SALE', updatedDate: '2026-05-11', sales30: 108 },
  { sku: 'BIE-KT-SET', name: '비온 디스커버리 키트', line: '비온', categoryName: '세트', price: 168000, stockQty: 92, status: 'ON_SALE', updatedDate: '2026-05-06', sales30: 142 },
  { sku: 'WIN-LE-001', name: '윈터 에디션 — 단종', line: '아카이브', categoryName: '세트', price: 198000, stockQty: 18, status: 'STOPPED', updatedDate: '2026-01-14', sales30: 0 },
]
