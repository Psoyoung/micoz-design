// 찜(Favorites) API — 출처 계약: docs/micoz_api.md §6 + Swagger 교차확인.
// 어댑터: ToggleFavResponse {productSeq, favorited}, 찜 목록은 PageResponse<ProductListItem>(§4.2 형식) → ProductSummary 재사용.
// 모든 엔드포인트 인증 필요. 비로그인 클릭은 컴포넌트에서 /login 유도.
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiPost, apiDelete } from './client'
import { toProductSummary, type ProductListItemDto } from './catalog'
import { useAuth } from '../auth/AuthContext'
import type { ProductSummary } from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface ToggleFavDto {
  productSeq: number
  favorited: boolean
}
interface PageDto<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/* ─── 뷰모델 ──────────────────────────────────────────── */
export interface FavoritesPage {
  items: ProductSummary[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/* ─── API 함수 ────────────────────────────────────────── */
function toggleFavoriteApi(productSeq: number): Promise<ToggleFavDto> {
  return apiPost<ToggleFavDto>(`/me/favorites/${productSeq}`, undefined)
}
function unfavoriteApi(productSeq: number): Promise<void> {
  return apiDelete<void>(`/me/favorites/${productSeq}`)
}
function getFavoritesApi(page: number, size: number): Promise<PageDto<ProductListItemDto>> {
  return apiGet<PageDto<ProductListItemDto>>('/me/favorites', { params: { page, size, sort: 'productSeq,desc' } })
}

/* ─── React Query 훅 ──────────────────────────────────── */
// 찜 여부 판별용 id 집합 — 단일 상품 찜 상태 조회 엔드포인트가 없어 목록(첫 페이지 큰 size)으로 파생.
const FAV_IDS_KEY = ['favoriteIds'] as const
const FAV_LIST_KEY = ['favorites'] as const

export function useFavoriteIds(enabled: boolean) {
  // 캐시 데이터 자체를 Set 으로 저장(낙관적 setQueryData 가 Set 을 직접 갱신할 수 있도록 select 사용 안 함).
  return useQuery({
    queryKey: FAV_IDS_KEY,
    queryFn: async (): Promise<Set<number>> => {
      const d = await getFavoritesApi(0, 200)
      return new Set(d.content.map((p) => p.productSeq))
    },
    enabled,
    staleTime: 30_000,
  })
}

// mypage 찜 목록(페이징).
export function useFavorites(enabled: boolean, page = 0, size = 12) {
  return useQuery({
    queryKey: [...FAV_LIST_KEY, page, size],
    queryFn: () => getFavoritesApi(page, size),
    enabled,
    placeholderData: keepPreviousData,
    select: (d): FavoritesPage => ({
      items: d.content.map(toProductSummary),
      page: d.page,
      size: d.size,
      totalElements: d.totalElements,
      totalPages: d.totalPages,
    }),
  })
}

// 찜 토글(낙관적) — id 집합을 즉시 갱신, 응답으로 확정, 목록 무효화.
export function useToggleFavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productSeq: number) => toggleFavoriteApi(productSeq),
    onMutate: async (seq) => {
      await qc.cancelQueries({ queryKey: FAV_IDS_KEY })
      const prev = qc.getQueryData<Set<number>>(FAV_IDS_KEY)
      qc.setQueryData<Set<number>>(FAV_IDS_KEY, (old) => {
        const set = new Set(old ?? [])
        if (set.has(seq)) set.delete(seq)
        else set.add(seq)
        return set
      })
      return { prev }
    },
    onError: (_e, _seq, ctx) => {
      if (ctx?.prev) qc.setQueryData(FAV_IDS_KEY, ctx.prev)
    },
    onSuccess: (data) => {
      qc.setQueryData<Set<number>>(FAV_IDS_KEY, (old) => {
        const set = new Set(old ?? [])
        if (data.favorited) set.add(data.productSeq)
        else set.delete(data.productSeq)
        return set
      })
      void qc.invalidateQueries({ queryKey: FAV_LIST_KEY }) // 찜 목록(페이지) 새로고침
    },
  })
}

// 카드/상세 찜 버튼용 — 멤버십(faved) + 토글 액션을 한 번에. 비로그인 클릭은 /login 유도.
export function useFavoriteButton() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const idsQ = useFavoriteIds(isAuthenticated)
  const toggle = useToggleFavorite()
  const favIds = idsQ.data ?? new Set<number>()
  return {
    isFav: (productSeq: number) => favIds.has(productSeq),
    onToggle: (productSeq: number) => {
      if (!isAuthenticated) {
        navigate('/login')
        return
      }
      toggle.mutate(productSeq)
    },
  }
}

// 명시 해제(찜 목록에서 제거) — 멱등.
export function useUnfavorite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productSeq: number) => unfavoriteApi(productSeq),
    onSuccess: (_d, seq) => {
      qc.setQueryData<Set<number>>(FAV_IDS_KEY, (old) => {
        if (!old) return old
        const set = new Set(old)
        set.delete(seq)
        return set
      })
      void qc.invalidateQueries({ queryKey: FAV_LIST_KEY })
    },
  })
}
