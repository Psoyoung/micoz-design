// 리뷰(Reviews) 작성/내 리뷰 API — 출처 계약: docs/micoz_api.md §9.1·§9.3 + Swagger 교차확인.
// 상품 리뷰 조회(§9.2)는 catalog.ts(useReviews)에 이미 존재 — 작성 성공 시 해당 캐시도 무효화.
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { apiGet, apiPost, ApiError } from './client'
import { catalogErrorMessage, type ReviewVM, toReview, type ReviewDto } from './catalog'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface CreateReviewRequest {
  itemSeq: number
  rating: number // 1~5
  title?: string
  content: string
  imageUrls?: string[]
}
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface MyReviewVM extends ReviewVM {
  productSeq: number
  itemSeq: number
}
export interface MyReviewsPageVM {
  items: MyReviewVM[]
  page: number
  totalElements: number
  totalPages: number
}

function toMyReview(d: ReviewDto): MyReviewVM {
  return { ...toReview(d), productSeq: d.productSeq, itemSeq: d.itemSeq }
}

/* ─── 에러 문구 ───────────────────────────────────────── */
export function reviewErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.code === 'REVIEW_ALREADY_WRITTEN') return '이미 작성한 리뷰입니다.'
    if (err.code === 'REVIEW_NOT_ALLOWED') return '배송 완료된 본인 주문 상품만 리뷰를 작성할 수 있습니다.'
    if (err.code === 'COMMON_VALIDATION_ERROR') return err.message
  }
  return catalogErrorMessage(err)
}

/* ─── API 함수 ────────────────────────────────────────── */
function getMyReviewsApi(page: number, size: number): Promise<PageDto<ReviewDto>> {
  return apiGet<PageDto<ReviewDto>>('/me/reviews', { params: { page, size, sort: 'reviewSeq,desc' } })
}
function createReviewApi(body: CreateReviewRequest): Promise<ReviewDto> {
  return apiPost<ReviewDto>('/reviews', body)
}

/* ─── React Query 훅 ──────────────────────────────────── */
export function useMyReviews(enabled: boolean, page = 0, size = 10) {
  return useQuery({
    queryKey: ['my-reviews', page, size],
    queryFn: () => getMyReviewsApi(page, size),
    enabled,
    placeholderData: keepPreviousData,
    select: (d): MyReviewsPageVM => ({ items: d.content.map(toMyReview), page: d.page, totalElements: d.totalElements, totalPages: d.totalPages }),
  })
}
export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateReviewRequest) => createReviewApi(body),
    onSuccess: (review) => {
      void qc.invalidateQueries({ queryKey: ['my-reviews'] })
      void qc.invalidateQueries({ queryKey: ['reviews', String(review.productSeq)] }) // 상품 리뷰 목록(catalog useReviews)
      void qc.invalidateQueries({ queryKey: ['product', String(review.productSeq)] }) // 리뷰 요약(평점/개수)
    },
  })
}
