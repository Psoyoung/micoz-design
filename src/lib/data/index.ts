// MICOZ 데이터 레이어 배럴 — 타입·enum·시드 데이터 단일 진입점.
// import { PRODUCTS, ORDERS, ORDER_STATUS_LABEL, type Product } from '@/lib/data'

export * from './enums'
export * from './types'

// 시드 데이터 (출처: shop/data.jsx · admin/admin-data.jsx)
export { PRODUCTS, STOREFRONT_CATEGORIES, COLLECTIONS } from './products'
export { MEMBERS, GRADE_TIERS } from './members'
export { CATEGORY_TREE } from './categories'
export { ADMIN_PRODUCTS } from './admin-products'
export { ORDERS, generateOrderNo } from './orders'
export { RETURNS } from './returns'
export { ADMIN_USER, SALES_30D, TOP_PRODUCTS_30D } from './dashboard'
