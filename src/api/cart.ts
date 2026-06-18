// 서버 장바구니 API — 출처 계약: docs/micoz_api.md §5 + Swagger 교차확인.
// 어댑터: flat CartItemResponse → 기존 CartItem 뷰모델({cartId, product, option, quantity}).
//   cartSeq→cartId(string), 프레젠테이션 grad/accent 는 productSeq 팔레트로 파생(카탈로그와 일관).
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import { productPalette } from './catalog'
import type { CartItem, ProductSummary, ProductOption } from '../lib/data'

/* ─── DTO (Swagger 그대로) ─────────────────────────────── */
export interface AddCartRequest {
  productSeq: number
  optionSeq?: number
  quantity: number
}
export interface UpdateCartQuantityRequest {
  quantity: number
}
export interface CartItemDto {
  cartSeq: number
  productSeq: number
  productCode: string
  productName: string
  optionSeq?: number
  optionName?: string
  unitPrice: number
  quantity: number
  itemTotal: number
  mainImageUrl?: string
}
export interface CartListDto {
  items: CartItemDto[]
  itemCount: number
  totalAmount: number
}

/* ─── 매퍼 ────────────────────────────────────────────── */
export function toCartItem(d: CartItemDto): CartItem {
  const { grad, accent } = productPalette(d.productSeq)
  const product: ProductSummary = {
    id: d.productSeq,
    code: d.productCode,
    name: d.productName,
    nameEn: d.productCode,
    line: 'MICOZ',
    categoryName: '',
    basePrice: d.unitPrice,
    labels: [],
    grad,
    accent,
  }
  const option: ProductOption = { id: d.optionSeq ?? 0, name: d.optionName ?? '기본', price: d.unitPrice }
  return { cartId: String(d.cartSeq), product, option, quantity: d.quantity }
}

/* ─── API 함수 ────────────────────────────────────────── */
function getCartApi(): Promise<CartListDto> {
  return apiGet<CartListDto>('/cart')
}
export function addCartApi(body: AddCartRequest): Promise<CartItemDto> {
  return apiPost<CartItemDto>('/cart', body)
}
function patchCartApi(cartSeq: number, quantity: number): Promise<CartItemDto> {
  return apiPatch<CartItemDto>(`/cart/${cartSeq}`, { quantity } satisfies UpdateCartQuantityRequest)
}
function deleteCartApi(cartSeq: number): Promise<void> {
  return apiDelete<void>(`/cart/${cartSeq}`)
}

/* ─── 서버 카트 훅 ────────────────────────────────────── */
// enabled=false(비로그인)면 쿼리 비활성. 뮤테이션 성공 시 카트 쿼리 invalidate.
export function useServerCart(enabled: boolean) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['cart'],
    queryFn: getCartApi,
    enabled,
    select: (d): CartItem[] => d.items.map(toCartItem),
  })
  const invalidate = () => qc.invalidateQueries({ queryKey: ['cart'] })
  const addM = useMutation({ mutationFn: (v: AddCartRequest) => addCartApi(v), onSuccess: invalidate })
  const patchM = useMutation({ mutationFn: (v: { cartSeq: number; quantity: number }) => patchCartApi(v.cartSeq, v.quantity), onSuccess: invalidate })
  const delM = useMutation({ mutationFn: (cartSeq: number) => deleteCartApi(cartSeq), onSuccess: invalidate })

  const items = query.data ?? []

  return {
    items,
    add: (product: ProductSummary, option: ProductOption, qty = 1): Promise<unknown> =>
      addM.mutateAsync({ productSeq: product.id, optionSeq: option.id > 0 ? option.id : undefined, quantity: qty }),
    // 빠른 담기 — 옵션 미지정으로 담기 시도. 옵션 필수 상품은 서버가 CART_OPTION_REQUIRED 반환(호출부가 상세로 유도).
    quickAdd: (product: ProductSummary, qty = 1): Promise<unknown> =>
      addM.mutateAsync({ productSeq: product.id, quantity: qty }),
    updateQty: (cartId: string, qty: number): Promise<unknown> => patchM.mutateAsync({ cartSeq: Number(cartId), quantity: qty }),
    remove: (cartId: string): Promise<unknown> => delM.mutateAsync(Number(cartId)),
    clear: async (): Promise<void> => {
      await Promise.all(items.map((i) => deleteCartApi(Number(i.cartId))))
      invalidate()
    },
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}
