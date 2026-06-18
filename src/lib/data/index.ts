// MICOZ 데이터 레이어 배럴 — 타입·enum·시드 데이터 단일 진입점.
// import { PRODUCTS, ORDERS, ORDER_STATUS_LABEL, type Product } from '@/lib/data'

export * from './enums'
export * from './types'

// 시드 데이터 (출처: shop/data.jsx · admin/admin-data.jsx)
// shop 카탈로그 시드(PRODUCTS/STOREFRONT_CATEGORIES)·generateOrderNo 는 API 대체로 제거(Phase 6a). COLLECTIONS(에디토리얼)만 보존.
export { COLLECTIONS } from './products'
export { MEMBERS, GRADE_TIERS } from './members'
export { CATEGORY_TREE } from './categories'
export { ADMIN_PRODUCTS } from './admin-products'
export { ORDERS } from './orders'
export { RETURNS } from './returns'
export { ADMIN_USER, SALES_30D, TOP_PRODUCTS_30D } from './dashboard'
