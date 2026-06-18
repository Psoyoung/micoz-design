// 공개 카탈로그 API — 출처 계약: docs/micoz_api.md §4 + Swagger(/v3/api-docs) 교차확인.
// 어댑터 전략: DTO(명세 그대로) → 뷰모델(컴포넌트가 쓰는 형태). 프레젠테이션 필드(grad/accent/nameEn/line)는
//   API 에 없으므로 productSeq 기반 결정적 팔레트로 파생(디자인 보존 — MICOZ 는 사진이 아닌 그라디언트 Bottle 사용).
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { apiGet, ApiError } from './client'
import type { Product, ProductSummary, ProductStatus, ProductImage, ImageType } from '../lib/data'

// 카탈로그 에러 표시 문구 — UNKNOWN/네트워크/5xx 는 친화 한글, 그 외는 서버 message.
export function catalogErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'UNKNOWN' || err.httpStatus >= 500) return '일시적인 오류로 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
    return err.message
  }
  return '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
}

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface CategoryNodeDto {
  categorySeq: number
  categoryName: string
  urlSlug: string
  sortOrder: number
  children?: CategoryNodeDto[] // Swagger 스키마엔 누락이나 런타임 응답엔 존재(재귀)
}
export interface ProductListItemDto {
  productSeq: number
  productCode: string
  productName: string
  productStatus: string
  basePrice: number
  shortDesc: string
  mainImageUrl?: string
  labels: string[]
}
export interface CategoryRefDto {
  categorySeq: number
  categoryName: string
  urlSlug: string
}
export interface ProductImageDto {
  imageSeq: number
  imageType: string // MAIN/SUB/DETAIL
  imageUrl: string
  imageAlt?: string
  sortOrder: number
}
export interface ProductOptionDto {
  optionSeq: number
  optionName: string
  finalPrice: number
  stockQty: number
  sortOrder: number
}
export interface ReviewSummaryDto {
  count: number
  averageRating: number
}
export interface ProductDetailDto {
  productSeq: number
  productCode: string
  productName: string
  productStatus: string
  basePrice: number
  shortDesc: string
  detailDesc?: string
  ingredientInfo?: string
  usageInfo?: string
  category?: CategoryRefDto
  images: ProductImageDto[]
  options: ProductOptionDto[]
  labels: string[]
  reviewSummary?: ReviewSummaryDto
}
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/* ─── 프레젠테이션 파생 (디자인 보존) ─────────────────────── */
const PALETTE: [grad: string, accent: string][] = [
  ['linear-gradient(155deg, #3a2e58 0%, #4d3470 45%, #9a7fb8 100%)', '#9a7fb8'],
  ['linear-gradient(165deg, #2d2347 0%, #3a2552 50%, #6b4d8f 100%)', '#6b4d8f'],
  ['linear-gradient(140deg, #352a50 0%, #4d3470 60%, #c4b0d8 100%)', '#c4b0d8'],
  ['linear-gradient(170deg, #4d3470 0%, #9a7fb8 50%, #e8d8f0 100%)', '#e8d8f0'],
  ['linear-gradient(160deg, #2d2347 0%, #352a50 40%, #4d3470 100%)', '#4d3470'],
  ['linear-gradient(180deg, #6b4d8f 0%, #c4b0d8 60%, #f5edf7 100%)', '#c4b0d8'],
]
export function productPalette(seq: number): { grad: string; accent: string } {
  const [grad, accent] = PALETTE[seq % PALETTE.length]
  return { grad, accent }
}

/* ─── 뷰모델 ──────────────────────────────────────────── */
// 카탈로그 필터용 카테고리(뷰모델) — API 필터는 categorySeq 기준.
export interface CatalogCategory {
  categorySeq: number | null // null = 전체
  name: string
  slug: string
}
export interface ProductDetailVM extends Product {
  reviewSummary: ReviewSummaryDto
}
export interface ProductsPage {
  items: ProductSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/* ─── 매퍼 ────────────────────────────────────────────── */
export function toProductSummary(d: ProductListItemDto): ProductSummary {
  const { grad, accent } = productPalette(d.productSeq)
  return {
    id: d.productSeq,
    code: d.productCode,
    name: d.productName,
    nameEn: d.productCode, // API 영문명 없음 → 코드로 대체(Bottle 라벨)
    line: 'MICOZ',
    categoryName: '', // 목록 DTO 엔 카테고리 없음 → Bottle 기본 shape
    basePrice: d.basePrice,
    labels: d.labels ?? [],
    grad,
    accent,
  }
}

export function toProductDetail(d: ProductDetailDto): ProductDetailVM {
  const { grad, accent } = productPalette(d.productSeq)
  const options = [...d.options]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((o) => ({ id: o.optionSeq, name: o.optionName, price: o.finalPrice, stockQty: o.stockQty, sortOrder: o.sortOrder }))
  return {
    id: d.productSeq,
    code: d.productCode,
    name: d.productName,
    nameEn: d.productCode,
    line: 'MICOZ',
    categoryName: d.category?.categoryName ?? '',
    basePrice: d.basePrice,
    shortDesc: d.shortDesc,
    status: d.productStatus as ProductStatus,
    options: options.length ? options : [{ id: 0, name: '기본', price: d.basePrice }],
    labels: d.labels ?? [],
    detailDesc: d.detailDesc,
    ingredientInfo: d.ingredientInfo,
    usageInfo: d.usageInfo,
    grad,
    accent,
    reviewSummary: d.reviewSummary ?? { count: 0, averageRating: 0 },
    images: [...(d.images ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i): ProductImage => ({ id: i.imageSeq, type: i.imageType as ImageType, url: i.imageUrl, alt: i.imageAlt, sortOrder: i.sortOrder })),
  }
}

// 백엔드 /products?categorySeq 필터는 정확 일치(자식 롤업 없음)이고 상품은 리프 카테고리에 속한다.
// 따라서 필터 칩은 '리프' 카테고리로 구성해야 결과가 나온다(상위 카테고리로 거르면 0건).
export function toCatalogCategories(nodes: CategoryNodeDto[]): CatalogCategory[] {
  const flat: CatalogCategory[] = [{ categorySeq: null, name: '전체', slug: 'all' }]
  const walk = (ns: CategoryNodeDto[]) => {
    for (const n of ns) {
      if (n.children && n.children.length) walk(n.children)
      else flat.push({ categorySeq: n.categorySeq, name: n.categoryName, slug: n.urlSlug })
    }
  }
  walk(nodes)
  return flat
}

/* ─── API 함수 ────────────────────────────────────────── */
export interface ProductsParams {
  categorySeq?: number | null
  page?: number
  size?: number
  sort?: string
}

function getCategoriesApi(): Promise<CategoryNodeDto[]> {
  return apiGet<CategoryNodeDto[]>('/categories')
}
function getProductsApi(params: ProductsParams): Promise<PageDto<ProductListItemDto>> {
  const q: Record<string, string | number> = {}
  if (params.categorySeq != null) q.categorySeq = params.categorySeq
  if (params.page != null) q.page = params.page
  if (params.size != null) q.size = params.size
  if (params.sort) q.sort = params.sort
  return apiGet<PageDto<ProductListItemDto>>('/products', { params: q })
}
function getProductApi(seq: number | string): Promise<ProductDetailDto> {
  return apiGet<ProductDetailDto>(`/products/${seq}`)
}

/* ─── React Query 훅 ──────────────────────────────────── */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesApi,
    select: toCatalogCategories,
    staleTime: 5 * 60_000, // 카테고리는 거의 변하지 않음
  })
}

export function useProducts(params: ProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProductsApi(params),
    placeholderData: keepPreviousData, // 필터/페이지 전환 시 깜빡임 방지
    select: (d): ProductsPage => ({
      items: d.content.map(toProductSummary),
      page: d.page,
      size: d.size,
      totalElements: d.totalElements,
      totalPages: d.totalPages,
    }),
  })
}

export function useProduct(seq: number | string | undefined) {
  return useQuery({
    queryKey: ['product', String(seq)],
    queryFn: () => getProductApi(seq!),
    enabled: seq != null && seq !== '',
    select: toProductDetail,
  })
}

/* ═══════════════════════════════════════════════════════════
 * Phase 2b — 배너(HERO) · 추천/베스트 · 상품 리뷰
 * ═══════════════════════════════════════════════════════════ */

// §4.5 BannerResponse
export interface BannerDto {
  bannerSeq: number
  bannerType: string // "HERO"
  title: string
  description?: string
  imageUrl?: string
  linkUrl?: string
  sortOrder: number
}
// §9.1/§9.2 ReviewResponse
export interface ReviewDto {
  reviewSeq: number
  productSeq: number
  itemSeq: number
  userIdMasked: string
  rating: number
  title?: string
  content: string
  imageUrls: string[]
  createdDate: string
}

// 히어로 뷰모델 — API 텍스트(title/description/linkUrl)만. 배경 이미지는 디자인(컴포넌트가 결정).
// 보고: 원본 히어로의 tag/sub(이탤릭)/body 등 에디토리얼 필드는 Banner API 에 없어 제거(디자인 레이아웃은 유지).
export interface HeroBanner {
  id: number
  title: string
  sub: string // description
  link: string // linkUrl(없으면 /products)
}
export interface ReviewVM {
  id: number
  userMasked: string
  rating: number
  title?: string
  content: string
  imageUrls: string[]
  createdDate: string
}
export interface ReviewsPage {
  items: ReviewVM[]
  page: number
  totalElements: number
  totalPages: number
}

export function toHeroBanner(d: BannerDto): HeroBanner {
  return { id: d.bannerSeq, title: d.title, sub: d.description ?? '', link: d.linkUrl || '/products' }
}
export function toReview(d: ReviewDto): ReviewVM {
  return { id: d.reviewSeq, userMasked: d.userIdMasked, rating: d.rating, title: d.title, content: d.content, imageUrls: d.imageUrls ?? [], createdDate: d.createdDate }
}

function getBannersApi(): Promise<BannerDto[]> {
  return apiGet<BannerDto[]>('/banners')
}
function getFeaturedApi(label: string, limit: number): Promise<ProductListItemDto[]> {
  return apiGet<ProductListItemDto[]>('/products/featured', { params: { label, limit } })
}
function getReviewsApi(seq: number | string, page: number, size: number): Promise<PageDto<ReviewDto>> {
  return apiGet<PageDto<ReviewDto>>(`/products/${seq}/reviews`, { params: { page, size, sort: 'reviewSeq,desc' } })
}

export function useBanners() {
  return useQuery({
    queryKey: ['banners'],
    queryFn: getBannersApi,
    select: (d) => d.map(toHeroBanner),
    staleTime: 5 * 60_000,
  })
}

export function useFeatured(label = 'BEST', limit = 4) {
  return useQuery({
    queryKey: ['featured', label, limit],
    queryFn: () => getFeaturedApi(label, limit),
    select: (d) => d.map(toProductSummary),
    staleTime: 60_000,
  })
}

export function useReviews(seq: number | string | undefined, page: number, size = 5) {
  return useQuery({
    queryKey: ['reviews', String(seq), page, size],
    queryFn: () => getReviewsApi(seq!, page, size),
    enabled: seq != null && seq !== '',
    placeholderData: keepPreviousData,
    select: (d): ReviewsPage => ({ items: d.content.map(toReview), page: d.page, totalElements: d.totalElements, totalPages: d.totalPages }),
  })
}
